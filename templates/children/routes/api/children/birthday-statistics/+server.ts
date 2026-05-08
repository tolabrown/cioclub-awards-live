import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBirthdayStatistics } from '$lib/db/child';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await getBirthdayStatistics();

  if (result.status === 'error') {
    return json({ error: result.message }, { status: 500 });
  }

  return json(result.data);
};
