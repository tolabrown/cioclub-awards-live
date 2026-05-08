import { SizeCRUD } from "$lib/db/size";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const result = await SizeCRUD.getAllWithCounts();

  return {
    sizes: result.data,
  };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const abbreviation = formData.get("abbreviation") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string || "0");
    const isActive = formData.get("isActive") === "true";

    if (!name || !abbreviation) {
      return fail(400, { message: "Name and abbreviation are required" });
    }

    const data = {
      name,
      abbreviation,
      sortOrder,
      isActive,
    };

    if (id) {
      const result = await SizeCRUD.update(id, data);
      if (!result.success) return fail(500, { message: result.error });
      return { success: true };
    } else {
      const result = await SizeCRUD.create(data);
      if (!result.success) return fail(500, { message: result.error });
      return { success: true };
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) return fail(400, { message: "ID is required" });

    const result = await SizeCRUD.safeDelete(id);
    if (!result.success) return fail(500, { message: result.error });

    return { success: true };
  },
};
