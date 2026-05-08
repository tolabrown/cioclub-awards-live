import { db } from '$lib/db/drizzle';
import { mealLog, healthTracking } from '$lib/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { startOfDay, endOfDay } from 'date-fns';
import { fail } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
  const user = locals.user;
  if (!user) return { mealLogs: [], stats: null };

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);

  const logs = await db.query.mealLog.findMany({
    where: and(
      eq(mealLog.userId, user.id),
      gte(mealLog.createdAt, startOfToday),
      lte(mealLog.createdAt, endOfToday)
    ),
    orderBy: [desc(mealLog.createdAt)],
    with: {
      image: true
    }
  });

  const dailyHealth = await db.query.healthTracking.findFirst({
    where: and(
      eq(healthTracking.userId, user.id),
      gte(healthTracking.trackingDate, startOfToday),
      lte(healthTracking.trackingDate, endOfToday)
    )
  });

  return {
    mealLogs: logs,
    dailyStats: {
      hydration: { current: dailyHealth?.hydration || 0, target: 8 }
    }
  };
}) satisfies PageServerLoad;

export const actions = {
  logMeal: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const data = await request.formData();
    const name = data.get('name') as string;
    const type = data.get('type') as string;
    const imageId = data.get('imageId') as string;
    const contentsStr = data.get('contents') as string;
    let contents: string[] = [];
    try {
      contents = JSON.parse(contentsStr || '[]');
    } catch (e) {
      console.error('Failed to parse meal contents', e);
    }

    const [result] = await db.insert(mealLog).values({
      userId: user.id,
      name,
      type,
      imageId: imageId || null,
      contents,
      accuracyConfirmed: false,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    }).returning();

    // Ensure day is marked in healthTracking
    const today = startOfDay(new Date());
    const existing = await db.query.healthTracking.findFirst({
      where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
    });
    if (!existing) {
      await db.insert(healthTracking).values({ userId: user.id, trackingDate: today });
    }

    return { success: true, meal: result };
  },
  logWater: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);
    const data = await request.formData();
    const amount = Number(data.get('amount') || 250);

    const today = startOfDay(new Date());
    const existing = await db.query.healthTracking.findFirst({
      where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
    });

    const litters = amount / 1000;

    if (existing) {
      await db
        .update(healthTracking)
        .set({ hydration: Number(existing.hydration || 0) + litters })
        .where(eq(healthTracking.id, existing.id));
    } else {
      await db.insert(healthTracking).values({
        userId: user.id,
        trackingDate: today,
        hydration: litters
      });
    }

    return { success: true };
  },
  updateMealMacros: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const data = await request.formData();
    const id = data.get('id') as string;
    const calories = Number(data.get('calories') || 0);
    const protein = Number(data.get('protein') || 0);
    const carbs = Number(data.get('carbs') || 0);
    const fats = Number(data.get('fats') || 0);

    if (!id) return fail(400, { message: 'Meal ID is required' });

    // Update the meal log directly
    const [result] = await db
      .update(mealLog)
      .set({
        calories,
        protein,
        carbs,
        fats,
        accuracyConfirmed: true // Mark as confirmed since it came from AI runs
      })
      .where(and(eq(mealLog.id, id), eq(mealLog.userId, user.id)))
      .returning();

    if (!result) return fail(404, { message: 'Meal not found or unauthorized' });

    return { success: true };
  }
} satisfies Actions;
