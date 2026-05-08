import { getTeamBySearchFilter, getMostRecentTeamYear, getAllTeamYears } from '$lib/db/team';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const searchTerm = url.searchParams.get('search') || '';
  const recentTeamYear = await getMostRecentTeamYear();
  const year = url.searchParams.get('year') || recentTeamYear;

  const [result, availableTeamYears] = await Promise.all([
    getTeamBySearchFilter({
      search: searchTerm,
      year: year,
      offset: '0'
    }),
    getAllTeamYears()
  ]);

  return {
    teamMeta: result.data,
    search: searchTerm,
    recentTeamYear,
    availableTeamYears,
    selectedYear: year
  };
};
