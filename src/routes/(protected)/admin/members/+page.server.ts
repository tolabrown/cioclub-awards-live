import { db } from "$lib/db";
import { membershipInquiry, user as userTable, membershipPayment, organization, organizationMember } from "$lib/db/schema";
import { desc, eq, count, sql, and, or, isNull, ne, inArray, ilike } from "drizzle-orm";
import { Role } from "$lib/constants";
import { error, fail } from "@sveltejs/kit";
import { calculateSubscriptionYearsFromKobo, calculateExtendedExpiry } from "$lib/utils/subscription";
import type { PageServerLoad, Actions } from "./$types";
import { logActivity } from "$lib/server/activity-log";

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get("page")) || 1;
  const paymentStatus = url.searchParams.get("paymentStatus") || "all";
  const search = url.searchParams.get("search") || "";
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    // Subquery to get the latest payment for each email to avoid row duplication
    const latestPaymentSubquery = db
      .select({
        email: membershipPayment.email,
        status: membershipPayment.status,
        amount: membershipPayment.amount,
        createdAt: membershipPayment.createdAt,
      })
      .from(membershipPayment)
      .orderBy(desc(membershipPayment.createdAt))
      .as('latest_payment');

    // Build filters
    const filterConditions = [];
    if (paymentStatus === "paid") {
      filterConditions.push(eq(latestPaymentSubquery.status, "success"));
    } else if (paymentStatus === "unpaid") {
      filterConditions.push(
        or(
          isNull(latestPaymentSubquery.status),
          ne(latestPaymentSubquery.status, "success")
        )
      );
    }
    
    if (search) {
      filterConditions.push(
        or(
          ilike(membershipInquiry.fullName, `%${search}%`),
          ilike(membershipInquiry.email, `%${search}%`),
          ilike(membershipInquiry.organization, `%${search}%`)
        )
      );
    }

    const members = await db
      .select({
        inquiry: membershipInquiry,
        user: {
          role: userTable.role,
          subscriptionEndsAt: userTable.subscriptionEndsAt,
        },
        payment: {
          status: latestPaymentSubquery.status,
          amount: latestPaymentSubquery.amount,
          createdAt: latestPaymentSubquery.createdAt,
        }
      })
      .from(membershipInquiry)
      .leftJoin(userTable, eq(sql`lower(${membershipInquiry.email})`, sql`lower(${userTable.email})`))
      .leftJoin(latestPaymentSubquery, eq(sql`lower(${membershipInquiry.email})`, sql`lower(${latestPaymentSubquery.email})`))
      .where(filterConditions.length > 0 ? and(...filterConditions) : undefined)
      .orderBy(desc(membershipInquiry.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count with filters
    const [{ value: totalCount }] = await db
      .select({ value: count() })
      .from(membershipInquiry)
      .leftJoin(latestPaymentSubquery, eq(sql`lower(${membershipInquiry.email})`, sql`lower(${latestPaymentSubquery.email})`))
      .where(filterConditions.length > 0 ? and(...filterConditions) : undefined);

    return {
      members,
      pagination: {
        total: Number(totalCount),
        page,
        limit,
        hasMore: offset + limit < Number(totalCount)
      }
    };
  } catch (e) {
    console.error("Error loading members:", e);
    throw error(500, "Failed to load membership inquiries");
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
      // 1. Get the inquiry details first
      const [inquiry] = await db
        .select()
        .from(membershipInquiry)
        .where(eq(membershipInquiry.id, id));

      if (!inquiry) {
        return fail(404, { message: "Inquiry not found" });
      }

      // 2. Handle update or deletion based on status
      if (status === "rejected") {
        // Downgrade user role to 'user' so they lose dashboard access
        const [associatedUser] = await db
          .select()
          .from(userTable)
          .where(eq(sql`lower(${userTable.email})`, inquiry.email.toLowerCase()));

        if (associatedUser) {
          await db
            .update(userTable)
            .set({
              role: Role.USER,
              subscriptionEndsAt: null,
              updatedAt: new Date(),
            })
            .where(eq(userTable.id, associatedUser.id));

          console.log(`Downgraded role for ${inquiry.email} to 'user' due to rejection`);
        }

          await db.delete(membershipInquiry).where(eq(membershipInquiry.id, id));

          await logActivity(locals, {
            action: `Rejected and deleted Membership Inquiry for ${inquiry.email}`,
            entityType: "MEMBERSHIP_INQUIRY",
            entityId: id,
            operation: "DELETE",
            metadata: JSON.stringify({ email: inquiry.email, role: "USER" })
          });
        } else {
          await db
            .update(membershipInquiry)
            .set({ status, updatedAt: new Date() })
            .where(eq(membershipInquiry.id, id));

          await logActivity(locals, {
            action: `Updated Membership Inquiry status to ${status} for ${inquiry.email}`,
            entityType: "MEMBERSHIP_INQUIRY",
            entityId: id,
            operation: "UPDATE",
            metadata: JSON.stringify({ email: inquiry.email, status })
          });
        }

      // 3. If approved, try to activate the subscription in the user table
      // 3. If approved, calculate expiry and update user
      if (status === "approved") {
        try {
          // Fetch the associated user if they exist
          const [associatedUser] = await db
            .select()
            .from(userTable)
            .where(eq(sql`lower(${userTable.email})`, inquiry.email.toLowerCase()));

          if (associatedUser) {
            const isCorporate = inquiry.tier === "Corporate" || inquiry.tier?.toLowerCase().includes("corporate");
            const targetRole = isCorporate ? Role.MEMBER_CORPORATE : Role.MEMBER_INDIVIDUAL;

            // Get payment amount to determine years (fallback to 1 year if no payment found yet)
            const [latestPayment] = await db
              .select()
              .from(membershipPayment)
              .where(eq(sql`lower(${membershipPayment.email})`, inquiry.email.toLowerCase()))
              .orderBy(desc(membershipPayment.createdAt))
              .limit(1);

            const yearsPaid = latestPayment ? calculateSubscriptionYearsFromKobo(inquiry.tier || "individual", latestPayment.amount) : 1;
            const newExpiry = calculateExtendedExpiry(associatedUser.subscriptionEndsAt, yearsPaid);

            await db
              .update(userTable)
              .set({
                role: targetRole,
                subscriptionEndsAt: newExpiry,
                updatedAt: new Date(),
              })
              .where(eq(userTable.id, associatedUser.id));

            // Handle Corporate Organization creation
            if (isCorporate) {
              // Check if user already has an organization
              let orgId = associatedUser.organizationId;

              if (!orgId) {
                // Create new organization
                const [newOrg] = await db.insert(organization).values({
                  name: inquiry.organization || "My Organization",
                  adminId: associatedUser.id,
                  subscriptionEndsAt: newExpiry,
                }).returning();
                
                orgId = newOrg.id;

                // Update user with organizationId
                await db.update(userTable)
                  .set({ organizationId: orgId })
                  .where(eq(userTable.id, associatedUser.id));
              } else {
                // Update existing organization expiry
                await db.update(organization)
                  .set({ subscriptionEndsAt: newExpiry })
                  .where(eq(organization.id, orgId));
              }

              // Check if already an organization member record exists
              const [existingMember] = await db.select().from(organizationMember)
                .where(and(
                  eq(organizationMember.organizationId, orgId),
                  eq(organizationMember.userId, associatedUser.id)
                ));

              if (!existingMember) {
                await db.insert(organizationMember).values({
                  organizationId: orgId,
                  userId: associatedUser.id,
                  email: associatedUser.email,
                  role: "admin",
                  status: "active"
                });
              }
            }
            
            console.log(`Successfully activated/extended subscription for ${inquiry.email} until ${newExpiry}`);
          }
        } catch (e) {
          console.error("Failed to activate subscription for approved inquiry:", e);
        }
      }

      return { success: true };
    } catch (e) {
      console.error("Error updating member status:", e);
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
      const [existing] = await db.select().from(membershipInquiry).where(eq(membershipInquiry.id, id));
      await db.delete(membershipInquiry).where(eq(membershipInquiry.id, id));

      if (existing) {
        await logActivity(locals, {
          action: `Deleted Membership Inquiry for ${existing.email}`,
          entityType: "MEMBERSHIP_INQUIRY",
          entityId: id,
          operation: "DELETE",
          metadata: JSON.stringify({ email: existing.email })
        });
      }

      return { success: true };
    } catch (e) {
      console.error("Error deleting member inquiry:", e);
      return { success: false, message: "Failed to delete inquiry" };
    }
  },

  bulkDelete: async ({ request, locals }) => {
    const formData = await request.formData();
    const idsString = formData.get("ids") as string;

    if (!idsString) {
      return fail(400, { message: "IDs are required" });
    }

    try {
      const ids = JSON.parse(idsString);
      if (!Array.isArray(ids) || ids.length === 0) {
        return fail(400, { message: "Invalid IDs" });
      }

      await db.delete(membershipInquiry).where(inArray(membershipInquiry.id, ids));

      await logActivity(locals, {
        action: `Bulk deleted ${ids.length} Membership Inquiries`,
        entityType: "MEMBERSHIP_INQUIRY",
        operation: "DELETE",
        metadata: JSON.stringify({ ids })
      });

      return { success: true, count: ids.length };
    } catch (e) {
      console.error("Error bulk deleting member inquiries:", e);
      return fail(500, { message: "Failed to bulk delete inquiries" });
    }
  }
};
