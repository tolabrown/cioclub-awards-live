import { db } from "./index";
import { nomination } from "./schema";
import { eq, desc, count, and, or, ilike, gte, lt } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getNomineesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
      category,
      status,
      year,
      export: isExportFlag
    } = params;

    const isExport = isExportFlag === "true" || (typeof isExportFlag === "boolean" && isExportFlag === true);
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];

    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(nomination.nomineeFullName, `%${cleanSearchTerm}%`),
        ilike(nomination.nomineeCompany, `%${cleanSearchTerm}%`),
        ilike(nomination.nominatorName, `%${cleanSearchTerm}%`),
        ilike(nomination.nominatorEmail, `%${cleanSearchTerm}%`)
      ));
    }

    if (category && category !== "All Categories") conditions.push(eq(nomination.category, category));
    if (status && status !== "All Status") conditions.push(eq(nomination.status, status));

    if (year) {
      const yearStart = new Date(parseInt(year), 0, 1);
      const yearEnd = new Date(parseInt(year) + 1, 0, 1);
      conditions.push(and(
        gte(nomination.createdAt, yearStart),
        lt(nomination.createdAt, yearEnd)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(nomination).where(whereCondition);
    const total = totalResult[0].count;

    let query = db
      .select()
      .from(nomination)
      .where(whereCondition)
      .orderBy(desc(nomination.createdAt));

    if (!isExport) {
      query = query.limit(MAX_ITEMS_PER_PAGE).offset(offset) as any;
    }

    const nominations = await query;

    const hasMore = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: {
        cursor: nominations.length > 0 ? nominations[nominations.length - 1].id : '',
        more: isExport ? false : hasMore,
        size: nominations.length
      },
      data: nominations
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.error("getNomineesBySearchFilter() error:", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
