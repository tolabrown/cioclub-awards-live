import { fail, type Actions } from '@sveltejs/kit';
import { db } from '$lib/db';
import { pageContent, news } from '$lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { handleFileUpload, uploadAndSaveFile, deleteAndRemoveFile } from '$lib/server/minio';
import type { PageServerLoad } from './$types';
import { logActivity } from '$lib/server/activity-log';
import { env } from '$env/dynamic/private';

const PATH = '/news';

export const load: PageServerLoad = async () => {
  const [meta, newsItems] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.news.findMany({
      with: { image: true },
      orderBy: [desc(news.createdAt)]
    })
  ]);

  return {
    newsItems,
    meta: meta ? {
      title: meta.title,
      description: meta.description,
      ogImage: meta.ogImage,
      data: meta.data ? JSON.parse(meta.data) : null
    } : null,
    path: PATH
  };
};

export const actions: Actions = {
  saveMeta: async ({ request, locals }) => {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ogImage = formData.get('ogImage') as string;
    const data = formData.get('data') as string;

    try {
      const existing = await db.query.pageContent.findFirst({
        where: eq(pageContent.path, PATH)
      });

      if (existing) {
        await db.update(pageContent)
          .set({
            title,
            description,
            ogImage,
            data,
            updatedAt: new Date(),
            updatedBy: locals.user?.id
          })
          .where(eq(pageContent.path, PATH));

        await logActivity(locals, {
          action: `Updated News page metadata`,
          entityType: "PAGE_CONTENT",
          entityId: PATH,
          operation: "UPDATE"
        });
      } else {
        await db.insert(pageContent).values({
          path: PATH,
          title,
          description,
          ogImage,
          data,
          updatedBy: locals.user?.id
        });

        await logActivity(locals, {
          action: `Created News page metadata`,
          entityType: "PAGE_CONTENT",
          entityId: PATH,
          operation: "CREATE"
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Save meta error:', error);
      return fail(500, { error: 'Failed to save news metadata' });
    }
  },

  upsertNews: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;
    const title = formData.get('title') as string;
    const caption = formData.get('caption') as string;
    const content = formData.get('content') as string;
    const category = formData.get('category') as string;
    const imageId = formData.get('imageId') as string;
    const isFeatured = formData.get('isFeatured') === 'true';

    if (!title || !content || !category) {
      return fail(400, { error: 'Missing required fields' });
    }

    try {
      if (id) {
        await db.update(news)
          .set({ title, caption, content, category, imageId, isFeatured, updatedAt: new Date() })
          .where(eq(news.id, id));

        await logActivity(locals, {
          action: `Updated News Article: ${title}`,
          entityType: "NEWS",
          entityId: id,
          operation: "UPDATE"
        });
      } else {
        await db.insert(news).values({ title, caption, content, category, imageId, isFeatured });
        await logActivity(locals, {
          action: `Created News Article: ${title}`,
          entityType: "NEWS",
          operation: "CREATE"
        });
      }
      return { success: true };
    } catch (error) {
      console.error('Upsert news error:', error);
      return fail(500, { error: 'Failed to save news item' });
    }
  },

  deleteNews: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400, { error: 'Missing news ID' });

    try {
      const item = await db.query.news.findFirst({
        where: eq(news.id, id)
      });

      if (item?.imageId) {
        await deleteAndRemoveFile(item.imageId);
      }

      await db.delete(news).where(eq(news.id, id));

      await logActivity(locals, {
        action: `Deleted News Article: ${item?.title || id}`,
        entityType: "NEWS",
        entityId: id,
        operation: "DELETE"
      });

      return { success: true };
    } catch (error) {
      console.error('Delete news error:', error);
      return fail(500, { error: 'Failed to delete news item' });
    }
  },

  uploadImage: async ({ request }) => {
    const formData = await request.formData();
    const fileArg = formData.get('image') as File;

    if (!fileArg) {
      return fail(400, { error: 'No image provided' });
    }

    try {
      const result = await uploadAndSaveFile(fileArg);
      return { success: true, image: { ...result, id: result.dbId } };
    } catch (error) {
      console.error('Upload error:', error);
      return fail(500, { error: 'Upload failed' });
    }
  },

  generateNews: async ({ request }) => {
    const formData = await request.formData();
    const url = formData.get('url') as string;

    if (!url) {
      return fail(400, { error: 'No URL provided' });
    }

    const webhookUrl = env.NEWS_ARTICLE;
    if (!webhookUrl) {
      console.error('NEWS_ARTICLE environment variable not set');
      return fail(500, { error: 'AI generation service not configured' });
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error(`Webhook failed with status: ${response.status}`);
      }

      let data = await response.json();

      // Handle nested n8n output format: [{ output: { title, caption, body } }]
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        data = data[0].output;
      }

      return data;
    } catch (error) {
      console.error('AI generation error:', error);
      return fail(500, { error: 'Failed to generate article content' });
    }
  }
};
