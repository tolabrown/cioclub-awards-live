import { ReviewCRUD } from "$lib/db/review";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");

  const result = await ReviewCRUD.list({
    page,
    limit,
  });

  return {
    reviews: result.data || [],
    meta: result.meta,
    search,
  };
};

export const actions: Actions = {
  approve: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    if (!id) return fail(400, { message: "ID is required" });

    const result = await ReviewCRUD.approve(id);
    if (!result.success) return fail(500, { message: result.error });

    return { success: true };
  },
  reject: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    if (!id) return fail(400, { message: "ID is required" });

    const result = await ReviewCRUD.reject(id);
    if (!result.success) return fail(500, { message: result.error });

    return { success: true };
  },
};
