import { json } from "@sveltejs/kit";
import { ReviewCRUD } from "$lib/db/review";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    return json({ status: "error", message: "Unauthorized" }, { status: 401 });
  }

  const { productId, rating, comment, title, orderId } = await request.json();

  if (!productId || !rating || !comment) {
    return json(
      { status: "error", message: "Missing required fields" },
      { status: 400 },
    );
  }

  const result = await ReviewCRUD.createWithVerification(
    {
      id: crypto.randomUUID(),
      productId,
      userId: locals.user.id,
      rating: Number(rating),
      comment,
      title,
      isApproved: true, // Auto-approve for now or set to false for moderation
      isVerifiedPurchase: false, // Will be updated by createWithVerification if orderId matches
    },
    orderId,
  );

  if (!result.success) {
    return json({ status: "error", message: result.error }, { status: 500 });
  }

  return json({
    status: "success",
    message: "Review submitted successfully",
    data: result.data,
  });
};
