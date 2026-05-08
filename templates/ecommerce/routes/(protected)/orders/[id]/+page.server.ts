import { OrderCRUD } from "$lib/db/order";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, params }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const { id } = params;
  const orderResult = await OrderCRUD.getById(id);

  if (!orderResult.success || !orderResult.data) {
    throw error(404, "Order not found");
  }

  const order = orderResult.data;

  // Check ownership
  if (order.userId !== locals.user.id && locals.user.role !== "admin") {
    throw error(403, "Forbidden");
  }

  return {
    order,
  };
};
