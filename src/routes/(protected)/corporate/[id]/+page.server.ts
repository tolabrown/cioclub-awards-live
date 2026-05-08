import { db } from "$lib/db";
import { organization, organizationMember } from "$lib/db/schema";
import { eq, and } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import { Role } from "$lib/constants";
import { deleteOrganization } from "$lib/db/organization";
import { fail, redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const { id } = params;
  const currentUser = locals.user;

  if (!currentUser) throw error(401, "Unauthorized");

  // Fetch organization
  const [org] = await db.select().from(organization).where(eq(organization.id, id));
  if (!org) throw error(404, "Organization not found");

  // Access Control: Admin or Organization Member
  const [membership] = await db.select().from(organizationMember)
    .where(and(
      eq(organizationMember.organizationId, id),
      eq(organizationMember.userId, currentUser.id)
    ));

  const isAdmin = currentUser.role === Role.ADMIN;
  const isOrgMember = !!membership;
  const isOrgAdmin = org.adminId === currentUser.id;

  if (!isAdmin && !isOrgMember && !isOrgAdmin) {
    throw error(403, "Forbidden: You do not have access to this organization.");
  }

  // Fetch basic member count/list for stats
  const members = await db.select({
    id: organizationMember.id,
    status: organizationMember.status,
  })
  .from(organizationMember)
  .where(eq(organizationMember.organizationId, id));

  return {
    organization: org,
    members,
  };
};

export const actions: Actions = {
  deleteOrganization: async ({ params, locals }) => {
    const { id } = params;
    const currentUser = locals.user;

    // Fetch org to check adminId
    const [org] = await db.select().from(organization).where(eq(organization.id, id));
    if (!org) return fail(404, { message: "Organization not found" });

    const isSystemAdmin = currentUser?.role === Role.ADMIN;
    const isOrgAdmin = org.adminId === currentUser?.id;

    if (!isSystemAdmin && !isOrgAdmin) {
      return fail(403, { message: "Only organization administrators or system admins can delete this organization." });
    }

    try {
      const result = await deleteOrganization(id);
      if (result.status === "error") {
        return fail(500, { message: result.message });
      }
      throw redirect(303, "/corporate");
    } catch (e: any) {
      if (e.status === 303) throw e;
      return fail(500, { message: e.message || "Failed to delete organization" });
    }
  },

  updatePrivacy: async () => {
    return { success: true, message: "Privacy & Security settings updated (Placeholder)" };
  },

  updateBilling: async () => {
    return { success: true, message: "Billing settings updated (Placeholder)" };
  }
};
