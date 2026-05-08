import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ request, locals, url }) => {
  const session = await auth.api.getSession({
    headers: request.headers
  })

  if (!session) {
    throw redirect(302, `/auth/login?redirectTo=${url.pathname}`)
  }

  const user = locals.user;

  // Check if patient record exists
  if (user) {
    const { patient } = await import('$lib/db/schema');
    const { db } = await import('$lib/db/drizzle');
    const { eq } = await import('drizzle-orm');

    const patientRecord = await db.query.patient.findFirst({
      where: eq(patient.user, user.id)
    });

    const isRegisterPage = url.pathname === '/register';

    if (!patientRecord && !isRegisterPage) {
      throw redirect(302, '/register');
    }

    if (patientRecord && isRegisterPage) {
      throw redirect(302, '/dashboard');
    }

    const { doctor } = await import('$lib/db/schema');
    const doctorRecord = await db.query.doctor.findFirst({
      where: eq(doctor.userId, user.id)
    });

    return { session, user, isDoctor: !!doctorRecord };
  }

  return { session, user, isDoctor: false };
}) satisfies LayoutServerLoad;
