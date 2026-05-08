import { OrderCRUD } from "$lib/db/order";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    throw error(401, "Unauthorized");
  }

  const page = Number(url.searchParams.get("page")) || 1;
  const limit = 10;

  const ordersResult = await OrderCRUD.getUserOrders(locals.user.id, page, limit);

  if (!ordersResult.success) {
    return {
      orders: [],
      meta: {
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false,
      },
      error: ordersResult.error
    };
  }

  return {
    orders: ordersResult.data,
    meta: ordersResult.meta,
  };
};
