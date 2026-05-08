import { getConsultation } from '$lib/db/consultation';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    throw redirect(302, '/auth/login');
  }

  const { id } = params;
  const consultation = await getConsultation(id);

  if (!consultation) {
    throw redirect(302, '/telemedicine');
  }

  return { consultation };
}) satisfies PageServerLoad;
