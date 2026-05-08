import { json } from '@sveltejs/kit';
import { getWinnersBySearchFilter } from '$lib/db/winners';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const params: Record<string, string> = {};
  url.searchParams.forEach((val, key) => (params[key] = val));

  const result = await getWinnersBySearchFilter(params);

  if (result.status === 'error') {
    return json({ error: result.message }, { status: 500 });
  }

  return json(result.data);
};
