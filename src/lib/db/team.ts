import { db } from "./index";
import { awardsTeam } from "./schema";
import { eq, desc, asc, or, ilike, count, and } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getMostRecentTeamYear = async (): Promise<string> => {
  try {
    const result = await db
      .select({ year: awardsTeam.year })
      .from(awardsTeam)
      .orderBy(desc(awardsTeam.year))
      .limit(1);
    return result[0]?.year || new Date().getFullYear().toString();
  } catch {
    return new Date().getFullYear().toString();
  }
};

export const getAllTeamYears = async (): Promise<string[]> => {
  try {
    const result = await db
      .select({ year: awardsTeam.year })
      .from(awardsTeam)
      .groupBy(awardsTeam.year)
      .orderBy(desc(awardsTeam.year));
    return result.map(r => r.year);
  } catch {
    return [];
  }
};

export const getTeamBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", year } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";
    const cleanYear = year?.trim();

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(awardsTeam.name, `%${cleanSearchTerm}%`),
        ilike(awardsTeam.title, `%${cleanSearchTerm}%`)
      ));
    }
    if (cleanYear) conditions.push(eq(awardsTeam.year, cleanYear));

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(awardsTeam).where(whereCondition);
    const total = totalResult[0].count;

    const teamMembers = await db.query.awardsTeam.findMany({
      where: whereCondition,
      with: {
        image: true
      },
      orderBy: (team, { asc, desc }) => [
        desc(team.year),
        asc(team.displayOrder),
        asc(team.createdAt)
      ],
      limit: MAX_ITEMS_PER_PAGE,
      offset: offset
    });

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const teamMeta: iFetchMeta = {
      total,
      meta: {
        cursor: teamMembers.length > 0 ? teamMembers[teamMembers.length - 1].id : '',
        more: hasNextPage,
        size: teamMembers.length
      },
      data: teamMembers
    };

    return { status: "success", data: teamMeta };
  } catch (error: any) {
    console.error("getTeamBySearchFilter() error:", error);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
