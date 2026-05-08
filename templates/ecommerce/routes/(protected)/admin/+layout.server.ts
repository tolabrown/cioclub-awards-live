import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Role } from '$lib/constants/index';

export const load = (async ({ request, parent }) => {
  const { session, user } = await parent();

  // Check if user is admin
  if (user?.role !== Role.ADMIN) {
    throw redirect(302, '/dashboard?error=unauthorized');
  }

  return { session, user };
}) satisfies LayoutServerLoad;
