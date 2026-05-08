import { db } from "./drizzle";
import { educationItem, file, user as userTable } from "./schema";
import { eq, and, or, sql, desc, asc, ilike, count } from "drizzle-orm";
import type { iEducation, iEducationFilters, iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";
import { onError, onSuccess, type iResult } from "$lib/utils";

export class EducationCRUD {
  /**
   * Helper function to build education select query with banner file and user
   */
  private static buildEducationSelect() {
    return {
      id: educationItem.id,
      title: educationItem.title,
      category: educationItem.category,
      duration: educationItem.duration,
      image: sql`jsonb_build_object(
        'id', ${file.id},
        'name', ${file.name},
        'url', ${file.url},
        'size', ${file.size},
        'type', ${file.type},
        'remoteId', ${file.remoteId},
        'createdAt', ${file.createdAt},
        'updatedAt', ${file.updatedAt}
      )`.as('image'),
      premium: educationItem.premium,
      content: educationItem.content,
      videoUrl: educationItem.videoUrl,
      type: educationItem.type,
      createdAt: educationItem.createdAt,
      updatedAt: educationItem.updatedAt,
    };
  }

  /**
   * Create a new education post
   */
  static async create(data: Partial<iEducation>): Promise<iEducation | null> {
    try {
      // Clean up input data: remove internal fields and empty strings
      const { id, createdAt, updatedAt, ...cleanData } = data as any;

      const [newEducation] = await db
        .insert(educationItem)
        .values(cleanData)
        .returning();

      if (!newEducation) return null;

      // Fetch with banner file
      return await this.getById(newEducation.id);
    } catch (error: any) {
      console.error("EducationCRUD.create error:", error.message);
      return null;
    }
  }

  /**
   * Get education post by ID with banner file
   */
  static async getById(id: string): Promise<iEducation | null> {
    try {
      const result = await db
        .select(this.buildEducationSelect())
        .from(educationItem)
        .leftJoin(file, eq(educationItem.image, file.id))
        .where(eq(educationItem.id, id))
        .limit(1);

      if (!result || result.length === 0) return null;
      return result[0] as iEducation;
    } catch (error: any) {
      console.error("EducationCRUD.getById error:", error.message);
      return null;
    }
  }

  /**
   * Update education post
   */
  static async update(id: string, data: Partial<iEducation>): Promise<iEducation | null> {
    try {
      // Clean up input data
      const { id: _, createdAt, updatedAt, ...cleanData } = data as any;

      const [updated] = await db
        .update(educationItem)
        .set(cleanData)
        .where(eq(educationItem.id, id))
        .returning();

      if (!updated) return null;
      return await this.getById(id);
    } catch (error: any) {
      console.error("EducationCRUD.update error:", error.message);
      return null;
    }
  }

  /**
   * Delete education post
   */
  /**
   * Delete education post with full cleanup (Minio -> File Record -> Article)
   */
  static async delete(id: string): Promise<boolean> {
    try {
      // 1. Get the article and its image_id
      const article = await db.query.educationItem.findFirst({
        where: eq(educationItem.id, id),
        with: {
          banner: true
        }
      });

      if (!article) return false;

      // 2. If it has an image, clean up Minio and File table
      if (article.image) {
        const fileId = article.image;
        const fileRecord = await db.query.file.findFirst({
          where: eq(file.id, fileId)
        });

        if (fileRecord) {
          try {
            // Import dynamically to avoid circular dependencies if any
            const { deleteFileById } = await import('$lib/server/minio');
            const { env } = await import('$env/dynamic/private');

            // a. Remove from Minio
            await deleteFileById(env.MINIO_BUCKET, fileRecord.remoteId);

            // b. Remove from File table
            await db.delete(file).where(eq(file.id, fileId));
          } catch (fileErr: any) {
            console.error("Cleanup error during deletion:", fileErr.message);
            // Continue with article deletion even if file cleanup fails
          }
        }
      }

      // 3. Delete the article (image_id will already be handled if we deleted the file record 
      // due to foreign key but this ensures the article is gone)
      const result = await db
        .delete(educationItem)
        .where(eq(educationItem.id, id))
        .returning();

      return result.length > 0;
    } catch (error: any) {
      console.error("EducationCRUD.delete error:", error.message);
      return false;
    }
  }

  /**
   * List education posts with filters and pagination
   */
  static async list(
    filters: iEducationFilters = {},
    options: {
      page?: number;
      limit?: number;
      orderBy?: 'createdAt';
      order?: 'asc' | 'desc';
    } = {}
  ): Promise<iFetchMeta> {
    try {
      const { page = 1, limit = 20, orderBy = 'createdAt', order = 'desc' } = options;
      const offset = (page - 1) * limit;

      const conditions = [];

      if (filters.category) {
        conditions.push(eq(educationItem.category, filters.category));
      }

      if (filters.type) {
        conditions.push(eq(educationItem.type, filters.type));
      }

      if (filters.search) {
        conditions.push(
          or(
            ilike(educationItem.title, `%${filters.search}%`),
            ilike(educationItem.content, `%${filters.search}%`)
          )!
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [countResult] = await db
        .select({ cnt: count() })
        .from(educationItem)
        .where(whereClause);

      const cnt = countResult.cnt;

      const orderColumn = {
        createdAt: order === 'desc' ? desc(educationItem.createdAt) : asc(educationItem.createdAt),
      }[orderBy];

      const posts = await db
        .select(this.buildEducationSelect())
        .from(educationItem)
        .leftJoin(file, eq(educationItem.image, file.id))
        .where(whereClause)
        .orderBy(orderColumn)
        .limit(limit)
        .offset(offset);

      return {
        data: posts,
        total: cnt,
        meta: {
          cursor: `${page}`,
          more: offset + posts.length < cnt,
          size: posts.length,
        },
      };
    } catch (error: any) {
      console.error("EducationCRUD.list error:", error.message);
      return { data: [], total: 0, meta: { cursor: '', more: false, size: 0 } };
    }
  }

  /**
   * Get adjacent articles (prev/next) for navigation
   */
  static async getAdjacent(currentId: string): Promise<{ prev: any | null; next: any | null }> {
    try {
      const current = await db
        .select({ createdAt: educationItem.createdAt })
        .from(educationItem)
        .where(eq(educationItem.id, currentId))
        .limit(1);

      if (!current.length) return { prev: null, next: null };

      // Simplified selection for navigation
      const navSelect = {
        id: educationItem.id,
        title: educationItem.title
      };

      const [prev] = await db
        .select(navSelect)
        .from(educationItem)
        .where(sql`${educationItem.createdAt} < ${current[0].createdAt}`)
        .orderBy(desc(educationItem.createdAt))
        .limit(1);

      const [next] = await db
        .select(navSelect)
        .from(educationItem)
        .where(sql`${educationItem.createdAt} > ${current[0].createdAt}`)
        .orderBy(asc(educationItem.createdAt))
        .limit(1);

      return {
        prev: prev || null,
        next: next || null
      };
    } catch (error: any) {
      console.error("EducationCRUD.getAdjacent error:", error.message);
      return { prev: null, next: null };
    }
  }
}
