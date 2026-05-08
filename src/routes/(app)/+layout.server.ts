import { db } from '$lib/db';
import { event } from '$lib/db/schema';
import { desc, asc, gte, and } from 'drizzle-orm';
import { getNominationPeriod } from '$lib/server/nomination-period';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const [nominationPeriod, upcomingEvents] = await Promise.all([
    getNominationPeriod(),
    db.query.event.findMany({
      where: gte(event.date, new Date()),
      orderBy: [asc(event.date)],
      limit: 1,
      with: {
        image: true,
        coverImage: true
      }
    })
  ]);

  return {
    user: locals.user,
    popupData: {
      nominationPeriod,
      upcomingEvent: upcomingEvents.length > 0 ? upcomingEvents[0] : null
    }
  };
};
