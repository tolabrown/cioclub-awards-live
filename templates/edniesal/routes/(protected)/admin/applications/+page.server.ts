import { db } from "$lib/db/drizzle";
import { cvApplications, file as fileTable } from "$lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { fail, error } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { Role } from "$lib/constants";

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || locals.user.role !== Role.ADMIN) {
    throw error(403, "Forbidden");
  }

  const applications = await db
    .select({
      id: cvApplications.id,
      name: cvApplications.name,
      email: cvApplications.email,
      phone: cvApplications.phone,
      coverLetter: cvApplications.coverLetter,
      status: cvApplications.status,
      createdAt: cvApplications.createdAt,
      cvFile: {
        id: fileTable.id,
        url: fileTable.url,
        name: fileTable.name,
        type: fileTable.type,
      },
    })
    .from(cvApplications)
    .leftJoin(fileTable, eq(cvApplications.cvFileId, fileTable.id))
    .orderBy(desc(cvApplications.createdAt));

  return { applications };
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
      await db.update(cvApplications)
        .set({ status })
        .where(eq(cvApplications.id, id));
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
      await db.delete(cvApplications).where(eq(cvApplications.id, id));
      return { success: true };
    } catch (e) {
      console.error("Delete error:", e);
      return fail(500, { message: "Failed to delete application" });
    }
  },
};
