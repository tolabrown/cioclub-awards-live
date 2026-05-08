import { redirect, type RequestEvent } from '@sveltejs/kit';
import { Constants, Role } from '$lib/constants';

export const load = async ({ locals, url }: RequestEvent) => {
  const user = locals.user;

  // If no user is present, they will be caught by the parent layout and redirected to login.
  // However, we double check here to be safe and to inform TypeScript.
  if (!user) {
    throw redirect(302, `/auth/login?redirectTo=${url.pathname}`);
  }

  // Restrict access to administrators only
  if (user.role !== Role.ADMIN) {
    console.warn(`Unauthorized access attempt to ${url.pathname} by ${user.email}`);
    throw redirect(303, Constants.AFTERAUTH);
  }

  return {};
};
