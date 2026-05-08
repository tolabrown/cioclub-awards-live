import { BaseCRUD, eq, and, or, like, ilike, desc, asc, sql, inArray, type CRUDResult, type CRUDListResult } from "./crud";
import { product, productImage, productSize, productTag, category, tag, size, file, type Product, type NewProduct, type ProductImage, type ProductSize } from "./schema";
import { db } from "./drizzle";
import { FileCRUD } from "./file";

interface ProductWithRelations extends Product {
  category?: (typeof category.$inferSelect & { imageFile?: typeof file.$inferSelect | null }) | null;
  images?: (ProductImage & { imageFile?: typeof file.$inferSelect | null })[];
  sizes?: (ProductSize & { size?: typeof size.$inferSelect })[];
  tags?: { tag: typeof tag.$inferSelect }[];
  averageRating?: number;
  reviewCount?: number;
}

interface ProductFilters {
  categoryId?: string;
  categoryIds?: string[];
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isPublished?: boolean;
  isFeatured?: boolean;
  search?: string;
  tags?: string[];
  inStock?: boolean;
  minDiscount?: number;
}

interface ProductSortOptions {
  field: 'name' | 'basePrice' | 'createdAt' | 'stockQuantity';
  direction: 'asc' | 'desc';
}

class ProductCRUDClass extends BaseCRUD<typeof product, Product, NewProduct> {
  constructor() {
    super(product);
  }

  /**
   * Get product by ID with all relations
   */
  async getById(id: string): Promise<CRUDResult<ProductWithRelations>> {
    try {
      const [result] = await db
        .select()
        .from(product)
        .where(eq(product.id, id))
        .limit(1);

      if (!result) {
        return { success: false, error: "Product not found" };
      }

      // Get related data
      const [images, sizes, tags, categoryData] = await Promise.all([
        db.query.productImage.findMany({
          where: eq(productImage.productId, result.id),
          orderBy: (productImage, { asc }) => [asc(productImage.sortOrder)],
          with: { imageFile: true }
        }),
        db.query.productSize.findMany({
          where: eq(productSize.productId, result.id),
          with: { size: true }
        }),
        db.select().from(productTag).where(eq(productTag.productId, result.id)),
        result.categoryId ? db.query.category.findFirst({
          where: eq(category.id, result.categoryId),
          with: { imageFile: true }
        }) : Promise.resolve(null),
      ]);

      return {
        success: true,
        data: {
          ...result,
          category: categoryData || null,
          images: images as any,
          sizes,
          tags: tags as any,
        },
      };
    } catch (error) {
      console.error(`[ProductCRUD] GetById error:`, error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get product" };
    }
  }


  /**
   * Get products with filters, sorting, and pagination
   */
  async getFiltered(
    filters?: ProductFilters,
    sort?: ProductSortOptions,
    page = 1,
    limit = 20
  ): Promise<CRUDListResult<ProductWithRelations>> {
    try {
      const offset = (page - 1) * limit;
      const conditions: any[] = [];

      if (filters?.isActive !== undefined) {
        conditions.push(eq(product.isActive, filters.isActive));
      }
      if (filters?.isPublished !== undefined) {
        conditions.push(eq(product.isPublished, filters.isPublished));
      }
      if (filters?.isFeatured !== undefined) {
        conditions.push(eq(product.isFeatured, filters.isFeatured));
      }
      if (filters?.categoryId) {
        conditions.push(eq(product.categoryId, filters.categoryId));
      }
      if (filters?.categoryIds && filters.categoryIds.length > 0) {
        conditions.push(inArray(product.categoryId, filters.categoryIds));
      }
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            ilike(product.name, searchTerm),
            ilike(product.description, searchTerm),
            ilike(product.shortDescription, searchTerm),
            ilike(product.sku, searchTerm),
            ilike(product.barcode, searchTerm),
            ilike(product.metaTitle, searchTerm),
            ilike(product.metaDescription, searchTerm),
          ),
        );
      }
      if (filters?.minPrice !== undefined) {
        conditions.push(sql`${product.basePrice} >= ${filters.minPrice}`);
      }
      if (filters?.maxPrice !== undefined) {
        conditions.push(sql`${product.basePrice} <= ${filters.maxPrice}`);
      }
      if (filters?.inStock) {
        conditions.push(sql`${product.stockQuantity} > 0`);
      }
      if (filters?.minDiscount !== undefined) {
        conditions.push(sql`${product.compareAtPrice} > 0 AND (${product.compareAtPrice} - ${product.basePrice}) / ${product.compareAtPrice} * 100 >= ${filters.minDiscount}`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Count total
      const countQuery = db.select({ count: sql<number>`count(*)` }).from(product);
      if (whereClause) countQuery.where(whereClause);
      const [countResult] = await countQuery;
      const total = Number(countResult?.count || 0);

      // Get products using relational query
      const results = await db.query.product.findMany({
        where: whereClause,
        with: {
          category: {
            with: { imageFile: true }
          },
          images: {
            orderBy: (images, { asc }) => [asc(images.sortOrder)],
            with: { imageFile: true }
          }
        },
        orderBy: (product, { asc, desc }) => {
          if (sort) {
            return [sort.direction === 'asc' ? asc(product[sort.field]) : desc(product[sort.field])];
          }
          return [desc(product.createdAt)];
        },
        limit,
        offset,
      });

      return {
        success: true,
        data: results as ProductWithRelations[],
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error(`[ProductCRUD] GetFiltered error:`, error);
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get products" };
    }
  }

  /**
   * Get featured products
   */
  async getFeatured(limit = 12): Promise<CRUDListResult<ProductWithRelations>> {
    return this.getFiltered({ isActive: true, isFeatured: true }, undefined, 1, limit);
  }

  /**
   * Get products by category id
   */
  async getByCategory(categoryId: string, page = 1, limit = 20): Promise<CRUDListResult<ProductWithRelations>> {
    return this.getFiltered({ categoryId, isActive: true }, undefined, page, limit);
  }

  /**
   * Search products
   */
  async search(query: string, page = 1, limit = 20): Promise<CRUDListResult<ProductWithRelations>> {
    return this.getFiltered({ search: query, isActive: true }, undefined, page, limit);
  }

  /**
   * Add image to product
   */
  async addImage(productId: string, imageData: Omit<typeof productImage.$inferInsert, 'productId'>): Promise<CRUDResult<ProductImage>> {
    try {
      const [result] = await db.insert(productImage).values({ ...imageData, productId }).returning();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to add image" };
    }
  }

  /**
   * Remove image from product
   */
  async removeImage(imageId: string): Promise<CRUDResult<ProductImage>> {
    try {
      const [result] = await db.delete(productImage).where(eq(productImage.id, imageId)).returning();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to remove image" };
    }
  }

  /**
   * Update stock quantity
   */
  async updateStock(productId: string, quantity: number): Promise<CRUDResult<Product>> {
    return this.update(productId, { stockQuantity: quantity });
  }

  /**
   * Get low stock products
   */
  async getLowStock(): Promise<CRUDListResult<Product>> {
    try {
      const results = await db
        .select()
        .from(product)
        .where(sql`${product.stockQuantity} <= ${product.lowStockThreshold}`)
        .orderBy(asc(product.stockQuantity));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get low stock products" };
    }
  }

  /**
   * Delete product with all its associated data (images in storage, etc.)
   */
  async delete(id: string): Promise<CRUDResult<Product>> {
    try {
      // 1. Get product with images to clean up storage
      const productResult = await this.getById(id);
      if (!productResult.success || !productResult.data) {
        return { success: false, error: "Product not found" };
      }

      const productData = productResult.data;

      // 2. Delete associated images from storage and file table
      if (productData.images && productData.images.length > 0) {
        for (const img of productData.images) {
          if (img.fileId) {
            await FileCRUD.deleteWithStorage(img.fileId);
          }
        }
      }

      // 3. HOTPATCH: Explicitly handle order_item foreign key constraint
      // This ensures deletion works even if standard migrations haven't run.
      try {
        // A. Make column nullable
        await db.execute(sql`ALTER TABLE "order_item" ALTER COLUMN "product_id" DROP NOT NULL`);
        // B. Update constraint to SET NULL (Postgres specific)
        await db.execute(sql`
          ALTER TABLE "order_item" 
          DROP CONSTRAINT IF EXISTS "order_item_product_id_product_id_fk",
          ADD CONSTRAINT "order_item_product_id_product_id_fk" 
          FOREIGN KEY ("product_id") 
          REFERENCES "product"("id") 
          ON DELETE SET NULL
        `);
      } catch (err) {
        console.warn("[ProductCRUD] Deletion hotpatch warning (likely already applied or permissions issue):", err);
      }

      // 4. Delete the product itself
      // Note: productSize, productImage, productTag etc. have onDelete: "cascade"
      const [result] = await db.delete(product).where(eq(product.id, id)).returning();

      if (!result) {
        return { success: false, error: "Product record not found after deletion attempt" };
      }

      return { success: true, data: result };
    } catch (error) {
      console.error(`[ProductCRUD] Delete error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete product (possibly due to existing orders)"
      };
    }
  }
}

export const ProductCRUD = new ProductCRUDClass();
