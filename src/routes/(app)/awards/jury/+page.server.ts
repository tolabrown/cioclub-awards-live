import { getJuryBySearchFilter, getMostRecentJuryYear, getAllJuryYears } from '$lib/db/jury';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const [recentYear, availableYears] = await Promise.all([
    getMostRecentJuryYear(),
    getAllJuryYears()
  ]);
  const year = url.searchParams.get('year') || recentYear;
  const searchTerm = url.searchParams.get('search') || '';

  const result = await getJuryBySearchFilter({
    year,
    search: searchTerm,
    offset: '0'
  });

  return {
    juryMeta: result.data,
    year,
    search: searchTerm,
    recentYear,
    availableYears
  };
};
