import { json } from "@sveltejs/kit";
import { ReviewCRUD } from "$lib/db/review";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const result = await ReviewCRUD.getUnreviewedProducts(locals.user.id);
  if (!result.success) {
    return json({ status: "error", message: result.error }, { status: 500 });
  }

  return json({ status: "success", data: result.data });
};
