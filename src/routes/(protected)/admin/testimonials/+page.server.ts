import { db } from "$lib/db";
import { testimonial } from "$lib/db/schema";
import { eq } from "drizzle-orm";
import { error, fail } from "@sveltejs/kit";
import { getTestimonialsBySearchFilter } from "$lib/db/testimonial";
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
    const result = await getTestimonialsBySearchFilter(params);
    if (result.status === "error") {
      throw error(500, result.message);
    }

    const data = result.data as iFetchMeta;

    return {
      testimonials: data.data as any[],
      pagination: {
        total: data.total,
        page: Number(url.searchParams.get("page")) || 1,
        limit: MAX_ITEMS_PER_PAGE,
        hasMore: data.meta?.more || false,
      },
    };
  } catch (e: any) {
    if (e.status) throw e;
    console.error("Error loading testimonials:", e);
    throw error(500, "Failed to load testimonials");
  }
};

export const actions: Actions = {
  delete: async ({ request, locals }) => {
    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) {
      return fail(400, { message: "ID is required" });
    }

    try {
      const [existing] = await db.select().from(testimonial).where(eq(testimonial.id, id));
      await db.delete(testimonial).where(eq(testimonial.id, id));
      
      if (existing) {
        await logActivity(locals, {
          action: `Deleted Testimonial from ${existing.authorName}`,
          entityType: "TESTIMONIAL",
          entityId: id,
          operation: "DELETE",
          metadata: JSON.stringify({ author: existing.authorName })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error deleting testimonial:", e);
      return fail(500, { message: "Failed to delete testimonial" });
    }
  },
};
