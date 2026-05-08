import { TagCRUD } from "$lib/db/tag";
import { type Tag } from "$lib/db/schema";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  const result = await TagCRUD.getAllWithCounts();

  return {
    tags: result.data,
  };
};

export const actions: Actions = {
  save: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const color = formData.get("color") as string;

    if (!name) {
      return fail(400, { message: "Name is required" });
    }

    const data = {
      name,
      type: type || null,
      color: color || null,
    };

    if (id) {
      const result = await TagCRUD.update(id, data);
      if (!result.success) return fail(500, { message: result.error });
      return { success: true };
    } else {
      const result = await TagCRUD.create(data);
      if (!result.success) return fail(500, { message: result.error });
      return { success: true };
    }
  },

  delete: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) return fail(400, { message: "ID is required" });

    const result = await TagCRUD.delete(id);
    if (!result.success) return fail(500, { message: result.error });

    return { success: true };
  },
};
