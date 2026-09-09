import { db } from "$lib/db";
import { volunteerApplication } from "$lib/db/schema";
import { desc, eq, count, sql, ilike, or } from "drizzle-orm";
import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { logActivity } from "$lib/server/activity-log";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const statusFilter = url.searchParams.get("status") || "all";
  const searchQuery = url.searchParams.get("q")?.trim() || "";
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    let whereConditions = [];

    if (statusFilter !== "all") {
      whereConditions.push(eq(volunteerApplication.status, statusFilter));
    }

    if (searchQuery) {
      whereConditions.push(
        or(
          ilike(volunteerApplication.firstName, `%${searchQuery}%`),
          ilike(volunteerApplication.lastName, `%${searchQuery}%`),
          ilike(volunteerApplication.email, `%${searchQuery}%`),
          ilike(volunteerApplication.phone, `%${searchQuery}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0
      ? (whereConditions.length === 1 ? whereConditions[0] : sql`${whereConditions[0]} AND ${whereConditions[1]}`)
      : undefined;

    const applications = await db
      .select()
      .from(volunteerApplication)
      .where(whereClause)
      .orderBy(desc(volunteerApplication.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(volunteerApplication)
      .where(whereClause);

    // Get status breakdown metrics
    const allApps = await db.select({
      id: volunteerApplication.id,
      status: volunteerApplication.status,
    }).from(volunteerApplication);

    const stats = {
      total: allApps.length,
      pending: allApps.filter(a => a.status === 'pending' || !a.status).length,
      reviewed: allApps.filter(a => a.status === 'reviewed').length,
      accepted: allApps.filter(a => a.status === 'accepted').length,
      declined: allApps.filter(a => a.status === 'declined').length,
    };

    return {
      applications,
      stats,
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        hasMore: offset + limit < Number(totalCount)
      },
      filters: {
        status: statusFilter,
        q: searchQuery
      }
    };
  } catch (e) {
    console.error("Error loading volunteer applications:", e);
    throw error(500, "Failed to load volunteer applications");
  }
};

export const actions: Actions = {
  updateStatus: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const newStatus = formData.get("status") as string;

    if (!id || !newStatus) {
      return fail(400, { message: "ID and status are required" });
    }

    try {
      const [existing] = await db.select().from(volunteerApplication).where(eq(volunteerApplication.id, id));

      await db
        .update(volunteerApplication)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(volunteerApplication.id, id));

      if (existing) {
        await logActivity(locals, {
          action: `Updated Volunteer Application for ${existing.firstName} ${existing.lastName} to ${newStatus}`,
          entityType: "VOLUNTEER_APPLICATION",
          entityId: id,
          operation: "UPDATE",
          metadata: JSON.stringify({ name: `${existing.firstName} ${existing.lastName}`, status: newStatus })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error updating volunteer status:", e);
      return fail(500, { message: "Failed to update status" });
    }
  },

  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return fail(400, { message: "ID is required" });
    }

    try {
      const [existing] = await db.select().from(volunteerApplication).where(eq(volunteerApplication.id, id));
      await db.delete(volunteerApplication).where(eq(volunteerApplication.id, id));

      if (existing) {
        await logActivity(locals, {
          action: `Deleted Volunteer Application of ${existing.firstName} ${existing.lastName}`,
          entityType: "VOLUNTEER_APPLICATION",
          entityId: id,
          operation: "DELETE",
          metadata: JSON.stringify({ name: `${existing.firstName} ${existing.lastName}` })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error deleting volunteer application:", e);
      return fail(500, { message: "Failed to delete volunteer application" });
    }
  }
};
