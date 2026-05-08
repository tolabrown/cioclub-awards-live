import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminRoles, Constants, Role, usersRoles } from '$lib/constants';

export const load = (async ({ locals, url }) => {

  const user = locals.user

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=${url.pathname}`);
  }

  if (!usersRoles.includes(user.role as Role)) {
    throw redirect(303, Constants.AFTERAUTH);
  }

  return { };
}) satisfies PageServerLoad;