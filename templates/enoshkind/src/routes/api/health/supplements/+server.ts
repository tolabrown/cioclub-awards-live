import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { supplementLog } from '$lib/db/schema';

export const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const { supplements, logDate, additionalNotes } = await request.json();

    const newLog = await db.insert(supplementLog).values({
      userId: user.id,
      logDate: logDate ? new Date(logDate) : new Date(),
      supplements: JSON.stringify(supplements),
      additionalNotes
    }).returning();

    return json({ success: true, data: newLog[0] });
  } catch (error: any) {
    console.error('Supplement log error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
