import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/drizzle';
import { educationItem } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ params, locals }) => {
  const session = await locals.auth();
  if (locals.user?.role !== 'admin') {
    throw error(403, 'Unauthorized');
  }

  const id = params.id;
  let article = null;

  if (id) {
    const items = await db.select().from(educationItem).where(eq(educationItem.id, id));
    if (items.length === 0) {
      throw error(404, 'Article not found');
    }
    article = items[0];
  }

  return {
    article
  };
};
