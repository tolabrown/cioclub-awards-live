import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db';
import { pageContent, event, trustee } from '$lib/db/schema';
import { eq, or, ilike, sql, desc } from 'drizzle-orm';
import { uploadAndSaveFile, deleteAndRemoveFile, uploadAndSaveBuffer } from '$lib/server/minio';
import sharp from 'sharp';
import type { PageServerLoad } from './$types';
import { logActivity } from '$lib/server/activity-log';

const PATH = '/events';

export const load: PageServerLoad = async () => {
  const [contentRecord, events, trustees] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.event.findMany({
      orderBy: [desc(event.date)],
      with: {
        coverImage: true,
        image: true
      }
    }),
    db.query.trustee.findMany({
      limit: 10,
      with: {
        image: true
      }
    })
  ]);

  const rawContent = contentRecord ? JSON.parse(contentRecord.data) : null;

  // If we have board members selected, fetch their full details
  if (rawContent?.board && rawContent.board.length > 0) {
    const trusteeIds = rawContent.board.map((b: any) => b.trusteeId).filter(Boolean);
    if (trusteeIds.length > 0) {
      const selectedTrustees = await db.query.trustee.findMany({
        where: sql`${trustee.id} IN (${sql.join(trusteeIds.map((id: string) => sql`${id}`), sql`, `)})`,
        with: {
          image: true
        }
      });

      // Map the full trustee object back to the board items for SearchableSelect
      rawContent.board = rawContent.board.map((b: any) => {
        const fullTrustee = selectedTrustees.find(t => t.id === b.trusteeId);
        return {
          ...b,
          trustee: fullTrustee || null
        };
      });
    }
  }

  // Extract unique years from events for filtering
  const availableYears = [...new Set(events.map(e => new Date(e.date).getFullYear()))].sort((a, b) => b - a);

  return {
    content: rawContent,
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    events: events || [],
    trustees: trustees || [],
    availableYears,
    path: PATH
  };
};

export const actions: Actions = {
  save: async ({ request, locals }) => {
    const formData = await request.formData();
    const data = formData.get('data') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ogImage = formData.get('ogImage') as string;

    if (!data) {
      return fail(400, { error: 'Missing content data' });
    }

    try {
      const existing = await db.query.pageContent.findFirst({
        where: eq(pageContent.path, PATH)
      });

      if (existing) {
        await db.update(pageContent)
          .set({
            data,
            title,
            description,
            ogImage,
            updatedAt: new Date(),
            updatedBy: locals.user?.id
          })
          .where(eq(pageContent.path, PATH));
      } else {
        await db.insert(pageContent).values({
          path: PATH,
          data,
          title,
          description,
          ogImage,
          updatedBy: locals.user?.id
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Save error:', error);
      return fail(500, { error: 'Failed to save events page content' });
    }
  },

  saveEvent: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dateStr = formData.get('date') as string;
    const location = formData.get('location') as string;
    const status = formData.get('status') as string || 'upcoming';
    const registrationLink = formData.get('registrationLink') as string;
    const imageFile = formData.get('image') as File;
    const existingImageId = formData.get('imageId') as string;
    const coverImageFile = formData.get('coverImage') as File;
    const existingCoverImageId = formData.get('coverImageId') as string;

    if (!title || !dateStr) {
      return fail(400, { error: 'Missing required fields' });
    }

    try {
      let imageId = existingImageId;
      if (imageFile && imageFile.size > 0) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const resizedBuffer = await sharp(buffer)
          .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        if (existingImageId) await deleteAndRemoveFile(existingImageId);
        const result = await uploadAndSaveBuffer(resizedBuffer, 'image/webp', imageFile.name);
        imageId = result.dbId;
      }

      let coverImageId = existingCoverImageId;
      if (coverImageFile && coverImageFile.size > 0) {
        const arrayBuffer = await coverImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const resizedBuffer = await sharp(buffer)
          .resize(1920, 1080, { fit: 'cover' })
          .webp({ quality: 80 })
          .toBuffer();
        if (existingCoverImageId) await deleteAndRemoveFile(existingCoverImageId);
        const result = await uploadAndSaveBuffer(resizedBuffer, 'image/webp', coverImageFile.name);
        coverImageId = result.dbId;
      }

      const date = new Date(dateStr);

      if (id) {
        await db.update(event)
          .set({
            title,
            description,
            date,
            location,
            status,
            registrationLink: registrationLink || null,
            imageId: imageId || null,
            coverImageId: coverImageId || null,
            updatedAt: new Date()
          })
          .where(eq(event.id, id));
      } else {
        await db.insert(event).values({
          title,
          description,
          date,
          location,
          status,
          registrationLink: registrationLink || null,
          imageId: imageId || null,
          coverImageId: coverImageId || null
        });
      }

      await logActivity(locals, {
        action: `${id ? 'Updated' : 'Created'} event: ${title}`,
        entityType: 'EVENT',
        entityId: id || 'new',
        operation: id ? 'UPDATE' : 'CREATE',
        metadata: { title, status }
      });

      return { success: true };
    } catch (error) {
      console.error('Event save error:', error);
      return fail(500, { error: 'Failed to save event' });
    }
  },

  deleteEvent: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing event ID' });

    try {
      const eventData = await db.query.event.findFirst({
        where: eq(event.id, id)
      });

      if (eventData) {
        // Safe cleanup - don't fail if files are already gone
        try {
          if (eventData.imageId) await deleteAndRemoveFile(eventData.imageId);
          if (eventData.coverImageId) await deleteAndRemoveFile(eventData.coverImageId);
        } catch (fileError) {
          console.error('File cleanup error during event delete:', fileError);
        }

        await db.delete(event).where(eq(event.id, id));

        await logActivity(locals, {
          action: `Deleted event: ${eventData.title}`,
          entityType: 'EVENT',
          entityId: id,
          operation: 'DELETE',
          metadata: { title: eventData.title }
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Event delete error:', error);
      return fail(500, { error: 'Failed to delete event' });
    }
  },

  searchTrustees: async ({ url }) => {
    const query = url.searchParams.get('q') || '';
    if (!query) return { results: [] };

    try {
      const results = await db.query.trustee.findMany({
        where: or(
          ilike(trustee.name, `%${query}%`),
          ilike(trustee.role, `%${query}%`)
        ),
        limit: 10,
        with: {
          image: true
        }
      });
      return { results };
    } catch (error) {
      console.error('Trustee search error:', error);
      return fail(500, { error: 'Search failed' });
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
      console.error('Upload error:', error);
      return fail(500, { error: 'Upload failed' });
    }
  }
};
