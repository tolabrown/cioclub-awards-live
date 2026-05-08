import { json } from "@sveltejs/kit";
import { CartCRUD } from "$lib/db/cart";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id;
  const sessionId = locals.cartSessionId;

  let result;
  if (userId) {
    // If user is logged in, attempt to merge guest cart first
    if (sessionId) {
      await CartCRUD.mergeGuestCart(sessionId, userId);
    }
    result = await CartCRUD.getOrCreateForUser(userId);
  } else if (sessionId) {
    result = await CartCRUD.getOrCreateForSession(sessionId);
  } else {
    return json({ success: false, error: "No session or user found" }, { status: 400 });
  }

  return json(result);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const { productId, quantity, priceAtAdd, productSizeId } = await request.json();
  const userId = locals.user?.id;
  const sessionId = locals.cartSessionId;

  let cartResult;
  if (userId) {
    cartResult = await CartCRUD.getOrCreateForUser(userId);
  } else if (sessionId) {
    cartResult = await CartCRUD.getOrCreateForSession(sessionId);
  } else {
    return json({ success: false, error: "No session or user found" }, { status: 400 });
  }

  if (!cartResult.success || !cartResult.data) {
    return json(cartResult, { status: 500 });
  }

  const result = await CartCRUD.addItem(
    cartResult.data.id,
    productId,
    quantity,
    priceAtAdd,
    productSizeId
  );

  return json(result);
};

export const PUT: RequestHandler = async ({ request }) => {
  const { itemId, quantity } = await request.json();
  const result = await CartCRUD.updateItemQuantity(itemId, quantity);
  return json(result);
};

export const DELETE: RequestHandler = async ({ request }) => {
  const { itemId, clearAll, cartId } = await request.json();

  if (clearAll && cartId) {
    const result = await CartCRUD.clearCart(cartId);
    return json(result);
  }

  if (itemId) {
    const result = await CartCRUD.removeItem(itemId);
    return json(result);
  }

  return json({ success: false, error: "Missing parameters" }, { status: 400 });
};
