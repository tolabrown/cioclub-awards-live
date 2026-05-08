import { db } from '$lib/db/drizzle';
import { account } from '$lib/db/schema';
import { onError, onSuccess } from '$lib/fxns';
import { eq } from 'drizzle-orm';

// Infer the User type from the schema
type Account = typeof account.$inferSelect;
type AccountInsert = typeof account.$inferInsert;

// Generic function to update user with Partial<User>
export async function updateAccount(
  userId: string,
  updates: Partial<Omit<Account, 'id' | 'createdAt' | 'updatedAt'>>
) {
  // Filter out undefined values and id/timestamp fields
  const updateData = Object.fromEntries(
    Object.entries(updates).filter(([key, value]) =>
      value !== undefined &&
      !['id', 'createdAt', 'updatedAt'].includes(key)
    )
  );

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }

  return await db
    .update(account)
    .set(updateData)
    .where(eq(account.userId, userId))
    .returning();
}

export const getAccountByUserId = async (userId: string) => {

  try {
    const userAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1)
      .then(res => res[0]);
    return onSuccess(userAccount);
  } catch (error: any) {
    return onError(error.message);
  }
}