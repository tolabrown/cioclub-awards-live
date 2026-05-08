import { db } from "./drizzle";
import { communityCycle } from "./schema";
import { eq, desc } from "drizzle-orm";

export async function getCommunityCycles() {
  return await db.query.communityCycle.findMany({
    orderBy: desc(communityCycle.createdAt)
  });
}

export async function addCommunityCycle(data: any) {
  const [result] = await db.insert(communityCycle).values(data).returning();
  return result;
}

export async function deleteCommunityCycle(id: string) {
  const [result] = await db.delete(communityCycle).where(eq(communityCycle.id, id)).returning();
  return result;
}
