import { db } from '$lib/db';
import { pageContent, resource, resourceMedia, file } from '$lib/db/schema';
import { eq, desc, or, ilike } from 'drizzle-orm';
import { uploadAndSaveFile, uploadAndSaveBuffer } from '$lib/server/minio';
import sharp from 'sharp';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
  const [content, resources] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, '/resources')
    }),
    db.query.resource.findMany({
      orderBy: [desc(resource.createdAt)],
      with: {
        coverImage: true,
        media: {
          with: {
            file: true
          }
        }
      }
    })
  ]);

  return {
    meta: {
      title: content?.title,
      description: content?.description,
      ogImage: content?.ogImage
    },
    content: content?.data ? JSON.parse(content.data) : null,
    resources
  };
};

export const actions: Actions = {
  saveMeta: async ({ request, locals }) => {
    const user = await locals.user;
    if (!user || user.role !== 'admin') return fail(401);

    const formData = await request.formData();
    const data = formData.get('data') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ogImage = formData.get('ogImage') as string;

    await db.insert(pageContent).values({
      path: '/resources',
      data,
      title,
      description,
      ogImage,
      updatedBy: user.id,
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: pageContent.path,
      set: {
        data,
        title,
        description,
        ogImage,
        updatedBy: user.id,
        updatedAt: new Date()
      }
    });

    return { success: true };
  },

  upsertResource: async ({ request, locals }) => {
    const user = await locals.user;
    if (!user || user.role !== 'admin') return fail(401);

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const publishedDateStr = formData.get('publishedDate') as string;
    const coverImageId = formData.get('coverImageId') as string;
    const fileId = formData.get('fileId') as string;

    const publishedDate = publishedDateStr ? new Date(publishedDateStr) : new Date();

    const resourceData = {
      title,
      description,
      category,
      publishedDate,
      coverImageId: coverImageId || null,
    };

    let resourceId = id;

    if (id) {
      await db.update(resource).set(resourceData).where(eq(resource.id, id));
      // Update media if provided
      if (fileId) {
        // Simple case: clear existing and add new for this resource
        await db.delete(resourceMedia).where(eq(resourceMedia.resourceId, id));
        await db.insert(resourceMedia).values({
          resourceId: id,
          fileId
        });
      }
    } else {
      const [newResource] = await db.insert(resource).values(resourceData).returning();
      resourceId = newResource.id;
      if (fileId) {
        await db.insert(resourceMedia).values({
          resourceId,
          fileId
        });
      }
    }

    return { success: true, resourceId };
  },

  deleteResource: async ({ request, locals }) => {
    const user = await locals.user;
    if (!user || user.role !== 'admin') return fail(401);

    const formData = await request.formData();
    const id = formData.get('id') as string;
    if (!id) return fail(400);

    await db.delete(resource).where(eq(resource.id, id));
    return { success: true };
  },

  uploadImage: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    if (!file) return fail(400, { error: 'No image provided' });

    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const resizedBuffer = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      const result = await uploadAndSaveBuffer(resizedBuffer, 'image/webp', file.name);
      return { success: true, image: { ...result, id: result.dbId } };
    } catch (error) {
      console.error('Upload error:', error);
      return fail(500, { error: 'Upload failed' });
    }
  },

  uploadFile: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return fail(400, { error: 'No file provided' });

    try {
      const result = await uploadAndSaveFile(file);
      return { success: true, file: { ...result, id: result.dbId } };
    } catch (error) {
      console.error('File upload error:', error);
      return fail(500, { error: 'Upload failed' });
    }
  }
};
