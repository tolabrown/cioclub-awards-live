import { WishlistCRUD } from "$lib/db/wishlist";
import { error, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const user = await locals.user

  if (!user) {
    throw redirect(303, "/auth/login?redirectTo=/wishlist");
  }

  const wishlistResult = await WishlistCRUD.getByUserId(user.id);

  return {
    wishlistItems: wishlistResult.data || [],
    meta: wishlistResult.meta,
    error: wishlistResult.success ? undefined : wishlistResult.error
  };
};
