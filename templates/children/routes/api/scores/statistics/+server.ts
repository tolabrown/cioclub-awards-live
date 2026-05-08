import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getScoreStatistics } from '$lib/db/score';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const result = await getScoreStatistics();

  if (result.status === 'error') {
    return json({ error: result.message }, { status: 500 });
  }

  return json(result.data);
};
