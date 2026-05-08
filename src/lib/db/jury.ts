import { db } from "./index";
import { awardsJury } from "./schema";
import { eq, desc, asc, or, ilike, count, and, sql } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getMostRecentJuryYear = async (): Promise<string> => {
  try {
    const result = await db
      .select({ year: awardsJury.year })
      .from(awardsJury)
      .orderBy(desc(awardsJury.year))
      .limit(1);
    return result[0]?.year || new Date().getFullYear().toString();
  } catch {
    return new Date().getFullYear().toString();
  }
};

export const getAllJuryYears = async (): Promise<string[]> => {
  try {
    const result = await db
      .select({ year: awardsJury.year })
      .from(awardsJury)
      .groupBy(awardsJury.year)
      .orderBy(desc(awardsJury.year));
    return result.map(r => r.year);
  } catch {
    return [];
  }
};

export const getJuryBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", year } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";
    const cleanYear = year?.trim();

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(awardsJury.name, `%${cleanSearchTerm}%`),
        ilike(awardsJury.occupation, `%${cleanSearchTerm}%`),
        ilike(awardsJury.role, `%${cleanSearchTerm}%`)
      ));
    }
    if (cleanYear) conditions.push(eq(awardsJury.year, cleanYear));

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(awardsJury).where(whereCondition);
    const total = totalResult[0].count;

    const juryMembers = await db.query.awardsJury.findMany({
      where: whereCondition,
      with: {
        image: true
      },
      orderBy: (jury, { asc, desc }) => [
        desc(jury.year),
        asc(jury.displayOrder),
        asc(jury.createdAt)
      ],
      limit: MAX_ITEMS_PER_PAGE,
      offset: offset
    });

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const juryMeta: iFetchMeta = {
      total,
      meta: {
        cursor: juryMembers.length > 0 ? juryMembers[juryMembers.length - 1].id : '',
        more: hasNextPage,
        size: juryMembers.length
      },
      data: juryMembers
    };

    return { status: "success", data: juryMeta };
  } catch (error: any) {
    console.error("getJuryBySearchFilter() error:", error);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
