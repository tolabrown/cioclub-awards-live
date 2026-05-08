import { db } from '$lib/db';
import { news } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const article = await db.query.news.findFirst({
    where: eq(news.id, params.id),
    with: {
      image: true
    }
  });

  if (!article) {
    throw error(404, 'Article not found');
  }

  // Fetch related news (same category)
  const relatedNews = await db.query.news.findMany({
    where: (news, { and, eq, ne }) => and(
      eq(news.category, article.category),
      ne(news.id, article.id)
    ),
    with: { image: true },
    limit: 3,
  });

  return {
    article,
    relatedNews
  };
};
