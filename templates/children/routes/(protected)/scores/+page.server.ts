import { getScoresBySearchFilter } from "$lib/db/score";
import type { PageServerLoad } from "./$types";
import { Constants, scoresRoles, Role } from '$lib/constants';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {

  const user = locals.user

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=${url.pathname}`);
  }

  if (!scoresRoles.includes(user.role as Role)) {
    throw redirect(303, Constants.AFTERAUTH);
  }

  const search = url.searchParams.get("search");
  const cursor = url.searchParams.get("cursor");
  const limit = url.searchParams.get("limit");
  const scoreType = url.searchParams.get("scoreType");

  const data = getScoresBySearchFilter({
    search,
    cursor,
    limit,
    scoreType,
  });

  return {
    scores: data,
  };
};
