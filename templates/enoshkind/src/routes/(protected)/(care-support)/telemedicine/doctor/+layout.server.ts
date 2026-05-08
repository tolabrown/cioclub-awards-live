import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { doctor, consultation } from '$lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const load = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) throw redirect(303, `/auth/sign-in/redirectTo=${url.pathname}`);

  const dr = await db.query.doctor.findFirst({
    where: eq(doctor.userId, user.id)
  });

  if (!dr) {
    // If not onboarded, redirect to onboarding
    throw redirect(303, '/telemedicine/onboarding');
  }

  // Calculate earnings from completed consultations
  const completedConsultations = await db.query.consultation.findMany({
    where: and(
      eq(consultation.doctorId, dr.id),
      eq(consultation.status, 'completed')
    )
  });

  const earnings = completedConsultations
    .reduce((acc, c) => acc + ((c.totalFee || 0) - (c.serviceCharge || 0)), 0) / 100;

  return {
    doctor: {
      ...dr,
      earnings
    }
  };
};
