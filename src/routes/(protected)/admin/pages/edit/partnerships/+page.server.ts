import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { handleFileUpload, uploadAndSaveFile } from '$lib/server/minio';
import type { PageServerLoad } from './$types';

const PATH = '/partnerships';

export const load: PageServerLoad = async () => {
  const content = await db.query.pageContent.findFirst({
    where: eq(pageContent.path, PATH)
  });

  return {
    content: content ? JSON.parse(content.data) : null,
    meta: content ? {
      title: content.title,
      description: content.description,
      ogImage: content.ogImage
    } : null,
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
      return fail(500, { error: 'Failed to save partnerships page content' });
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
