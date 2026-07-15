import { db } from '$lib/db';
import { pageContent, news, newsletterSubscriber } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

const PATH = '/news';

export const load: PageServerLoad = async () => {
  let content = null;
  let newsItems: any[] = [];

  try {
    const results = await Promise.all([
      db.query.pageContent.findFirst({
        where: eq(pageContent.path, PATH)
      }),
      db.query.news.findMany({
        with: {
          image: true
        },
        orderBy: [desc(news.createdAt)]
      })
    ]);
    content = results[0];
    newsItems = results[1];
  } catch (err) {
    console.error("News Page DB Error:", err);
  }

  return {
    meta: content ? {
      title: content.title,
      description: content.description,
      ogImage: content.ogImage
    } : null,
    hero: content?.data ? JSON.parse(content.data).hero : null,
    newsItems
  };
};

export const actions: Actions = {
  subscribe: async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get('email') as string;

    if (!email || !email.includes('@')) {
      return fail(400, { message: 'Invalid email address' });
    }

    try {
      // Check if already subscribed
      const existing = await db.query.newsletterSubscriber.findFirst({
        where: eq(newsletterSubscriber.email, email)
      });

      if (existing) {
        return fail(400, {
          message: 'You are already subscribed to our newsletter.',
          already_subscribed: true
        });
      }

      await db.insert(newsletterSubscriber).values({
        email
      });

      return { success: true };
    } catch (error) {
      console.error('[Newsletter Subscribe Error]:', error);
      return fail(500, { message: 'Something went wrong. Please try again later.' });
    }
  }
};
