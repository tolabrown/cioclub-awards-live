import { db } from '$lib/db';
import { event } from '$lib/db/schema';
import { desc, asc, gte, and } from 'drizzle-orm';
import { getNominationPeriod } from '$lib/server/nomination-period';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  let nominationPeriod = null;
  let upcomingEvents: any[] = [];
  try {
    [nominationPeriod, upcomingEvents] = await Promise.all([
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
  } catch (err) {
    console.error("Layout DB Error:", err);
  }


  const rawUser = locals.user ? {
    id: locals.user.id,
    name: locals.user.name,
    email: locals.user.email,
  } : null;

  const rawPopupData = {
    nominationPeriod,
    upcomingEvent: upcomingEvents.length > 0 ? upcomingEvents[0] : null
  };

  return {
    user: rawUser,
    popupData: JSON.parse(JSON.stringify(rawPopupData))
  };
};
