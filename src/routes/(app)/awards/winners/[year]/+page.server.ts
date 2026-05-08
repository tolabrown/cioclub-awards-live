import { getWinnersBySearchFilter, getAllWinnerYears } from '$lib/db/winners';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { year } = params;

  const availableYears = await getAllWinnerYears();

  if (availableYears.length > 0 && !availableYears.includes(year)) {
    // If the year doesn't exist but we have years, we could redirect or 404
    // For now, let's just fetch what we can
  }

  const result = await getWinnersBySearchFilter({ year, offset: '0' });

  if (result.status === 'error') {
    throw error(500, result.message);
  }

  return {
    year,
    winners: result.data.data,
    meta: result.data.meta,
    availableYears
  };
};
