import { getPageContent } from '$lib/db/pages';
import { LIT_DEFAULT } from '$lib/constants/defaults';
import { db } from '$lib/db/drizzle';
import { ladiesInTechEvents, ladiesInTechArchives, partner } from '$lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export const load = async () => {
  const [page, events, archives, partners] = await Promise.all([
    getPageContent('/ladies-in-tech', LIT_DEFAULT),
    db.select().from(ladiesInTechEvents).orderBy(desc(ladiesInTechEvents.date)),
    db.select().from(ladiesInTechArchives).orderBy(desc(ladiesInTechArchives.year), desc(ladiesInTechArchives.createdAt)),
    db.query.partner.findMany({
      where: eq(partner.category, 'LadiesInTech'),
      orderBy: partner.displayOrder,
      with: { logo: true }
    })
  ]);

  return {
    page,
    events,
    partners,
    archives: archives.map(a => ({
      ...a,
      media: typeof a.media === 'string' ? JSON.parse(a.media || '[]') : a.media || [],
    })),
  };
};
