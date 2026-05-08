import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getMemoryStatistics } from '$lib/db/memory';

export const GET: RequestHandler = async () => {
  const result = await getMemoryStatistics();
  if (result.status === 'error') {
    return json({ status: 'error', message: result.message }, { status: 500 });
  }
  return json(result.data);
};
