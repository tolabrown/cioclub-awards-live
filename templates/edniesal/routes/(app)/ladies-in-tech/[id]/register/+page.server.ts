import { db } from '$lib/db/drizzle';
import { ladiesInTechEvents } from '$lib/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const event = await db.query.ladiesInTechEvents.findFirst({
    where: eq(ladiesInTechEvents.id, params.id),
  });

  if (!event || event.status !== 'upcoming') {
    throw error(404, 'Event registration not available');
  }

  return { event };
};
