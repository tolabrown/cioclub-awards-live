import { db } from "./drizzle";
import { marketplaceProduct, marketplaceWaitlist } from "./schema";
import { eq, desc } from "drizzle-orm";

export async function getMarketplaceProducts() {
  return await db.query.marketplaceProduct.findMany({
    orderBy: desc(marketplaceProduct.createdAt)
  });
}

export async function addMarketplaceProduct(data: any) {
  const [result] = await db.insert(marketplaceProduct).values(data).returning();
  return result;
}

export async function deleteMarketplaceProduct(id: string) {
  const [result] = await db.delete(marketplaceProduct).where(eq(marketplaceProduct.id, id)).returning();
  return result;
}

export async function addToWaitlist(email: string) {
  const [result] = await db.insert(marketplaceWaitlist).values({ email }).returning();
  return result;
}
