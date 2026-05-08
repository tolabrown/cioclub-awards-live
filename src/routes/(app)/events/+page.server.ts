import { db } from '$lib/db';
import { pageContent, event } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PATH = '/events';

export const load: PageServerLoad = async () => {
  const [contentRecord, eventsList] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.event.findMany({
      orderBy: [desc(event.date)],
      with: {
        image: true,
        coverImage: true
      }
    })
  ]);

  const rawData = contentRecord?.data ? JSON.parse(contentRecord.data) : {
    hero: {
      title: "Signature Events",
      description: "Defining the pulse of Africa's digital leadership through high-impact summits, awards, and communities."
    }
  };

  return {
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    content: rawData,
    events: eventsList
  };
};
