import { db } from "$lib/db/drizzle";
import { consultations } from "$lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { fail, error } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { Role } from "$lib/constants";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    throw error(403, "Forbidden");
  }

  const items = await db.select().from(consultations).orderBy(desc(consultations.createdAt));

  return {
    consultations: items,
  };
};

export const actions: Actions = {
  updateStatus: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== Role.ADMIN) {
      throw error(403, "Forbidden");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;

    if (!id || !status) return fail(400, { message: "Missing ID or status" });

    try {
      await db.update(consultations)
        .set({ status })
        .where(eq(consultations.id, id));
      return { success: true };
    } catch (e) {
      console.error("Update status error:", e);
      return fail(500, { message: "Failed to update status" });
    }
  },
  delete: async ({ request, locals }) => {
    if (!locals.user || locals.user.role !== Role.ADMIN) {
      throw error(403, "Forbidden");
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) return fail(400, { message: "Missing ID" });

    try {
      await db.delete(consultations).where(eq(consultations.id, id));
      return { success: true };
    } catch (e) {
      console.error("Delete error:", e);
      return fail(500, { message: "Failed to delete consultation" });
    }
  },
};
