import { json } from "@sveltejs/kit";
import { jumiaShipping } from "$lib/server/shipping";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { zoneName, size } = await request.json();
    if (!zoneName) {
      return json({ success: false, error: "Zone name is required" }, { status: 400 });
    }

    const fee = await jumiaShipping.calculateShipping(zoneName, size || 'small');
    return json({ success: true, fee });
  } catch (error) {
    return json({ success: false, error: "Failed to calculate shipping" }, { status: 500 });
  }
};
