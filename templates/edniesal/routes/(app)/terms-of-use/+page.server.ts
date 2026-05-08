import { db } from '$lib/db/drizzle';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { TERMS_DEFAULT } from '$lib/constants/defaults';

export const load: PageServerLoad = async () => {
  const results = await db.select().from(pageContent).where(eq(pageContent.path, '/terms-of-use')).limit(1);
  const content = results[0];

  return {
    page: content ? {
      ...content,
      data: JSON.parse(content.data)
    } : {
      path: '/terms-of-use',
      title: TERMS_DEFAULT.title,
      description: TERMS_DEFAULT.description,
      data: TERMS_DEFAULT
    }
  };
};
