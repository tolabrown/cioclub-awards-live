import { getAllWinnerYears } from '$lib/db/winners';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const availableYears = await getAllWinnerYears();

  // Calculate some stats
  // Total winners across all years would be nice but maybe overkill for now
  // We'll keep the design's specific stats or make them slightly more dynamic

  return {
    availableYears
  };
};
