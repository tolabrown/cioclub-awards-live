import { db } from '$lib/db/drizzle';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { PRIVACY_DEFAULT } from '$lib/constants/defaults';

export const load: PageServerLoad = async () => {
  const results = await db.select().from(pageContent).where(eq(pageContent.path, '/privacy')).limit(1);
  const content = results[0];

  return {
    page: content ? {
      ...content,
      data: JSON.parse(content.data)
    } : {
      path: '/privacy',
      title: PRIVACY_DEFAULT.title,
      description: PRIVACY_DEFAULT.description,
      data: PRIVACY_DEFAULT
    }
  };
};
