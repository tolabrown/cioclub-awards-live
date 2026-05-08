import { ProductCRUD } from "$lib/db/product";
import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");

  const result = await ProductCRUD.getFiltered(
    { search: search || undefined },
    undefined,
    page,
    limit,
  );

  return {
    products: result.data,
    meta: result.meta,
    search,
  };
};

export const actions: Actions = {
  updateStock: async ({ request }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const quantity = parseInt(formData.get("quantity") as string);

    if (!id || isNaN(quantity)) {
      return fail(400, { message: "Invalid product ID or quantity" });
    }

    const result = await ProductCRUD.updateStock(id, quantity);
    if (!result.success) {
      return fail(500, { message: result.error });
    }

    return { success: true };
  },
};
