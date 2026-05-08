import { db } from "./drizzle";
import { eq, and, or, like, ilike, desc, asc, sql, inArray, type SQL } from "drizzle-orm";

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    cursor?: string;
  };
}

export interface CRUDResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CRUDListResult<T> {
  success: boolean;
  data: T[];
  meta?: PaginatedResult<T>["meta"];
  error?: string;
}

/**
 * Base CRUD class for database operations.
 * Extend this class for each schema table.
 */
export abstract class BaseCRUD<TTable, TSelect, TInsert> {
  protected table: TTable;
  protected db = db;

  constructor(table: TTable) {
    this.table = table;
  }

  /**
   * Create a new record
   */
  async create(data: Omit<TInsert, 'id'> & { id?: string }): Promise<CRUDResult<TSelect>> {
    try {
      const insertData = {
        id: (data as any).id || crypto.randomUUID(),
        ...data as any
      };

      const [result] = await (this.db as any)
        .insert(this.table)
        .values(insertData)
        .returning();
      return { success: true, data: result as TSelect };
    } catch (error) {
      console.error(`[CRUD] Create error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create record"
      };
    }
  }

  /**
   * Create multiple records
   */
  async createMany(data: (Omit<TInsert, 'id'> & { id?: string })[]): Promise<CRUDResult<TSelect[]>> {
    try {
      const insertData = data.map(item => ({
        id: (item as any).id || crypto.randomUUID(),
        ...item as any
      }));

      const results = await (this.db as any)
        .insert(this.table)
        .values(insertData)
        .returning();
      return { success: true, data: results as TSelect[] };
    } catch (error) {
      console.error(`[CRUD] CreateMany error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create records"
      };
    }
  }

  /**
   * Get a record by ID
   */
  async getById(id: string): Promise<CRUDResult<TSelect>> {
    try {
      const idColumn = (this.table as any).id;
      const [result] = await this.db
        .select()
        .from(this.table as any)
        .where(eq(idColumn, id))
        .limit(1);

      if (!result) {
        return { success: false, error: "Record not found" };
      }
      return { success: true, data: result as TSelect };
    } catch (error) {
      console.error(`[CRUD] GetById error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get record"
      };
    }
  }

  /**
   * Get all records with optional pagination
   */
  async getAll(params?: PaginationParams): Promise<CRUDListResult<TSelect>> {
    try {
      const page = params?.page || 1;
      const limit = params?.limit || 20;
      const offset = (page - 1) * limit;

      const [countResult] = await this.db
        .select({ count: sql<number>`count(*)` })
        .from(this.table as any);

      const total = Number(countResult?.count || 0);

      const results = await this.db
        .select()
        .from(this.table as any)
        .limit(limit)
        .offset(offset);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: results as TSelect[],
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      console.error(`[CRUD] GetAll error:`, error);
      return {
        success: false,
        data: [],
        error: error instanceof Error ? error.message : "Failed to get records"
      };
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: Partial<TInsert>): Promise<CRUDResult<TSelect>> {
    try {
      const idColumn = (this.table as any).id;
      const updatedAtColumn = (this.table as any).updatedAt;

      const updateData = updatedAtColumn
        ? { ...data, updatedAt: new Date() }
        : data;

      const [result] = await (this.db as any)
        .update(this.table)
        .set(updateData as any)
        .where(eq(idColumn, id))
        .returning();

      if (!result) {
        return { success: false, error: "Record not found" };
      }
      return { success: true, data: result as TSelect };
    } catch (error) {
      console.error(`[CRUD] Update error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update record"
      };
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<CRUDResult<TSelect>> {
    try {
      const idColumn = (this.table as any).id;
      const [result] = await (this.db as any)
        .delete(this.table)
        .where(eq(idColumn, id))
        .returning();

      if (!result) {
        return { success: false, error: "Record not found" };
      }
      return { success: true, data: result as TSelect };
    } catch (error) {
      console.error(`[CRUD] Delete error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete record"
      };
    }
  }

  /**
   * Delete multiple records by IDs
   */
  async deleteMany(ids: string[]): Promise<CRUDResult<number>> {
    try {
      const idColumn = (this.table as any).id;
      const conditions = ids.map(id => eq(idColumn, id));

      const results = await (this.db as any)
        .delete(this.table)
        .where(or(...conditions))
        .returning();

      return { success: true, data: results.length };
    } catch (error) {
      console.error(`[CRUD] DeleteMany error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete records"
      };
    }
  }

  /**
   * Check if a record exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const idColumn = (this.table as any).id;
      const [result] = await this.db
        .select({ id: idColumn })
        .from(this.table as any)
        .where(eq(idColumn, id))
        .limit(1);
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Count total records
   */
  async count(where?: SQL): Promise<number> {
    try {
      const query = this.db
        .select({ count: sql<number>`count(*)` })
        .from(this.table as any);

      if (where) {
        (query as any).where(where);
      }

      const [result] = await query;
      return Number(result?.count || 0);
    } catch {
      return 0;
    }
  }
}

// Re-export useful drizzle operators
export { eq, and, or, like, ilike, desc, asc, sql, inArray };
