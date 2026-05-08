import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Role } from '$lib/constants';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || (locals.user.role !== Role.ADMIN && locals.user.role !== Role.EDITOR)) {
    throw error(403, 'Forbidden');
  }

  return {};
};
