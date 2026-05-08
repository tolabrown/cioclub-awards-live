import { getScore, updateScore, deleteScore } from "$lib/db/score";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params }) => {
  const data = await getScore(params.id);
  return json(data);
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
  const body = await request.json();
  const data = await updateScore(params.id, body, locals.user);
  return json(data);
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
  await deleteScore(params.id, locals.user);
  return json({ success: true });
};
