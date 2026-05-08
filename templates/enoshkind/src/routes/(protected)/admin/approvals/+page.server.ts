import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  const sessionUser = locals.user;
  if (!sessionUser || sessionUser.role !== 'admin') {
    throw error(403, 'Forbidden');
  }

  return {};
};
