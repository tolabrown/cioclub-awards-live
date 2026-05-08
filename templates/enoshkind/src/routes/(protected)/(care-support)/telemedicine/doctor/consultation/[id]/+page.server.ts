import { db } from '$lib/db/drizzle';
import { consultation, user } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export const load = async ({ params, parent }) => {
  const { doctor } = await parent();
  const { id } = params;

  const session = await db.query.consultation.findFirst({
    where: and(
      eq(consultation.id, id),
      eq(consultation.doctorId, doctor.id)
    ),
    with: {
      user: true
    }
  });

  if (!session) throw error(404, 'Consultation not found');

  // Calculate if the appointment time has passed
  const appointmentDateTime = new Date(session.appointmentDate);
  if (session.appointmentTime) {
    const [hours, minutes] = session.appointmentTime.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
  }
  const isPastDue = new Date() > appointmentDateTime;

  return {
    consultation: session,
    isPastDue
  };
};

export const actions = {
  accept: async ({ params, locals }) => {
    const { id } = params;
    await db.update(consultation)
      .set({ status: 'confirmed' })
      .where(eq(consultation.id, id));
    return { success: true };
  },
  saveNotes: async ({ request, params }) => {
    const data = await request.formData();
    const notes = data.get('notes') as string;
    const referral = data.get('referral') as string;
    const nextSteps = data.get('nextSteps') as string;

    await db.update(consultation)
      .set({
        consultationNotes: notes,
        referralDetails: referral,
        nextSteps: nextSteps,
        status: 'completed'
      })
      .where(eq(consultation.id, params.id));

    return { success: true };
  }
};
