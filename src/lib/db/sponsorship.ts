import { db } from "./index";
import { sponsorshipInquiry } from "./schema";
import { eq, desc, count, and, or, ilike, gte, lt } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getSponsorshipInquiriesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
      packageInterest,
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
        ilike(sponsorshipInquiry.companyName, `%${cleanSearchTerm}%`),
        ilike(sponsorshipInquiry.contactName, `%${cleanSearchTerm}%`),
        ilike(sponsorshipInquiry.contactEmail, `%${cleanSearchTerm}%`),
        ilike(sponsorshipInquiry.message, `%${cleanSearchTerm}%`)
      ));
    }

    if (packageInterest && packageInterest !== "All Packages") conditions.push(eq(sponsorshipInquiry.packageInterest, packageInterest));
    if (status && status !== "All Status") conditions.push(eq(sponsorshipInquiry.status, status));

    if (year) {
      const yearStart = new Date(parseInt(year), 0, 1);
      const yearEnd = new Date(parseInt(year) + 1, 0, 1);
      conditions.push(and(
        gte(sponsorshipInquiry.createdAt, yearStart),
        lt(sponsorshipInquiry.createdAt, yearEnd)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(sponsorshipInquiry).where(whereCondition);
    const total = totalResult[0].count;

    let query = db
      .select()
      .from(sponsorshipInquiry)
      .where(whereCondition)
      .orderBy(desc(sponsorshipInquiry.createdAt));

    if (!isExport) {
      query = query.limit(MAX_ITEMS_PER_PAGE).offset(offset) as any;
    }

    const results = await query;

    const hasMore = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: {
        cursor: results.length > 0 ? results[results.length - 1].id : '',
        more: isExport ? false : hasMore,
        size: results.length
      },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.error("getSponsorshipInquiriesBySearchFilter() error:", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
