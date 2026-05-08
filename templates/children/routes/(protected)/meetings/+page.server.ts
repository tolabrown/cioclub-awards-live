import type { PageServerLoad } from './$types';
import { meetingRoles, Constants, Role } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, url }) => {

  const user = locals.user

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=${url.pathname}`);
  }

  if (!meetingRoles.includes(user.role as Role)) {
    throw redirect(303, Constants.AFTERAUTH);
  }

  return {};
}) satisfies PageServerLoad;