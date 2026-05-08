import { BaseCRUD, eq, asc, sql, type CRUDResult, type CRUDListResult } from "./crud";
import { size, productSize, type Size, type NewSize } from "./schema";
import { db } from "./drizzle";

interface SizeWithCount extends Size {
  productCount?: number;
}

class SizeCRUDClass extends BaseCRUD<typeof size, Size, NewSize> {
  constructor() {
    super(size);
  }

  /**
   * Get all sizes ordered by sortOrder
   */
  async getAllOrdered(): Promise<CRUDListResult<Size>> {
    try {
      const results = await db
        .select()
        .from(size)
        .orderBy(asc(size.sortOrder));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get sizes" };
    }
  }

  /**
   * Get active sizes
   */
  async getActive(): Promise<CRUDListResult<Size>> {
    try {
      const results = await db
        .select()
        .from(size)
        .where(eq(size.isActive, true))
        .orderBy(asc(size.sortOrder));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get sizes" };
    }
  }

  /**
   * Get sizes with product counts
   */
  async getAllWithCounts(): Promise<CRUDListResult<SizeWithCount>> {
    try {
      const sizes = await db
        .select()
        .from(size)
        .orderBy(asc(size.sortOrder));

      const counts = await db
        .select({
          sizeId: productSize.sizeId,
          count: sql<number>`count(*)`,
        })
        .from(productSize)
        .groupBy(productSize.sizeId);

      const countMap = new Map(counts.map(c => [c.sizeId, Number(c.count)]));

      const sizesWithCounts = sizes.map(s => ({
        ...s,
        productCount: countMap.get(s.id) || 0,
      }));

      return { success: true, data: sizesWithCounts };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get sizes" };
    }
  }

  /**
   * Update sort order for multiple sizes
   */
  async updateSortOrder(updates: { id: string; sortOrder: number }[]): Promise<CRUDResult<boolean>> {
    try {
      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          db.update(size).set({ sortOrder }).where(eq(size.id, id))
        )
      );
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to update sort order" };
    }
  }

  /**
   * Check if size is in use
   */
  async isInUse(sizeId: string): Promise<boolean> {
    try {
      const [result] = await db
        .select({ id: productSize.id })
        .from(productSize)
        .where(eq(productSize.sizeId, sizeId))
        .limit(1);
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Safe delete - only if not in use
   */
  async safeDelete(sizeId: string): Promise<CRUDResult<Size>> {
    const inUse = await this.isInUse(sizeId);
    if (inUse) {
      return { success: false, error: "Cannot delete size that is in use by products" };
    }
    return this.delete(sizeId);
  }
}

export const SizeCRUD = new SizeCRUDClass();
