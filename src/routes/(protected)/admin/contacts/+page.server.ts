import { db } from "$lib/db";
import { contactInquiry } from "$lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { error, fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { logActivity } from "$lib/server/activity-log";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const inquiries = await db
      .select()
      .from(contactInquiry)
      .orderBy(desc(contactInquiry.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination info
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(contactInquiry);

    return {
      inquiries,
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        hasMore: offset + limit < Number(totalCount)
      }
    };
  } catch (e) {
    console.error("Error loading contacts:", e);
    throw error(500, "Failed to load contact inquiries");
  }
};

export const actions: Actions = {
  markAsRead: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return fail(400, { message: "ID is required" });
    }

    try {
      const [existing] = await db.select().from(contactInquiry).where(eq(contactInquiry.id, id));
      
      await db
        .update(contactInquiry)
        .set({ status: "read", updatedAt: new Date() })
        .where(eq(contactInquiry.id, id));

      if (existing) {
        await logActivity(locals, {
          action: `Marked Contact Inquiry from ${existing.fullName} as read`,
          entityType: "CONTACT_INQUIRY",
          entityId: id,
          operation: "UPDATE",
          metadata: JSON.stringify({ name: existing.fullName })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error marking contact as read:", e);
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
      const [existing] = await db.select().from(contactInquiry).where(eq(contactInquiry.id, id));
      await db.delete(contactInquiry).where(eq(contactInquiry.id, id));

      if (existing) {
        await logActivity(locals, {
          action: `Deleted Contact Inquiry from ${existing.fullName}`,
          entityType: "CONTACT_INQUIRY",
          entityId: id,
          operation: "DELETE",
          metadata: JSON.stringify({ name: existing.fullName })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error deleting contact:", e);
      return fail(500, { message: "Failed to delete contact" });
    }
  }
};
