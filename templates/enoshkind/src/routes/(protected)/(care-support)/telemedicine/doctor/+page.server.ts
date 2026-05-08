import { db } from '$lib/db/drizzle';
import { consultation, user } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const load = async ({ parent }) => {
  const { doctor } = await parent();

  const consultations = await db.query.consultation.findMany({
    where: eq(consultation.doctorId, doctor.id),
    with: {
      user: true
    },
    orderBy: [desc(consultation.appointmentDate)]
  });

  return {
    consultations
  };
};
