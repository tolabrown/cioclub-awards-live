import { db } from "$lib/db";
import { organization, organizationMember, user as userTable } from "$lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { error, fail } from "@sveltejs/kit";
import { Role } from "$lib/constants";
import { EmailService } from "$lib/server/emailservice";
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

  // Fetch members
  const members = await db.select({
    id: organizationMember.id,
    email: organizationMember.email,
    role: organizationMember.role,
    status: organizationMember.status,
    userId: organizationMember.userId,
    userName: userTable.name,
    userImage: userTable.image,
    joinedAt: organizationMember.createdAt,
  })
  .from(organizationMember)
  .leftJoin(userTable, eq(organizationMember.userId, userTable.id))
  .where(eq(organizationMember.organizationId, id))
  .orderBy(desc(organizationMember.createdAt));

  return {
    organization: org,
    members,
    isOrgAdmin: isAdmin || membership?.role === "admin" || isOrgAdmin,
    user: currentUser
  };
};

export const actions: Actions = {
  inviteMember: async ({ request, params, locals }) => {
    const { id } = params;
    const currentUser = locals.user;
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!currentUser) return fail(401, { message: "Unauthorized" });
    if (!email) return fail(400, { message: "Email is required" });

    // Access Control check
    const [membership] = await db.select().from(organizationMember)
      .where(and(
        eq(organizationMember.organizationId, id),
        eq(organizationMember.userId, currentUser.id)
      ));

    const [org] = await db.select().from(organization).where(eq(organization.id, id));
    if (!org) return fail(404, { message: "Organization not found" });
    const isOrgAdmin = org.adminId === currentUser.id;

    if (currentUser.role !== Role.ADMIN && membership?.role !== "admin" && !isOrgAdmin) {
      return fail(403, { message: "Only administrators can invite members." });
    }

    // Check if orleady a member or invited
    const [existing] = await db.select().from(organizationMember)
      .where(and(
        eq(organizationMember.organizationId, id),
        eq(sql`lower(${organizationMember.email})`, email.toLowerCase())
      ));

    if (existing) {
      return fail(400, { message: "User is already an active member or has a pending invitation." });
    }

    try {
      
      await db.insert(organizationMember).values({
        organizationId: id,
        email: email.toLowerCase(),
        role: "member",
        status: "pending"
      });

      // Send Email
      await EmailService.sendTeamInvitation(email, org.name, currentUser.name);

      return { success: true };
    } catch (e) {
      console.error("Error inviting member:", e);
      return fail(500, { message: "Failed to send invitation" });
    }
  },

  removeMember: async ({ request, params, locals }) => {
    const { id } = params;
    const currentUser = locals.user;
    const formData = await request.formData();
    const memberId = formData.get("memberId") as string;

    if (!currentUser) return fail(401, { message: "Unauthorized" });
    if (!memberId) return fail(400, { message: "Member ID is required" });

    // Access Control check
    const [membership] = await db.select().from(organizationMember)
      .where(and(
        eq(organizationMember.organizationId, id),
        eq(organizationMember.userId, currentUser.id)
      ));

    const [org] = await db.select().from(organization).where(eq(organization.id, id));
    if (!org) return fail(404, { message: "Organization not found" });
    const isOrgAdmin = org.adminId === currentUser.id;

    if (currentUser.role !== Role.ADMIN && membership?.role !== "admin" && !isOrgAdmin) {
      return fail(403, { message: "Only administrators can remove members." });
    }

    try {
      // Don't allow removing the last admin unless by platform admin
      const [targetMember] = await db.select().from(organizationMember).where(eq(organizationMember.id, memberId));
      if (targetMember.role === "admin" && currentUser.role !== Role.ADMIN) {
         // Count admins
         const adminsCount = await db.select({ count: sql<number>`count(*)` }).from(organizationMember)
            .where(and(eq(organizationMember.organizationId, id), eq(organizationMember.role, "admin")));
         if (Number(adminsCount[0].count) <= 1) {
            return fail(400, { message: "Cannot remove the only organization administrator." });
         }
      }

      await db.delete(organizationMember).where(eq(organizationMember.id, memberId));
      return { success: true };
    } catch (e) {
      console.error("Error removing member:", e);
      return fail(500, { message: "Failed to remove member" });
    }
  }
};
