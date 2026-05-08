import { getScoresBySearchFilter, addScore } from "$lib/db/score";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const search = url.searchParams.get("search");
  const cursor = url.searchParams.get("cursor");
  const limit = url.searchParams.get("limit");
  const scoreType = url.searchParams.get("scoreType");
  const childId = url.searchParams.get("childId");

  const data = await getScoresBySearchFilter({
    search,
    cursor,
    limit,
    scoreType,
    childId,
  });

  return json(data);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const data = await addScore(body, locals.user);
  return json(data);
};
