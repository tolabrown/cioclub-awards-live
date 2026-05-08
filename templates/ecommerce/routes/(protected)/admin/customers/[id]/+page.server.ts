import { UserCRUD } from "$lib/db/user";
import { OrderCRUD } from "$lib/db/order";
import { error, fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const { id } = params;
  const user = await UserCRUD.getById(id);

  if (!user.success || !user.data) {
    throw error(404, "User not found");
  }

  // Get user orders
  const ordersResult = await OrderCRUD.getUserOrders(id, 1, 50);

  return {
    customer: user.data,
    orders: ordersResult.data || [],
  };
};

export const actions: Actions = {
  toggleBan: async ({ params }) => {
    const { id } = params;
    const userResult = await UserCRUD.getById(id as string);
    if (!userResult.success || !userResult.data) {
      return fail(404, { message: "User not found" });
    }

    const result = await UserCRUD.update(id as string, { banned: !userResult.data.banned });
    if (!result.success) {
      return fail(500, { message: result.error });
    }

    return { success: true };
  },
  updateRole: async ({ request, params }) => {
    const { id } = params;
    const formData = await request.formData();
    const role = formData.get("role") as string;

    if (!role) {
      return fail(400, { message: "Role is required" });
    }

    const result = await UserCRUD.update(id as string, { role });
    if (!result.success) {
      return fail(500, { message: result.error });
    }

    return { success: true };
  },
};
