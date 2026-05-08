import { db } from "$lib/db";
import { awardEntry, user as userTable } from "$lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { error, fail } from "@sveltejs/kit";
import { getAwardEntriesBySearchFilter } from "$lib/db/award-entry";
import type { PageServerLoad, Actions } from "./$types";
import { MAX_ITEMS_PER_PAGE } from "$lib/constants";
import type { iFetchMeta } from "$lib/interface";
import { logActivity } from "$lib/server/activity-log";

export const load: PageServerLoad = async ({ url }) => {
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  try {
    const result = await getAwardEntriesBySearchFilter(params);
    if (result.status === "error") {
      throw error(500, result.message);
    }

    const data = result.data as iFetchMeta;

    return {
      entries: data.data,
      pagination: {
        total: data.total,
        page: Number(url.searchParams.get("page")) || 1,
        limit: MAX_ITEMS_PER_PAGE,
        hasMore: data.meta?.more || false,
      },
    };
  } catch (e: any) {
    if (e.status) throw e;
    console.error("Error loading award entries:", e);
    throw error(500, "Failed to load award entries");
  }
};

export const actions: Actions = {
  updateStatus: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    if (!id || !status) {
      return fail(400, { message: "ID and Status are required" });
    }

    try {
      const [existing] = await db
        .select()
        .from(awardEntry)
        .where(eq(awardEntry.id, id));

      if (!existing) {
        return fail(404, { message: "Entry not found" });
      }

      await db
        .update(awardEntry)
        .set({ status })
        .where(eq(awardEntry.id, id));

      await logActivity(locals, {
        action: `Updated Award Entry status to ${status}`,
        entityType: "AWARD_ENTRY",
        entityId: id,
        operation: "UPDATE",
        metadata: JSON.stringify({ oldStatus: existing.status, newStatus: status })
      });

      return { success: true };
    } catch (e) {
      console.error("Error updating entry status:", e);
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
      await db.delete(awardEntry).where(eq(awardEntry.id, id));
      
      await logActivity(locals, {
        action: `Deleted Award Entry`,
        entityType: "AWARD_ENTRY",
        entityId: id,
        operation: "DELETE"
      });

      return { success: true };
    } catch (e) {
      console.error("Error deleting award entry:", e);
      return fail(500, { message: "Failed to delete entry" });
    }
  },

  exportCsv: async ({ url }) => {
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.export = "true";

    const result = await getAwardEntriesBySearchFilter(params);
    if (result.status === "error") {
      return fail(500, { message: "Failed to export data" });
    }

    // Transform for CSV - flatten and format dates
    const data = (result.data as any).data.map((item: any) => ({
      ID: item.id,
      "Project Title": item.projectTitle,
      Category: item.category,
      Status: item.status,
      "Organization Name": item.organizationName,
      Industry: item.industry,
      Country: item.country,
      "Submitted By": item.userName,
      "Submitter Email": item.userEmail,
      "Submitted At": item.submittedAt
        ? new Date(item.submittedAt).toLocaleDateString()
        : "",
      "Impact Statement": item.impactStatement,
      "Project Description": item.projectDescription,
    }));

    return { success: true, exportData: data };
  },
};
