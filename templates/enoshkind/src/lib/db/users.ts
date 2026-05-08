import { db } from "./drizzle";
import { user } from "./schema";
import { eq, desc } from "drizzle-orm";

export async function getUsers() {
  return await db.query.user.findMany({
    orderBy: desc(user.createdAt)
  });
}

export async function updateUserRole(id: string, role: string) {
  const [result] = await db.update(user).set({ role }).where(eq(user.id, id)).returning();
  return result;
}

export async function deleteUser(id: string) {
  const [result] = await db.delete(user).where(eq(user.id, id)).returning();
  return result;
}
