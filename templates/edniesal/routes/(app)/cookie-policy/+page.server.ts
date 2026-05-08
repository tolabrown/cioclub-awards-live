import { db } from '$lib/db/drizzle';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { COOKIE_DEFAULT } from '$lib/constants/defaults';

export const load: PageServerLoad = async () => {
  const results = await db.select().from(pageContent).where(eq(pageContent.path, '/cookie-policy')).limit(1);
  const content = results[0];

  return {
    page: content ? {
      ...content,
      data: JSON.parse(content.data)
    } : {
      path: '/cookie-policy',
      title: COOKIE_DEFAULT.title,
      description: COOKIE_DEFAULT.description,
      data: COOKIE_DEFAULT
    }
  };
};
