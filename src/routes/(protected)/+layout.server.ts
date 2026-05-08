import { Role } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals, url }) => {
  const session = locals.session;
  const user = locals.user;

  if (!session || !user) {
    throw redirect(302, `/auth/login?redirectTo=${url.pathname}`);
  }

  if (url.pathname.startsWith('/dashboard') && user.role === Role.USER) {
    throw redirect(302, '/');
  }

  return { session, user };
}) satisfies LayoutServerLoad;
