import { FileCRUD } from "$lib/db/file";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "24");

  const result = await FileCRUD.getFiltered(
    {},
    page,
    limit,
  );

  const stats = await FileCRUD.getStorageStats();

  return {
    files: result.data,
    meta: result.meta,
    stats: stats.data,
  };
};

export const actions: Actions = {
  upload: async ({ request, locals }) => {
    const formData = await request.formData();
    const files = formData.getAll("files") as globalThis.File[];
    const category = (formData.get("category") as string) || "general";

    if (!files.length) return fail(400, { message: "No files uploaded" });

    const results = [];
    for (const fileItem of files) {
      if (fileItem.size === 0) continue;
      const result = await FileCRUD.upload(fileItem, category, locals.user?.id);
      results.push(result);
    }

    const failed = results.filter((r) => !r.success);
    if (failed.length > 0) {
      return fail(500, { message: failed[0].error });
    }

    return { success: true };
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) return fail(400, { message: "ID is required" });

    const result = await FileCRUD.deleteWithStorage(id);
    if (!result.success) return fail(500, { message: result.error });

    return { success: true };
  },
};
