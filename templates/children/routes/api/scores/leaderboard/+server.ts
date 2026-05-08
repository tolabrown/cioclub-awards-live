import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLeaderboard } from '$lib/db/score';

export const GET: RequestHandler = async ({ url }) => {
  const scoreType = url.searchParams.get('scoreType') || 'all';
  const ageGroup = url.searchParams.get('ageGroup') || 'all';
  const year = url.searchParams.get('year') || 'all';
  const limit = Number(url.searchParams.get('limit')) || 50;
  const offset = Number(url.searchParams.get('offset')) || 0;

  const result = await getLeaderboard(scoreType, ageGroup, year, limit, offset);

  return json(result);
};
