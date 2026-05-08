import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getChartData } from '$lib/db/dashboard';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const charts = await getChartData(locals.user.role as string);
    return json(charts);
  } catch (error: any) {
    console.error('Dashboard charts API error:', error);
    return json({ error: error.message }, { status: 500 });
  }
};
