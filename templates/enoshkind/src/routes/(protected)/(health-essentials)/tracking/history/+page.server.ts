import { db } from '$lib/db/drizzle';
import { healthTracking, mealLog, waterLog, workoutLog } from '$lib/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { startOfDay, subDays } from 'date-fns';

export const load = (async ({ locals }) => {
  const user = locals.user;
  if (!user) return { history: [] };

  const today = new Date();
  const sevenDaysAgo = startOfDay(subDays(today, 6));

  const trackingHistory = await db.query.healthTracking.findMany({
    where: and(
      eq(healthTracking.userId, user.id),
      gte(healthTracking.trackingDate, sevenDaysAgo)
    ),
    orderBy: [asc(healthTracking.trackingDate)]
  });

  // Fetch logs to aggregate stats per day
  const mealLogs = await db.query.mealLog.findMany({
    where: and(
      eq(mealLog.userId, user.id),
      gte(mealLog.createdAt, sevenDaysAgo)
    )
  });

  const waterLogs = await db.query.waterLog.findMany({
    where: and(
      eq(waterLog.userId, user.id),
      gte(waterLog.createdAt, sevenDaysAgo)
    )
  });

  return {
    trackingHistory,
    mealLogs,
    waterLogs
  };
}) satisfies PageServerLoad;
