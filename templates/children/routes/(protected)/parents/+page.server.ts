import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { Constants, parentsRoles, Role } from '$lib/constants';

export const load: PageServerLoad = async ({ locals, url }) => {


  const user = locals.user

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=${url.pathname}`);
  }

  if (!parentsRoles.includes(user.role as Role)) {
    throw redirect(303, Constants.AFTERAUTH);
  }
  return {};
};
