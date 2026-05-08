import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db';
import { file as fileTable, pageContent, album, albumMedia } from '$lib/db/schema';
import { eq, inArray, and, notInArray } from 'drizzle-orm';
import { deleteAndRemoveFile, uploadAndSaveFile, uploadAndSaveAlbumMedia, deleteAndRemoveAlbumMedia } from '$lib/server/minio';
import type { PageServerLoad } from './$types';

const PATH = '/gallery';

export const load: PageServerLoad = async () => {
  const [contentRecord, albumsList] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.album.findMany({
      with: {
        coverImage: true,
        media: true
      },
      orderBy: (album, { desc }) => [desc(album.year), desc(album.createdAt)]
    })
  ]);

  const parsedContent = contentRecord ? JSON.parse(contentRecord.data) : null;

  // Transform albums to match the frontend state
  const albums = (albumsList || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    location: a.location,
    description: a.description || "",
    year: a.year,
    displayLimit: a.displayLimit,
    date: a.createdAt.toISOString().split('T')[0],
    image: a.coverImage?.url || "",
    coverImageId: a.coverImageId,
    media: (a.media || []).map((m: any) => ({
      id: m.id,
      url: m.url || "",
      fileId: m.id,
      isVisible: m.isVisible ?? true,
      displayOrder: m.displayOrder ?? 0
    }))
  }));

  return {
    content: {
      ...parsedContent,
      albums
    },
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    path: PATH
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const formData = await request.formData();
    const dataString = formData.get('data') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ogImage = formData.get('ogImage') as string;

    if (!dataString) {
      return fail(400, { error: 'Missing content data' });
    }

    try {
      const content = JSON.parse(dataString);
      const { albums = [], ...restContent } = content;

      await db.transaction(async (tx) => {
        // 1. Update Page Content (Banner, SEO, etc.)
        const existingPage = await tx.query.pageContent.findFirst({
          where: eq(pageContent.path, PATH)
        });

        const dbPageData = JSON.stringify(restContent);

        if (existingPage) {
          await tx.update(pageContent)
            .set({
              data: dbPageData,
              title,
              description,
              ogImage,
              updatedAt: new Date(),
              updatedBy: locals.user?.id
            })
            .where(eq(pageContent.path, PATH));
        } else {
          await tx.insert(pageContent).values({
            path: PATH,
            data: dbPageData,
            title,
            description,
            ogImage,
            updatedBy: locals.user?.id
          });
        }

        // 2. Sync Albums (High-Performance Surgical Update)
        const incomingAlbums = albums || [];
        const existingAlbums = await tx.query.album.findMany({
          with: { media: { columns: { id: true, albumId: true, displayOrder: true } } }
        });

        const existingAlbumMap = new Map(existingAlbums.map(a => [a.id, a]));
        const incomingIds = (incomingAlbums as any[]).map(a => a.id).filter(Boolean);

        // Delete albums that are no longer present
        const toDeleteAlbumIds = existingAlbums
          .filter(a => !incomingIds.includes(a.id))
          .map(a => a.id);

        if (toDeleteAlbumIds.length > 0) {
          await tx.delete(album).where(inArray(album.id, toDeleteAlbumIds));
        }

        // Process incoming albums
        for (const albumData of (incomingAlbums as any[])) {
          const existing = albumData.id ? existingAlbumMap.get(albumData.id) : null;
          const slug = albumData.slug ||
            albumData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

          const albumValues = {
            title: albumData.title,
            description: albumData.description,
            location: albumData.location,
            year: albumData.year,
            coverImageId: albumData.coverImageId,
            displayLimit: albumData.displayLimit ? parseInt(albumData.displayLimit) : null,
            slug,
            updatedAt: new Date()
          };

          let currentAlbumId = albumData.id;

          // Only update album if metadata changed
          if (existing) {
            const hasChanged = existing.title !== albumValues.title ||
              existing.location !== albumValues.location ||
              existing.year !== albumValues.year ||
              existing.description !== albumValues.description ||
              existing.coverImageId !== albumValues.coverImageId ||
              existing.displayLimit !== albumValues.displayLimit;

            if (hasChanged) {
              await tx.update(album).set(albumValues).where(eq(album.id, existing.id));
            }
          } else {
            const [newAlbum] = await tx.insert(album).values({
              ...albumValues,
              id: crypto.randomUUID()
            }).returning();
            currentAlbumId = newAlbum.id;
          }

          // --- Media Synchronization ---
          // Fast-path: compare incoming media IDs with current DB IDs.
          // If identical (same IDs, same order), skip ALL media processing.
          const incomingMedia = albumData.media || [];
          const incomingMediaIds = incomingMedia.map((m: any) => m.fileId).filter(Boolean);
          const currentMedia = existing?.media || [];
          const currentMediaIds = currentMedia.map(m => m.id);

          // Check if media list is identical (same items, same order)
          const mediaUnchanged = incomingMediaIds.length === currentMediaIds.length &&
            incomingMediaIds.every((id: string, i: number) => id === currentMediaIds[i]);

          if (!mediaUnchanged) {
            // Only unlink media that was explicitly removed by the user
            const toUnlinkIds = currentMediaIds.filter(id => !incomingMediaIds.includes(id));
            if (toUnlinkIds.length > 0) {
              await tx.update(albumMedia)
                .set({ albumId: null })
                .where(inArray(albumMedia.id, toUnlinkIds));
            }

            // Only update media that needs a new albumId, displayOrder, or isVisible
            const mediaToUpdate = incomingMedia
              .map((m: any, index: number) => ({ id: m.fileId, albumId: currentAlbumId, displayOrder: index, isVisible: m.isVisible !== false }))
              .filter((m: any) => {
                const existing = currentMedia.find(em => em.id === m.id);
                return !existing || existing.albumId !== m.albumId || existing.displayOrder !== m.displayOrder;
              });

            // Process in chunks of 100
            for (let i = 0; i < mediaToUpdate.length; i += 100) {
              const chunk = mediaToUpdate.slice(i, i + 100);
              await Promise.all(chunk.map((item: any) =>
                tx.update(albumMedia)
                  .set({ albumId: item.albumId, displayOrder: item.displayOrder, isVisible: item.isVisible })
                  .where(eq(albumMedia.id, item.id))
              ));
            }

            // Also update isVisible for media that didn't change position
            const mediaVisibilityUpdates = incomingMedia
              .filter((m: any) => {
                const existing = currentMedia.find((em: any) => em.id === m.fileId);
                return existing && (existing as any).isVisible !== (m.isVisible !== false);
              })
              .map((m: any) => ({ id: m.fileId, isVisible: m.isVisible !== false }));

            for (const item of mediaVisibilityUpdates) {
              await tx.update(albumMedia)
                .set({ isVisible: item.isVisible })
                .where(eq(albumMedia.id, item.id));
            }
          }
        }
      });

      return { success: true };
    } catch (error) {
      console.error('Save error:', error);
      return fail(500, { error: 'Failed to save gallery content' });
    }
  },

  uploadImage: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return fail(400, { error: 'No image provided' });
    }

    try {
      const result = await uploadAndSaveFile(file);
      return { success: true, image: { ...result, id: result.dbId } };
    } catch (error) {
      console.error('Upload cover error:', error);
      return fail(500, { error: 'Upload failed' });
    }
  },

  deleteCover: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { error: 'No image ID provided' });
    }

    try {
      // First, nullify any album cover references to this file to avoid FK violations
      await db.update(album)
        .set({ coverImageId: null })
        .where(eq(album.coverImageId, id));

      await deleteAndRemoveFile(id);
      return { success: true };
    } catch (error) {
      console.error('Delete cover error:', error);
      return fail(500, { error: 'Delete failed' });
    }
  },

  uploadMedia: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const albumId = formData.get('albumId') as string | null;
    const displayOrder = parseInt(formData.get('displayOrder') as string || '0', 10);

    if (!file) {
      return fail(400, { error: 'No image provided' });
    }

    try {
      const result = await uploadAndSaveAlbumMedia(file);

      // If albumId provided, link immediately — no need to wait for Save
      if (albumId) {
        await db.update(albumMedia)
          .set({ albumId, displayOrder })
          .where(eq(albumMedia.id, result.dbId));
      }

      return { success: true, image: { ...result, id: result.dbId } };
    } catch (error) {
      console.error('Upload media error:', error);
      return fail(500, { error: `Media upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` });
    }
  },

  deleteMedia: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return fail(400, { error: 'No media ID provided' });
    }

    try {
      await deleteAndRemoveAlbumMedia(id);
      return { success: true };
    } catch (error) {
      console.error('Delete media error:', error);
      return fail(500, { error: 'Delete failed' });
    }
  }
};

