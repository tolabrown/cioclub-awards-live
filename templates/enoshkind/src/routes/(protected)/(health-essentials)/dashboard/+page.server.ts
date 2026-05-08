import { db } from '$lib/db/drizzle';
import { healthTracking, waterLog, mealLog, workoutLog, consultation, doctor, user as userTable, patient } from '$lib/db/schema';
import { eq, and, gte, lte, sql, desc, count } from 'drizzle-orm';
import { unionAll } from 'drizzle-orm/pg-core';
import type { PageServerLoad, Actions } from './$types';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { fail } from '@sveltejs/kit';
import { uploadFile } from "$lib/db/file";

export const load = (async ({ locals }) => {
  const user = locals.user;
  if (!user) return {};

  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  const sevenDaysAgo = startOfDay(subDays(today, 6));

  // DOCTOR DASHBOARD
  if (user.role === 'doctor') {
    const dr = await db.query.doctor.findFirst({
      where: eq(doctor.userId, user.id)
    });

    if (dr) {
      const completedConsultations = await db.query.consultation.findMany({
        where: and(eq(consultation.doctorId, dr.id), eq(consultation.status, 'completed'))
      });

      const earnings = completedConsultations.reduce((acc, c) => acc + (c.totalFee || 0), 0);

      const upcoming = await db.query.consultation.findMany({
        where: and(
          eq(consultation.doctorId, dr.id),
          eq(consultation.status, 'confirmed'),
          gte(consultation.appointmentDate, startOfToday)
        ),
        orderBy: [desc(consultation.appointmentDate)],
        limit: 5,
        with: {
          user: true
        }
      });

      const [patientCountRes] = await db
        .select({ value: count(consultation.userId) })
        .from(consultation)
        .where(eq(consultation.doctorId, dr.id));

      return {
        role: 'doctor',
        stats: {
          earnings: earnings / 100,
          totalPatients: patientCountRes.value,
          upcomingCount: upcoming.length
        },
        upcoming
      };
    }
  }

  // ADMIN DASHBOARD
  if (user.role === 'admin') {
    const [totalUsers] = await db.select({ value: count() }).from(userTable);
    const [totalConsults] = await db.select({ value: count() }).from(consultation);
    const revenueResult = await db
      .select({ value: sql`sum(${consultation.totalFee})` })
      .from(consultation)
      .where(eq(consultation.paid, true));
    const totalRevenue = (revenueResult[0]?.value as number) || 0;

    return {
      role: 'admin',
      stats: {
        totalUsers: totalUsers.value,
        totalConsultations: totalConsults.value,
        totalRevenue: totalRevenue / 100
      }
    };
  }

  // PATIENT DASHBOARD (DEFAULT)
  const healthData = await db.query.healthTracking.findFirst({
    where: and(
      eq(healthTracking.userId, user.id),
      gte(healthTracking.trackingDate, startOfToday),
      lte(healthTracking.trackingDate, endOfToday)
    )
  });

  const patientData = await db.query.patient.findFirst({
    where: eq(patient.user, user.id)
  });

  const [waterToday] = await db
    .select({ value: count() })
    .from(waterLog)
    .where(and(eq(waterLog.userId, user.id), gte(waterLog.createdAt, startOfToday)));

  const [mealsToday] = await db
    .select({ value: count() })
    .from(mealLog)
    .where(and(eq(mealLog.userId, user.id), gte(mealLog.createdAt, startOfToday)));

  const [workoutsToday] = await db
    .select({ value: count() })
    .from(workoutLog)
    .where(and(eq(workoutLog.userId, user.id), gte(workoutLog.createdAt, startOfToday)));

  // Consistency: Days with any log entry (Health Tracking, Water, Meals, or Workouts) in the last 7 days
  const healthTrackingDays = db
    .select({ d: sql`date_trunc('day', ${healthTracking.trackingDate})`.as('d') })
    .from(healthTracking)
    .where(and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, sevenDaysAgo)));

  const waterLogDays = db
    .select({ d: sql`date_trunc('day', ${waterLog.createdAt})`.as('d') })
    .from(waterLog)
    .where(and(eq(waterLog.userId, user.id), gte(waterLog.createdAt, sevenDaysAgo)));

  const mealLogDays = db
    .select({ d: sql`date_trunc('day', ${mealLog.createdAt})`.as('d') })
    .from(mealLog)
    .where(and(eq(mealLog.userId, user.id), gte(mealLog.createdAt, sevenDaysAgo)));

  const workoutLogDays = db
    .select({ d: sql`date_trunc('day', ${workoutLog.createdAt})`.as('d') })
    .from(workoutLog)
    .where(and(eq(workoutLog.userId, user.id), gte(workoutLog.createdAt, sevenDaysAgo)));

  const consistencyRes = await db
    .select({ val: sql`count(distinct d)`.mapWith(Number) })
    .from(unionAll(healthTrackingDays, waterLogDays, mealLogDays, workoutLogDays).as('activity'));

  const consistency = consistencyRes[0]?.val || 0;

  // AI Greeting Logic
  let aiGreeting = "Good morning! Let's make today a healthy one.";
  const steps = healthData?.steps || 0;
  if (steps > 5000) aiGreeting = "You're doing great with your steps today! Keep pushing towards your goal.";
  if (waterToday.value < 4) aiGreeting = "Drink some water! Staying hydrated is key to maintaining high energy levels.";
  if (consistency > 5) aiGreeting = "Impressive consistency! You've been active almost every day this week.";

  return {
    role: 'patient',
    healthData: {
      location: patientData?.location || 'Lagos, Nigeria',
      steps: healthData?.steps || 0,
      hydration: healthData?.hydration || 0,
      sleepDuration: healthData?.sleepDuration || 0,
      systolic: healthData?.systolic || '118',
      diastolic: healthData?.diastolic || '78',
      heartRate: healthData?.heartRate || '72',
      weight: healthData?.weight || '75',
      moodRating: healthData?.moodRating || 'Good'
    },
    logsToday: {
      water: waterToday.value,
      meals: mealsToday.value,
      workouts: workoutsToday.value
    },
    consistency,
    aiGreeting
  };
}) satisfies PageServerLoad;

export const actions = {
  logWater: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);
    const data = await request.formData();
    const amount = Number(data.get('amount') || 250);

    await db.insert(waterLog).values({
      userId: user.id,
      amount
    });

    // Also update the daily aggregate in healthTracking
    const today = startOfDay(new Date());
    const existing = await db.query.healthTracking.findFirst({
      where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
    });

    if (existing) {
      await db
        .update(healthTracking)
        .set({ hydration: (existing.hydration || 0) + 1 })
        .where(eq(healthTracking.id, existing.id));
    } else {
      await db.insert(healthTracking).values({
        userId: user.id,
        trackingDate: today,
        hydration: 1
      });
    }

    return { success: true };
  },
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

    await db.insert(mealLog).values({
      userId: user.id,
      name,
      type,
      imageId: imageId || null,
      contents,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0
    });

    // Ensure day is marked as active in healthTracking (redundant but good for indexing)
    const today = startOfDay(new Date());
    const existing = await db.query.healthTracking.findFirst({
      where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
    });
    if (!existing) {
      await db.insert(healthTracking).values({ userId: user.id, trackingDate: today });
    }

    return { success: true };
  },
  logWorkout: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);
    const data = await request.formData();
    const type = data.get('type') as string;
    const duration = Number(data.get('duration') || 30);
    const calories = Number(data.get('calories') || 0);

    await db.insert(workoutLog).values({
      userId: user.id,
      type,
      duration,
      calories
    });

    // Update health tracking daily steps if it's 'Walking' or 'Running'
    if (type.toLowerCase().includes('walk') || type.toLowerCase().includes('run')) {
      const today = startOfDay(new Date());
      const existing = await db.query.healthTracking.findFirst({
        where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
      });
      const stepsToAdd = duration * 100; // rough estimate
      if (existing) {
        await db
          .update(healthTracking)
          .set({ steps: (existing.steps || 0) + stepsToAdd })
          .where(eq(healthTracking.id, existing.id));
      } else {
        await db.insert(healthTracking).values({
          userId: user.id,
          trackingDate: today,
          steps: stepsToAdd
        });
      }
    }

    return { success: true };
  },
  logWeight: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);
    const data = await request.formData();
    const weight = data.get('weight') as string;

    const today = startOfDay(new Date());
    const existing = await db.query.healthTracking.findFirst({
      where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
    });

    if (existing) {
      await db.update(healthTracking).set({ weight }).where(eq(healthTracking.id, existing.id));
    } else {
      await db.insert(healthTracking).values({
        userId: user.id,
        trackingDate: today,
        weight
      });
    }
    return { success: true };
  },
  logMood: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);
    const data = await request.formData();
    const moodRating = data.get('mood') as string;
    const energyLevel = data.get('energy') as string;

    const today = startOfDay(new Date());
    const existing = await db.query.healthTracking.findFirst({
      where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
    });

    if (existing) {
      await db
        .update(healthTracking)
        .set({ moodRating, energyLevel })
        .where(eq(healthTracking.id, existing.id));
    } else {
      await db.insert(healthTracking).values({
        userId: user.id,
        trackingDate: today,
        moodRating,
        energyLevel
      });
    }
    return { success: true };
  },
  logVitals: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);
    const data = await request.formData();
    const systolic = data.get('systolic') as string;
    const diastolic = data.get('diastolic') as string;
    const heartRate = data.get('heartRate') as string;

    const today = startOfDay(new Date());
    const existing = await db.query.healthTracking.findFirst({
      where: and(eq(healthTracking.userId, user.id), gte(healthTracking.trackingDate, today))
    });

    if (existing) {
      await db
        .update(healthTracking)
        .set({ systolic, diastolic, heartRate })
        .where(eq(healthTracking.id, existing.id));
    } else {
      await db.insert(healthTracking).values({
        userId: user.id,
        trackingDate: today,
        systolic,
        diastolic,
        heartRate
      });
    }
    return { success: true };
  }
} satisfies Actions;