import { BaseCRUD, eq, and, desc, sql, type CRUDResult, type CRUDListResult } from "./crud";
import { address, type Address, type NewAddress } from "./schema";
import { db } from "./drizzle";

class AddressCRUDClass extends BaseCRUD<typeof address, Address, NewAddress> {
  constructor() {
    super(address);
  }

  /**
   * Get all addresses for a user
   */
  async getByUser(userId: string): Promise<CRUDListResult<Address>> {
    try {
      const results = await db
        .select()
        .from(address)
        .where(eq(address.userId, userId))
        .orderBy(desc(address.isDefault), desc(address.createdAt));

      return { success: true, data: results };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get addresses" };
    }
  }

  /**
   * Get default address for user by type
   */
  async getDefault(userId: string, type: "shipping" | "billing"): Promise<CRUDResult<Address>> {
    try {
      const [result] = await db
        .select()
        .from(address)
        .where(and(
          eq(address.userId, userId),
          eq(address.type, type),
          eq(address.isDefault, true)
        ))
        .limit(1);

      if (!result) {
        // Get first address of this type if no default
        const [firstAddress] = await db
          .select()
          .from(address)
          .where(and(eq(address.userId, userId), eq(address.type, type)))
          .orderBy(desc(address.createdAt))
          .limit(1);

        if (!firstAddress) {
          return { success: false, error: "No address found" };
        }
        return { success: true, data: firstAddress };
      }

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get default address" };
    }
  }

  /**
   * Set address as default
   */
  async setDefault(addressId: string, userId: string): Promise<CRUDResult<Address>> {
    try {
      // Get address to find its type
      const [addr] = await db
        .select()
        .from(address)
        .where(eq(address.id, addressId))
        .limit(1);

      if (!addr) {
        return { success: false, error: "Address not found" };
      }

      // Unset other defaults of same type
      await db
        .update(address)
        .set({ isDefault: false })
        .where(and(
          eq(address.userId, userId),
          eq(address.type, addr.type),
          eq(address.isDefault, true)
        ));

      // Set new default
      const [result] = await db
        .update(address)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(address.id, addressId))
        .returning();

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to set default" };
    }
  }

  /**
   * Create address and optionally set as default
   */
  async createForUser(
    userId: string,
    data: Omit<NewAddress, 'userId'>,
    setAsDefault = false
  ): Promise<CRUDResult<Address>> {
    try {
      if (setAsDefault) {
        // Unset existing defaults of same type
        await db
          .update(address)
          .set({ isDefault: false })
          .where(and(
            eq(address.userId, userId),
            eq(address.type, data.type),
            eq(address.isDefault, true)
          ));
      }

      const [result] = await db
        .insert(address)
        .values({ ...data, userId, isDefault: setAsDefault })
        .returning();

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to create address" };
    }
  }
}

export const AddressCRUD = new AddressCRUDClass();
