import { db } from "./index";
import { awardWinner } from "./schema";
import { eq, desc, asc, or, ilike, count, and, sql } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getMostRecentWinnerYear = async (): Promise<string> => {
  try {
    const result = await db
      .select({ year: awardWinner.year })
      .from(awardWinner)
      .orderBy(desc(awardWinner.year))
      .limit(1);
    return result[0]?.year || new Date().getFullYear().toString();
  } catch {
    return new Date().getFullYear().toString();
  }
};

export const getAllWinnerYears = async (): Promise<string[]> => {
  try {
    const result = await db
      .select({ year: awardWinner.year })
      .from(awardWinner)
      .groupBy(awardWinner.year)
      .orderBy(desc(awardWinner.year));
    return result.map(r => r.year);
  } catch {
    return [];
  }
};

export const getWinnersBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", year, category } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";
    const cleanYear = year?.trim();
    const cleanCategory = category?.trim();

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(awardWinner.name, `%${cleanSearchTerm}%`),
        ilike(awardWinner.awardType, `%${cleanSearchTerm}%`),
        ilike(awardWinner.organization, `%${cleanSearchTerm}%`)
      ));
    }
    if (cleanYear) conditions.push(eq(awardWinner.year, cleanYear));

    if (cleanCategory) {
      if (cleanCategory === "special") {
        conditions.push(ilike(awardWinner.awardType, "%special%"));
      } else if (cleanCategory === "corporate") {
        conditions.push(ilike(awardWinner.awardType, "%corporate%"));
      } else if (cleanCategory === "industry") {
        // Industry is anything that's not special or corporate
        conditions.push(and(
          sql`NOT (${awardWinner.awardType} ILIKE '%special%')`,
          sql`NOT (${awardWinner.awardType} ILIKE '%corporate%')`
        ));
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(awardWinner).where(whereCondition);
    const total = totalResult[0].count;

    const winners = await db.query.awardWinner.findMany({
      where: whereCondition,
      with: {
        image: true
      },
      orderBy: (winners, { asc, desc }) => [
        desc(winners.year),
        asc(winners.displayOrder),
        asc(winners.createdAt)
      ],
      limit: MAX_ITEMS_PER_PAGE,
      offset: offset
    });

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const winnerMeta: iFetchMeta = {
      total,
      meta: {
        cursor: winners.length > 0 ? winners[winners.length - 1].id : '',
        more: hasNextPage,
        size: winners.length
      },
      data: winners
    };

    return { status: "success", data: winnerMeta };
  } catch (error: any) {
    console.error("getWinnersBySearchFilter() error:", error);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
