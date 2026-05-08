import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Fields } from '$lib/constants';
import { getSearchFilterList } from '$lib/server';
import { addParent } from '$lib/db/parent';

export const GET: RequestHandler = async ({ locals, url }) => {
  return await getSearchFilterList(locals, url, Fields.PARENT)
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();

  const newParent = await addParent(body, locals.user);

  if (!newParent) {
    return json({ status: 'error', message: 'Failed to create parent' }, { status: 500 });
  }

  return json({ status: 'success', data: newParent });
};
