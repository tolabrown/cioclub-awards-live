import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/drizzle';
import { healthTracking } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '$lib/auth';

export const GET: RequestHandler = async ({ request }) => {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session) {
    return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const history = await db.query.healthTracking.findMany({
      where: eq(healthTracking.userId, session.user.id),
      orderBy: [desc(healthTracking.trackingDate)]
    });

    return json({ status: 'success', data: history });
  } catch (error: any) {
    return json({ status: 'error', message: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session) {
    return json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Ensure userId is set
    const record = {
      ...data,
      userId: session.user.id,
      trackingDate: data.trackingDate ? new Date(data.trackingDate) : new Date()
    };

    const [newRecord] = await db.insert(healthTracking).values(record).returning();

    return json({ status: 'success', data: newRecord });
  } catch (error: any) {
    return json({ status: 'error', message: error.message }, { status: 500 });
  }
};
