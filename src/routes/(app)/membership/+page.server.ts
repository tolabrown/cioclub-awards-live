import { db } from '$lib/db';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { MEMBERSHIP_DEFAULT } from '$lib/constants/defaults';

const PATH = '/membership';

export const load: PageServerLoad = async () => {
  const contentRecord = await db.query.pageContent.findFirst({
    where: eq(pageContent.path, PATH)
  });

  const rawData = contentRecord?.data ? JSON.parse(contentRecord.data) : MEMBERSHIP_DEFAULT;

  return {
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    content: rawData
  };
};

export const actions: Actions = {};
