import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDashboardStats } from '$lib/db/dashboard';

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const stats = await getDashboardStats(locals.user.role as string);
    return json(stats);
  } catch (error: any) {
    console.error('Dashboard stats API error:', error);
    return json({ error: error.message }, { status: 500 });
  }
};
