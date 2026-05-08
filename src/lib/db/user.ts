import { db } from "./drizzle";
import { user } from "./schema";
import { eq, desc, or, ilike, count, and } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";
import { organization, organizationMember, account, session, membershipPayment, awardEntry, ticketBooking, pageContent } from "./schema";

export const getUser = async (userId: string) => {
  try {
    const result = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error: any) {
    console.log("getUser()", error.message);
    return null;
  }
};

export const getUsersBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", role, banned } = params;
    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [];
    if (cleanSearchTerm.length > 0) {
      conditions.push(or(
        ilike(user.name, `%${cleanSearchTerm}%`),
        ilike(user.email, `%${cleanSearchTerm}%`),
        ilike(user.role, `%${cleanSearchTerm}%`)
      ));
    }
    if (role) conditions.push(eq(user.role, role));
    if (banned) conditions.push(eq(user.banned, banned.toLowerCase() === 'true'));

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    const totalResult = await db.select({ count: count() }).from(user).where(whereCondition);
    const total = totalResult[0].count;

    const users = await db.select().from(user).where(whereCondition)
      .orderBy(desc(user.createdAt)).limit(MAX_ITEMS_PER_PAGE).offset(offset);

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total;

    const usersMeta: iFetchMeta = {
      total,
      meta: { cursor: users.length > 0 ? users[users.length - 1].id : '', more: hasNextPage, size: users.length },
      data: users
    };

    return { status: "success", data: usersMeta };
  } catch (error: any) {
    console.log("getUsersBySearchFilter()", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};

export const deleteUser = async (userId: string) => {
  return await db.transaction(async (tx) => {
    try {
      // 1. Check for organization ownership (adminId is notNull and references user.id)
      const orgsAsAdmin = await tx.select().from(organization).where(eq(organization.adminId, userId));
      
      if (orgsAsAdmin.length > 0) {
        // If the user is an admin, we can't delete them without reassigning or deleting the org.
        // For safety, we throw a clear error.
        throw new Error(`User is an administrator of ${orgsAsAdmin.length} organization(s). Please reassign ownership in the Corporate management section before deleting.`);
      }

      // 2. Perform manual cleanup for tables without CASCADE
      // This solves the database constraint errors for historical data.
      await tx.delete(membershipPayment).where(eq(membershipPayment.userId, userId));
      await tx.delete(awardEntry).where(eq(awardEntry.userId, userId));
      await tx.delete(ticketBooking).where(eq(ticketBooking.userId, userId));
      
      // 3. Clear updatedBy reference in pageContent (nullable column)
      await tx.update(pageContent)
        .set({ updatedBy: null })
        .where(eq(pageContent.updatedBy, userId));

      // 4. Perform the final user deletion
      // Tables like session, account, community tables, and organizationMember have onDelete: "cascade" in schema.
      const result = await tx.delete(user).where(eq(user.id, userId));
      
      return { status: "success", message: "User deleted successfully" };
    } catch (error: any) {
      console.error("deleteUser() error:", error.message);
      // Ensure the transaction is rolled back by re-throwing
      throw error;
    }
  }).catch((error: any) => {
    // If it's a constraint error we didn't catch, the message might still be generic.
    // But our manual cleanup should cover the common ones.
    return { status: "error", message: error.message };
  });
};

export const updateUser = async (userId: string, data: Partial<typeof user.$inferSelect>) => {
  try {
    const result = await db.update(user).set(data).where(eq(user.id, userId)).returning();
    return { status: "success", data: result[0] };
  } catch (error: any) {
    console.error("updateUser() error:", error.message);
    return { status: "error", message: error.message };
  }
};
