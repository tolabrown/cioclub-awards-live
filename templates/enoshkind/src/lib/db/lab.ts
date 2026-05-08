import { db } from "./drizzle";
import { labTestOrder, labResult, labTest } from "./schema";
import { eq, asc } from "drizzle-orm";

export async function addLabOrder(data: any) {
  const [result] = await db.insert(labTestOrder).values(data).returning();
  return result;
}

export async function getLabOrders(userId: string) {
  return await db.query.labTestOrder.findMany({
    where: eq(labTestOrder.userId, userId),
    orderBy: (labTestOrder, { desc }) => [desc(labTestOrder.createdAt)]
  });
}

export async function getLabResults(orderId: string) {
  return await db.query.labResult.findMany({
    where: eq(labResult.orderId, orderId)
  });
}

export async function updateLabOrder(id: string, data: any) {
  const [result] = await db.update(labTestOrder).set(data).where(eq(labTestOrder.id, id)).returning();
  return result;
}

export async function getAvailableLabTests() {
  return await db.query.labTest.findMany({
    orderBy: [asc(labTest.category), asc(labTest.name)]
  });
}

export async function addLabTest(data: any) {
  const [result] = await db.insert(labTest).values(data).returning();
  return result;
}

export async function updateLabTest(id: string, data: any) {
  const [result] = await db.update(labTest).set(data).where(eq(labTest.id, id)).returning();
  return result;
}

export async function deleteLabTest(id: string) {
  return await db.delete(labTest).where(eq(labTest.id, id));
}
