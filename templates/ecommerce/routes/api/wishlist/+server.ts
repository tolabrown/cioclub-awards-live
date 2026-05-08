import { json } from "@sveltejs/kit";
import { WishlistCRUD } from "$lib/db/wishlist";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, locals }) => {
  const user = locals.user;
  if (!user?.id) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 20;

  const result = await WishlistCRUD.getByUserId(user.id, page, limit);
  return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.id) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return json({ success: false, error: "Product ID required" }, { status: 400 });
  }

  const result = await WishlistCRUD.create({
    userId: user.id,
    productId
  });

  return json(result);
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user?.id) {
    return json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { productId } = await request.json();
  if (!productId) {
    return json({ success: false, error: "Product ID required" }, { status: 400 });
  }

  const result = await WishlistCRUD.removeFromWishlist(user.id, productId);

  return json(result);
};
