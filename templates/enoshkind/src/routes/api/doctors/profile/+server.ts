import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { doctor, consultation, user as userTable } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Check if the doctor exists
    const existingDoctor = await db.query.doctor.findFirst({
      where: eq(doctor.userId, user.id)
    });

    if (!existingDoctor) {
      return json({ success: false, message: 'Doctor profile not found' }, { status: 404 });
    }

    // 2. Delete doctor profile
    // Manual cleanup of consultations to prevent FK errors (fallback for schema cascade)
    await db.delete(consultation).where(eq(consultation.doctorId, existingDoctor.id));

    // Note: doctor_availability will be deleted automatically due to CASCADE in schema
    await db.delete(doctor).where(eq(doctor.userId, user.id));

    // 3. Reset user role to patient
    await db.update(userTable).set({ role: 'patient' }).where(eq(userTable.id, user.id));

    return json({ success: true, message: 'Doctor profile deleted successfully' });
  } catch (error: any) {
    console.error('Delete doctor profile error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
