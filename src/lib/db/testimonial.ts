import { db } from "./index";
import { testimonial } from "./schema";
import { eq, desc, count, and, or, ilike } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getTestimonialsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
    } = params;

    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];

    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(testimonial.name, `%${cleanSearchTerm}%`),
        ilike(testimonial.organization, `%${cleanSearchTerm}%`),
        ilike(testimonial.country, `%${cleanSearchTerm}%`),
        ilike(testimonial.testimonial, `%${cleanSearchTerm}%`)
      ));
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(testimonial).where(whereCondition);
    const total = totalResult[0].count;

    const results = await db.query.testimonial.findMany({
      where: whereCondition,
      orderBy: [desc(testimonial.createdAt)],
      limit: MAX_ITEMS_PER_PAGE,
      offset: offset,
      with: {
        image: true
      }
    });

    const hasMore = offset + MAX_ITEMS_PER_PAGE < total;

    const meta: iFetchMeta = {
      total,
      meta: {
        cursor: results.length > 0 ? results[results.length - 1].id : '',
        more: hasMore,
        size: results.length
      },
      data: results
    };

    return { status: "success", data: meta };
  } catch (error: any) {
    console.error("getTestimonialsBySearchFilter() error:", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
