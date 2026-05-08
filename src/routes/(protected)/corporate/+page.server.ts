import { db } from "$lib/db";
import { organization, user as userTable, organizationMember } from "$lib/db/schema";
import { count, eq, sql, desc } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import { Role } from "$lib/constants";
import { deleteOrganization } from "$lib/db/organization";
import { fail } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const currentUser = locals.user;

  // Strict access control: Only Admin can see the list of all corporations
  if (currentUser?.role !== Role.ADMIN) {
    throw error(403, "Forbidden: Only administrators can access this page.");
  }

  try {
    const orgs = await db
      .select({
        id: organization.id,
        name: organization.name,
        adminName: userTable.name,
        adminEmail: userTable.email,
        subscriptionEndsAt: organization.subscriptionEndsAt,
        createdAt: organization.createdAt,
        memberCount: sql<number>`(SELECT count(*) FROM ${organizationMember} WHERE ${organizationMember.organizationId} = ${organization.id})`.mapWith(Number),
      })
      .from(organization)
      .leftJoin(userTable, eq(organization.adminId, userTable.id))
      .orderBy(desc(organization.createdAt));

    return {
      organizations: orgs
    };
  } catch (e) {
    console.error("Error loading organizations:", e);
    throw error(500, "Failed to load organizations");
  }
};

export const actions: Actions = {
  deleteOrganization: async ({ request, locals }) => {
    const currentUser = locals.user;
    if (currentUser?.role !== Role.ADMIN) {
      return fail(403, { message: "Only administrators can delete organizations." });
    }

    const formData = await request.formData();
    const id = formData.get("id") as string;

    if (!id) return fail(400, { message: "Organization ID is required." });

    try {
      const result = await deleteOrganization(id);
      if (result.status === "error") {
        return fail(500, { message: result.message });
      }
      return { success: true, message: "Organization deleted successfully" };
    } catch (e: any) {
      return fail(500, { message: e.message });
    }
  }
};
