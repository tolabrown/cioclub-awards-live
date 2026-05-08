import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { doctor, doctorAvailability } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const GET = async ({ locals }) => {
  const user = locals.user;
  if (!user) return json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const dr = await db.query.doctor.findFirst({
      where: eq(doctor.userId, user.id)
    });

    if (!dr) return json({ success: false, message: 'Doctor profile not found' }, { status: 404 });

    const slots = await db.query.doctorAvailability.findMany({
      where: eq(doctorAvailability.doctorId, dr.id)
    });

    return json({ success: true, data: slots });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};

export const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ success: false, message: 'Unauthorized' }, { status: 401 });

  try {
    const dr = await db.query.doctor.findFirst({
      where: eq(doctor.userId, user.id)
    });

    if (!dr) return json({ success: false, message: 'Doctor profile not found' }, { status: 404 });

    const { slots } = await request.json();

    // Re-sync availability (delete all and re-insert for simplicity in weekly schedule)
    await db.delete(doctorAvailability).where(eq(doctorAvailability.doctorId, dr.id));

    if (slots && slots.length > 0) {
      await db.insert(doctorAvailability).values(
        slots.map((s: any) => ({
          doctorId: dr.id,
          dayOfWeek: s.dayOfWeek,
          startTime: s.startTime,
          endTime: s.endTime
        }))
      );
    }

    return json({ success: true, message: 'Availability updated' });
  } catch (e: any) {
    return json({ success: false, message: e.message }, { status: 500 });
  }
};
