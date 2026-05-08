import { db } from "./index";
import { awardEntry, user as userTable } from "./schema";
import { eq, desc, asc, or, ilike, count, and, sql, gte, lt } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getAwardEntriesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
      category,
      status,
      industry,
      year,
      export: isExportFlag
    } = params;

    const isExport = isExportFlag === "true" || (typeof isExportFlag === "boolean" && isExportFlag === true);
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];

    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(awardEntry.projectTitle, `%${cleanSearchTerm}%`),
        ilike(awardEntry.organizationName, `%${cleanSearchTerm}%`),
        ilike(userTable.name, `%${cleanSearchTerm}%`)
      ));
    }

    if (category && category !== "All Categories") conditions.push(eq(awardEntry.category, category));
    if (status && status !== "All Status") conditions.push(eq(awardEntry.status, status));
    if (industry && industry !== "All Industries") conditions.push(eq(awardEntry.industry, industry));

    if (year) {
      const yearStart = new Date(parseInt(year), 0, 1);
      const yearEnd = new Date(parseInt(year) + 1, 0, 1);
      conditions.push(and(
        gte(awardEntry.submittedAt, yearStart),
        lt(awardEntry.submittedAt, yearEnd)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db
      .select({ count: count() })
      .from(awardEntry)
      .leftJoin(userTable, eq(awardEntry.userId, userTable.id))
      .where(whereCondition);

    const total = totalResult[0].count;

    let query = db
      .select({
        id: awardEntry.id,
        userId: awardEntry.userId,
        userName: userTable.name,
        userEmail: userTable.email,
        category: awardEntry.category,
        projectTitle: awardEntry.projectTitle,
        projectDescription: awardEntry.projectDescription,
        organizationName: awardEntry.organizationName,
        industry: awardEntry.industry,
        country: awardEntry.country,
        impactStatement: awardEntry.impactStatement,
        supportingDocId: awardEntry.supportingDocId,
        status: awardEntry.status,
        submittedAt: awardEntry.submittedAt,
        updatedAt: awardEntry.updatedAt,
      })
      .from(awardEntry)
      .leftJoin(userTable, eq(awardEntry.userId, userTable.id))
      .where(whereCondition)
      .orderBy(desc(awardEntry.submittedAt));

    if (!isExport) {
      query = query.limit(MAX_ITEMS_PER_PAGE).offset(offset) as any;
    }

    const entries = await query;

    const hasMore = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: {
        cursor: entries.length > 0 ? entries[entries.length - 1].id : '',
        more: isExport ? false : hasMore,
        size: entries.length
      },
      data: entries
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.error("getAwardEntriesBySearchFilter() error:", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
