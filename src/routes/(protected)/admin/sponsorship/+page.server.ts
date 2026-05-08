import { db } from "$lib/db";
import { sponsorshipInquiry } from "$lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { error, fail } from "@sveltejs/kit";
import { getSponsorshipInquiriesBySearchFilter } from "$lib/db/sponsorship";
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
    const result = await getSponsorshipInquiriesBySearchFilter(params);
    if (result.status === "error") {
      throw error(500, result.message);
    }

    const data = result.data as iFetchMeta;

    return {
      inquiries: data.data,
      pagination: {
        total: data.total,
        page: Number(url.searchParams.get("page")) || 1,
        limit: MAX_ITEMS_PER_PAGE,
        hasMore: data.meta?.more || false,
      },
    };
  } catch (e: any) {
    if (e.status) throw e;
    console.error("Error loading sponsorship inquiries:", e);
    throw error(500, "Failed to load inquiries");
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
        .from(sponsorshipInquiry)
        .where(eq(sponsorshipInquiry.id, id));

      if (!existing) {
        return fail(404, { message: "Inquiry not found" });
      }

      await db
        .update(sponsorshipInquiry)
        .set({ status })
        .where(eq(sponsorshipInquiry.id, id));

      await logActivity(locals, {
        action: `Updated Sponsorship Inquiry status to ${status} for ${existing.companyName}`,
        entityType: "SPONSORSHIP_INQUIRY",
        entityId: id,
        operation: "UPDATE",
        metadata: JSON.stringify({ company: existing.companyName, status })
      });

      return { success: true };
    } catch (e) {
      console.error("Error updating sponsorship status:", e);
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
      const [existing] = await db.select().from(sponsorshipInquiry).where(eq(sponsorshipInquiry.id, id));
      await db.delete(sponsorshipInquiry).where(eq(sponsorshipInquiry.id, id));

      if (existing) {
        await logActivity(locals, {
          action: `Deleted Sponsorship Inquiry from ${existing.companyName}`,
          entityType: "SPONSORSHIP_INQUIRY",
          entityId: id,
          operation: "DELETE",
          metadata: JSON.stringify({ company: existing.companyName })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error deleting inquiry:", e);
      return fail(500, { message: "Failed to delete inquiry" });
    }
  },

  exportCsv: async ({ url }) => {
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    params.export = "true";

    const result = await getSponsorshipInquiriesBySearchFilter(params);
    if (result.status === "error") {
      return fail(500, { message: "Failed to export data" });
    }

    // Transform for CSV
    const data = (result.data as any).data.map((item: any) => ({
      ID: item.id,
      "Company Name": item.companyName,
      "Contact Name": item.contactName,
      "Contact Email": item.contactEmail,
      "Contact Phone": item.contactPhone || "N/A",
      "Package Interest": item.packageInterest,
      Message: item.message || "N/A",
      Status: item.status,
      "Created At": item.createdAt
        ? new Date(item.createdAt).toLocaleDateString()
        : "",
    }));

    return { success: true, exportData: data };
  },
};
