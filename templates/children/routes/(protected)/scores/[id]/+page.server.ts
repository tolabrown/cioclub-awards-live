import { getScore } from "$lib/db/score";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import type {  iScore } from "$lib/interface";
import { pageGuard } from "$lib/server";
import { FieldsPlural } from "$lib/constants";

export const load: PageServerLoad = async ({ params, locals }) => {

  await pageGuard(params.id, locals, FieldsPlural.SCORE);
  const score = await getScore(params.id) as iScore;

  if (!score) {
    throw error(404, "Score not found");
  }

  return {
    score,
  };
};
