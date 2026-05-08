import { db } from "$lib/db";
import { membershipInquiry, user as userTable } from "$lib/db/schema";
import { desc, eq, count, sql, and, or, ilike, type SQL } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const search = url.searchParams.get("search") || "";
  const limit = 24;
  const offset = (page - 1) * limit;

  try {
    // Build filters - only show approved members
    const filterConditions: (SQL | undefined)[] = [eq(membershipInquiry.status, "approved")];
    
    if (search) {
      filterConditions.push(
        or(
          ilike(membershipInquiry.fullName, `%${search}%`),
          ilike(membershipInquiry.organization, `%${search}%`)
        )
      );
    }

    const members = await db
      .select({
        fullName: membershipInquiry.fullName,
        organization: membershipInquiry.organization,
        jobTitle: membershipInquiry.jobTitle,
        tier: membershipInquiry.tier,
        subscriptionEndsAt: userTable.subscriptionEndsAt,
      })
      .from(membershipInquiry)
      .leftJoin(userTable, eq(sql`lower(${membershipInquiry.email})`, sql`lower(${userTable.email})`))
      .where(and(...filterConditions))
      .orderBy(desc(membershipInquiry.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for basic stats
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(membershipInquiry)
      .where(and(...filterConditions));

    return {
      members,
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        hasMore: offset + limit < Number(totalCount)
      }
    };
  } catch (e) {
    console.error("Error loading members directory:", e);
    throw error(500, "Failed to load member directory");
  }
};
