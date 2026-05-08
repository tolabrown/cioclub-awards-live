import { BaseCRUD, eq, asc, sql, type CRUDResult, type CRUDListResult } from "./crud";
import { tag, productTag, type Tag, type NewTag } from "./schema";
import { db } from "./drizzle";

interface TagWithCount extends Tag {
  productCount?: number;
}

class TagCRUDClass extends BaseCRUD<typeof tag, Tag, NewTag> {
  constructor() {
    super(tag);
  }

  /**
   * Get tag by id
   */
  async getById(id: string): Promise<CRUDResult<Tag>> {
    try {
      const [result] = await db
        .select()
        .from(tag)
        .where(eq(tag.id, id))
        .limit(1);

      if (!result) {
        return { success: false, error: "Tag not found" };
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get tag" };
    }
  }

  /**
   * Get all tags with product counts
   */
  async getAllWithCounts(): Promise<CRUDListResult<TagWithCount>> {
    try {
      const tags = await db
        .select()
        .from(tag)
        .orderBy(asc(tag.name));

      const counts = await db
        .select({
          tagId: productTag.tagId,
          count: sql<number>`count(*)`,
        })
        .from(productTag)
        .groupBy(productTag.tagId);

      const countMap = new Map(counts.map(c => [c.tagId, Number(c.count)]));

      const tagsWithCounts = tags.map(t => ({
        ...t,
        productCount: countMap.get(t.id) || 0,
      }));

      return { success: true, data: tagsWithCounts };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get tags" };
    }
  }

  /**
   * Get tags by type
   */
  async getByType(type: string): Promise<CRUDListResult<Tag>> {
    try {
      const results = await db
        .select()
        .from(tag)
        .where(eq(tag.type, type))
        .orderBy(asc(tag.name));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get tags" };
    }
  }

  /**
   * Add tag to product
   */
  async addToProduct(productId: string, tagId: string): Promise<CRUDResult<boolean>> {
    try {
      await db.insert(productTag).values({ id: crypto.randomUUID(), productId, tagId }).onConflictDoNothing();
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to add tag" };
    }
  }

  /**
   * Remove tag from product
   */
  async removeFromProduct(productId: string, tagId: string): Promise<CRUDResult<boolean>> {
    try {
      await db
        .delete(productTag)
        .where(sql`${productTag.productId} = ${productId} AND ${productTag.tagId} = ${tagId}`);
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to remove tag" };
    }
  }

  /**
   * Get unused tags (no products)
   */
  async getUnused(): Promise<CRUDListResult<Tag>> {
    try {
      const usedTagIds = await db
        .selectDistinct({ tagId: productTag.tagId })
        .from(productTag);

      const usedIds = usedTagIds.map(t => t.tagId);

      const results = usedIds.length > 0
        ? await db.select().from(tag).where(sql`${tag.id} NOT IN ${usedIds}`)
        : await db.select().from(tag);

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get unused tags" };
    }
  }
}

export const TagCRUD = new TagCRUDClass();
