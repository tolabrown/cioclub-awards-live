import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getNominationPeriod } from '$lib/server/nomination-period';

export const load: PageServerLoad = async ({ locals }) => {
  // Auth guard
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/awards/nominate');
  }

  const period = await getNominationPeriod();

  return {
    user: locals.user,
    nominationPeriod: period,
  };
};
