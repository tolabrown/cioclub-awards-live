import { db } from "./drizzle";
import { organization, organizationMember, user } from "./schema";
import { eq } from "drizzle-orm";

/**
 * Deletes an organization and cleans up all associated data.
 * 1. Nulls out organizationId for all users associated with this organization.
 * 2. Deletes the organization record (cascades to organizationMember).
 */
export const deleteOrganization = async (orgId: string) => {
  return await db.transaction(async (tx) => {
    try {
      // 1. Null out organizationId in the user table for all members
      // (Even if not a formal FK with cascade, this avoids stale IDs)
      await tx.update(user)
        .set({ organizationId: null })
        .where(eq(user.organizationId, orgId));

      // 2. The organization record itself
      // Note: organizationMember has onDelete: "cascade" in schema, so it will be cleaned up automatically.
      const result = await tx.delete(organization).where(eq(organization.id, orgId));

      return { status: "success", message: "Organization deleted successfully" };
    } catch (error: any) {
      console.error("deleteOrganization() error:", error.message);
      throw error;
    }
  }).catch((error: any) => {
    return { status: "error", message: error.message };
  });
};
