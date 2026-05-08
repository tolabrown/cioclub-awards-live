import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Constants } from '$lib/constants';

export const load = (async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, Constants.AFTERAUTH)
  }

  return {};
}) satisfies LayoutServerLoad;
