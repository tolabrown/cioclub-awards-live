import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db';
import { pageContent, trustee } from '$lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { uploadAndSaveFile, deleteAndRemoveFile } from '$lib/server/minio';
import type { PageServerLoad } from './$types';

const PATH = '/team';

export const load: PageServerLoad = async () => {
  const [content, trustees] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.trustee.findMany({
      orderBy: [asc(trustee.displayOrder)],
      with: {
        image: true
      }
    })
  ]);

  return {
    content: content ? JSON.parse(content.data) : null,
    meta: content ? {
      title: content.title,
      description: content.description,
      ogImage: content.ogImage
    } : null,
    trustees: trustees.map(t => ({
      ...t,
      image: t.image?.url || null
    })),
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
      const parsedData = JSON.parse(data);

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
      return fail(500, { error: 'Failed to save team page content' });
    }
  },

  upsertTrustee: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const position = formData.get('position') as string;
    const role = formData.get('role') as string;
    const bio = formData.get('bio') as string;
    const imageId = formData.get('imageId') as string;
    const linkedinUrl = formData.get('linkedinUrl') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string || '0');

    if (!name || !position || !bio) {
      return fail(400, { error: 'Missing required trustee fields' });
    }

    const trusteeData: any = {
      name,
      position,
      role,
      bio,
      imageId: imageId || null,
      linkedinUrl: linkedinUrl || null,
      displayOrder,
    };

    try {
      if (id && id !== 'new') {
        await db.update(trustee)
          .set(trusteeData)
          .where(eq(trustee.id, id));
      } else {
        await db.insert(trustee)
          .values({
            ...trusteeData,
            id: crypto.randomUUID()
          });
      }
      return { success: true };
    } catch (error) {
      console.error('Trustee upsert error:', error);
      return fail(500, { error: 'Failed to save trustee' });
    }
  },

  deleteTrustee: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing trustee ID' });

    try {
      await db.delete(trustee).where(eq(trustee.id, id));
      return { success: true };
    } catch (error) {
      console.error('Trustee delete error:', error);
      return fail(500, { error: 'Failed to delete trustee' });
    }
  },

  deleteImage: async ({ request }) => {
    const formData = await request.formData();
    const imageId = formData.get('imageId') as string;

    if (!imageId) return fail(400, { error: 'Missing image ID' });

    try {
      await deleteAndRemoveFile(imageId);
      return { success: true };
    } catch (error) {
      console.error('Delete image error:', error);
      return fail(500, { error: 'Failed to delete image' });
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
