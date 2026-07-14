import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { authGuard, getSearchFilterList } from '$lib/server';

export const GET: RequestHandler = async ({ locals, url }) => {
  // Security Check: Only Admins can view/list users
  const guard = await authGuard(locals);
  if (!guard.authorized) {
    return json({ status: 'error', message: guard.message }, { status: 403 });
  }

  return await getSearchFilterList(locals, url, Fields.USER);
};
