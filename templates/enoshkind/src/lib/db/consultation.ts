import { db } from "./drizzle";
import { consultation, doctor } from "./schema";
import { eq, and } from "drizzle-orm";
import type { iConsultation } from "$lib/interface";

export async function addConsultation(data: any) {
  const [result] = await db.insert(consultation).values(data).returning();
  return result;
}

export async function getConsultations(userId: string) {
  return await db.query.consultation.findMany({
    where: eq(consultation.userId, userId),
    with: {
      doctor: true
    },
    orderBy: (consultation, { desc }) => [desc(consultation.createdAt)]
  });
}

export async function deleteConsultation(id: string) {
  const [result] = await db.delete(consultation).where(eq(consultation.id, id)).returning();
  return result;
}

export async function updateConsultation(id: string, data: any) {
  const updateData = { ...data };
  if (updateData.doctorId && typeof updateData.doctorId === 'object') {
    updateData.doctorId = updateData.doctorId.id;
  }
  const [result] = await db.update(consultation).set(updateData).where(eq(consultation.id, id)).returning();
  return result;
}

export async function getConsultation(consultationId: string) {
  return await db.query.consultation.findFirst({
    where: eq(consultation.id, consultationId),
    with: {
      doctor: true
    }
  });
}
