import { db } from "./drizzle";
import { prescription, pharmacyOrder } from "./schema";
import { eq } from "drizzle-orm";

export async function getPrescriptions(userId: string) {
  return await db.query.prescription.findMany({
    where: eq(prescription.userId, userId),
    orderBy: (prescription, { desc }) => [desc(prescription.createdAt)]
  });
}

export async function addPrescription(data: any) {
  const [result] = await db.insert(prescription).values(data).returning();
  return result;
}

export async function addPharmacyOrder(data: any) {
  const [result] = await db.insert(pharmacyOrder).values(data).returning();
  return result;
}

export async function getPharmacyOrders(userId: string) {
  return await db.query.pharmacyOrder.findMany({
    where: eq(pharmacyOrder.userId, userId),
    orderBy: (pharmacyOrder, { desc }) => [desc(pharmacyOrder.createdAt)]
  });
}

export async function updatePharmacyOrder(id: string, data: any) {
  const [result] = await db.update(pharmacyOrder).set(data).where(eq(pharmacyOrder.id, id)).returning();
  return result;
}
