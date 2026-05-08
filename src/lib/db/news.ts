import { db } from "./index";
import { news } from "./schema";
import { eq, desc, or, ilike, count, and } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getNewsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", category } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";
    const cleanCategory = category?.trim();

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(news.title, `%${cleanSearchTerm}%`),
        ilike(news.caption, `%${cleanSearchTerm}%`)
      ));
    }
    if (cleanCategory && cleanCategory !== "All News") {
      conditions.push(eq(news.category, cleanCategory));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(news).where(whereCondition);
    const total = totalResult[0].count;

    const newsItems = await db.query.news.findMany({
      where: whereCondition,
      with: {
        image: true
      },
      orderBy: [desc(news.createdAt)],
      limit: MAX_ITEMS_PER_PAGE,
      offset: offset
    });

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const newsMeta: iFetchMeta = {
      total,
      meta: {
        cursor: newsItems.length > 0 ? newsItems[newsItems.length - 1].id : '',
        more: hasNextPage,
        size: newsItems.length
      },
      data: newsItems
    };

    return { status: "success", data: newsMeta };
  } catch (error: any) {
    console.error("getNewsBySearchFilter() error:", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
