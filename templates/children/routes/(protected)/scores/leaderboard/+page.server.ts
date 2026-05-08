import { MAX_ITEMS_PER_PAGE } from "$lib/constants";
import { getLeaderboard } from "$lib/db/score";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const scoreType = url.searchParams.get("scoreType") || "all";
  const ageGroup = url.searchParams.get("ageGroup") || "all";
  const year = url.searchParams.get("year") || new Date().getFullYear().toString();
  const limit = parseInt(url.searchParams.get("limit") || MAX_ITEMS_PER_PAGE.toString());
  const offset = parseInt(url.searchParams.get("offset") || "0");

  const data = getLeaderboard(scoreType, ageGroup, year, limit, offset);

  return {
    scoreType,
    ageGroup,
    leaderboard: data,
  };
};
