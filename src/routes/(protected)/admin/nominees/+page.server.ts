import { db } from "$lib/db";
import { nomination } from "$lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { error, fail } from "@sveltejs/kit";
import { getNomineesBySearchFilter } from "$lib/db/nominee";
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
    const result = await getNomineesBySearchFilter(params);
    if (result.status === "error") {
      throw error(500, result.message);
    }

    const data = result.data as iFetchMeta;

    return {
      nominations: data.data,
      pagination: {
        total: data.total,
        page: Number(url.searchParams.get("page")) || 1,
        limit: MAX_ITEMS_PER_PAGE,
        hasMore: data.meta?.more || false,
      },
    };
  } catch (e: any) {
    if (e.status) throw e;
    console.error("Error loading nominations:", e);
    throw error(500, "Failed to load nominations");
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
        .from(nomination)
        .where(eq(nomination.id, id));

      if (!existing) {
        return fail(404, { message: "Nomination not found" });
      }

      await db
        .update(nomination)
        .set({ status })
        .where(eq(nomination.id, id));

      await logActivity(locals, {
        action: `Updated Nomination status to ${status} for ${existing.nomineeFullName}`,
        entityType: "NOMINATION",
        entityId: id,
        operation: "UPDATE",
        metadata: JSON.stringify({ nominee: existing.nomineeFullName, status })
      });

      return { success: true };
    } catch (e) {
      console.error("Error updating nomination status:", e);
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
      const [existing] = await db.select().from(nomination).where(eq(nomination.id, id));
      await db.delete(nomination).where(eq(nomination.id, id));
      
      if (existing) {
        await logActivity(locals, {
          action: `Deleted Nomination for ${existing.nomineeFullName}`,
          entityType: "NOMINATION",
          entityId: id,
          operation: "DELETE",
          metadata: JSON.stringify({ nominee: existing.nomineeFullName })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error deleting nomination:", e);
      return fail(500, { message: "Failed to delete nomination" });
    }
  },

  exportCsv: async ({ url }) => {
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.export = "true";

    const result = await getNomineesBySearchFilter(params);
    if (result.status === "error") {
      return fail(500, { message: "Failed to export data" });
    }

    // Transform for CSV
    const data = (result.data as any).data.map((item: any) => ({
      ID: item.id,
      "Nominee Name": item.nomineeFullName,
      "Nominee Email": item.nomineeEmail,
      "Nominee Company": item.nomineeCompany,
      "Nominee Position": item.nomineePosition,
      Category: item.category,
      "Nominator Name": item.nominatorName,
      "Nominator Email": item.nominatorEmail,
      "Nominator Company": item.nominatorCompany,
      "Nomination Reason": item.reason,
      Status: item.status,
      "Created At": item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "",
    }));

    return { success: true, exportData: data };
  },
};
