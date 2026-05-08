import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { healthTracking } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const { category, trackingDate, ...metrics } = data;

    // We can support multiple categories (diabetes, hypertension, etc.)
    // If tracking for today already exists for this category, update it?
    // Or just create a new record. Typically tracking is per day.

    const newRecord = await db.insert(healthTracking).values({
      userId: user.id,
      trackingDate: trackingDate ? new Date(trackingDate) : new Date(),
      category: category || 'general',
      ...metrics
    }).returning();

    return json({ success: true, data: newRecord[0] });
  } catch (error: any) {
    console.error('Track error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
