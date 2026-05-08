import { BaseCRUD, eq, and, or, ilike, asc, sql, type CRUDResult, type CRUDListResult } from "./crud";
import { category, product, type Category, type NewCategory, type File } from "./schema";
import { db } from "./drizzle";

interface CategoryWithChildren extends Category {
  imageFile?: File | null;
  children?: Category[];
  productCount?: number;
}

interface CategoryTree extends Category {
  children: CategoryTree[];
}

class CategoryCRUDClass extends BaseCRUD<typeof category, Category, NewCategory> {
  constructor() {
    super(category);
  }

  /**
   * Get category by id
   */
  async getById(id: string): Promise<CRUDResult<CategoryWithChildren>> {
    try {
      const result = await db.query.category.findFirst({
        where: eq(category.id, id),
        with: {
          imageFile: true,
          children: {
            orderBy: asc(category.sortOrder)
          }
        }
      });

      if (!result) {
        return { success: false, error: "Category not found" };
      }

      return {
        success: true,
        data: result as CategoryWithChildren,
      };
    } catch (error) {
      console.error(`[CategoryCRUD] GetById error:`, error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get category" };
    }
  }

  /**
   * Get all active categories with product counts
   */
  async getActiveWithCounts(): Promise<CRUDListResult<CategoryWithChildren>> {
    try {
      const categories = await db.query.category.findMany({
        where: eq(category.isActive, true),
        with: {
          imageFile: true
        },
        orderBy: asc(category.sortOrder)
      });

      // Get product counts
      const productCounts = await db
        .select({
          categoryId: product.categoryId,
          count: sql<number>`count(*)`,
        })
        .from(product)
        .where(eq(product.isActive, true))
        .groupBy(product.categoryId);

      const countMap = new Map(productCounts.map(pc => [pc.categoryId, Number(pc.count)]));

      const categoriesWithCounts = categories.map(cat => ({
        ...cat,
        productCount: countMap.get(cat.id) || 0,
      })) as CategoryWithChildren[];

      // Sort by product count descending
      categoriesWithCounts.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));

      return { success: true, data: categoriesWithCounts };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get categories" };
    }
  }

  /**
   * Get root categories (no parent)
   */
  async getRootCategories(): Promise<CRUDListResult<CategoryWithChildren>> {
    try {
      const results = await db.query.category.findMany({
        where: sql`${category.parentId} IS NULL`,
        with: {
          imageFile: true
        },
        orderBy: asc(category.sortOrder)
      });

      return { success: true, data: results as CategoryWithChildren[] };
    } catch (error) {
      console.error(`[CategoryCRUD] GetRootCategories error:`, error);
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get root categories" };
    }
  }

  /**
   * Get category tree (hierarchical)
   */
  async getTree(): Promise<CRUDResult<CategoryTree[]>> {
    try {
      const allCategories = await db.query.category.findMany({
        where: eq(category.isActive, true),
        with: {
          imageFile: true
        },
        orderBy: asc(category.sortOrder)
      });

      const buildTree = (parentId: string | null): CategoryTree[] => {
        return allCategories
          .filter(cat => cat.parentId === parentId)
          .map(cat => ({
            ...cat,
            children: buildTree(cat.id),
          })) as CategoryTree[];
      };

      return { success: true, data: buildTree(null) };
    } catch (error) {
      console.error(`[CategoryCRUD] GetTree error:`, error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to build category tree" };
    }
  }

  /**
   * Get children of a category
   */
  async getChildren(parentId: string): Promise<CRUDListResult<CategoryWithChildren>> {
    try {
      const results = await db.query.category.findMany({
        where: eq(category.parentId, parentId),
        with: {
          imageFile: true
        },
        orderBy: asc(category.sortOrder)
      });

      return { success: true, data: results as CategoryWithChildren[] };
    } catch (error) {
      console.error(`[CategoryCRUD] GetChildren error:`, error);
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get children" };
    }
  }

  /**
   * Get all categories with image file
   */
  async getAll(): Promise<CRUDListResult<CategoryWithChildren>> {
    try {
      const results = await db.query.category.findMany({
        with: {
          imageFile: true
        },
        orderBy: asc(category.sortOrder)
      });

      return { success: true, data: results as CategoryWithChildren[] };
    } catch (error) {
      console.error(`[CategoryCRUD] GetAll error:`, error);
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get categories" };
    }
  }

  /**
   * Update sort order for multiple categories
   */
  async updateSortOrder(updates: { id: string; sortOrder: number }[]): Promise<CRUDResult<boolean>> {
    try {
      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          db.update(category).set({ sortOrder }).where(eq(category.id, id))
        )
      );
      return { success: true, data: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to update sort order" };
    }
  }

  /**
   * Get categories with filters, sorting, and pagination
   */
  async getFiltered(
    filters?: { search?: string; isActive?: boolean },
    page = 1,
    limit = 20
  ): Promise<CRUDListResult<CategoryWithChildren>> {
    try {
      const offset = (page - 1) * limit;
      const conditions: any[] = [];

      if (filters?.isActive !== undefined) {
        conditions.push(eq(category.isActive, filters.isActive));
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            ilike(category.name, searchTerm),
            ilike(category.description, searchTerm)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count total
      const countQuery = db.select({ count: sql<number>`count(*)` }).from(category);
      if (whereClause) countQuery.where(whereClause);
      const [countResult] = await countQuery;
      const total = Number(countResult?.count || 0);

      // Get categories
      const categories = await db.query.category.findMany({
        where: whereClause,
        with: {
          imageFile: true
        },
        orderBy: asc(category.sortOrder),
        limit,
        offset,
      });

      // Get product counts
      const productCounts = await db
        .select({
          categoryId: product.categoryId,
          count: sql<number>`count(*)`,
        })
        .from(product)
        .groupBy(product.categoryId);

      const countMap = new Map(productCounts.map(pc => [pc.categoryId, Number(pc.count)]));

      const categoriesWithCounts = categories.map(cat => ({
        ...cat,
        productCount: countMap.get(cat.id) || 0,
      })) as CategoryWithChildren[];

      return {
        success: true,
        data: categoriesWithCounts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`[CategoryCRUD] GetFiltered error:`, error);
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get categories" };
    }
  }
}

export const CategoryCRUD = new CategoryCRUDClass();
