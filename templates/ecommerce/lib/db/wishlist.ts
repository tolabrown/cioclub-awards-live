import { BaseCRUD, eq, and, sql, type CRUDResult, type CRUDListResult } from "./crud";
import { wishlist, product, type Wishlist, type NewWishlist } from "./schema";
import { db } from "./drizzle";

class WishlistCRUDClass extends BaseCRUD<typeof wishlist, Wishlist, NewWishlist> {
  constructor() {
    super(wishlist);
  }

  /**
   * Get user's wishlist items with product details
   */
  async getByUserId(userId: string, page = 1, limit = 20): Promise<CRUDListResult<any>> {
    try {
      const offset = (page - 1) * limit;

      // Count total first
      const [countResult] = await db
        .select({ count: sql`count(*)` })
        .from(wishlist)
        .where(eq(wishlist.userId, userId));

      const total = Number(countResult?.count || 0);

      const results = await db.query.wishlist.findMany({
        where: eq(wishlist.userId, userId),
        with: {
          product: {
            with: {
              images: {
                orderBy: (images, { asc }) => [asc(images.sortOrder)],
                with: { imageFile: true }
              },
              category: true
            }
          }
        },
        orderBy: (wishlist, { desc }) => [desc(wishlist.createdAt)],
        limit,
        offset
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: results,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages
        }
      };
    } catch (error) {
      console.error("[WishlistCRUD] GetByUserId error:", error);
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get wishlist" };
    }
  }

  /**
   * Check if a product is in a user's wishlist
   */
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    try {
      const [result] = await db
        .select()
        .from(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId),
            eq(wishlist.productId, productId)
          )
        )
        .limit(1);
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Remove item from wishlist
   */
  async removeFromWishlist(userId: string, productId: string): Promise<CRUDResult<any>> {
    try {
      const [result] = await db
        .delete(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId),
            eq(wishlist.productId, productId)
          )
        )
        .returning();

      return { success: !!result, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to remove from wishlist" };
    }
  }
}

export const WishlistCRUD = new WishlistCRUDClass();
