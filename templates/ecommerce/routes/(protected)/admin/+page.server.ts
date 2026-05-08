import type { PageServerLoad } from './$types';
import { OrderCRUD } from '$lib/db/order';
import { ProductCRUD } from '$lib/db/product';
import { ReviewCRUD } from '$lib/db/review';
import { db } from '$lib/db/drizzle';
import { user, order, product } from '$lib/db/schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export const load = (async () => {
  // Get dashboard stats
  const [orderStats, lowStock, pendingReviews, customerCount, activeProductsCount] = await Promise.all([
    OrderCRUD.getStats(),
    ProductCRUD.getLowStock(),
    ReviewCRUD.getPending(1, 5),
    // Get total customer count
    db.select({ count: sql<number>`count(*)` }).from(user).then(result => Number(result[0]?.count || 0)),
    // Get active products count
    db.select({ count: sql<number>`count(*)` })
      .from(product)
      .where(and(eq(product.isActive, true), eq(product.isPublished, true)))
      .then(result => Number(result[0]?.count || 0)),
  ]);

  // Get recent orders with user details
  const recentOrders = await db
    .select({
      id: order.id,
      total: order.total,
      status: order.status,
      createdAt: order.createdAt,
      userId: order.userId,
      customerName: user.name,
      customerEmail: user.email,
    })
    .from(order)
    .leftJoin(user, eq(order.userId, user.id))
    .orderBy(desc(order.createdAt))
    .limit(5);

  return {
    stats: orderStats.data,
    customerCount,
    activeProductsCount,
    lowStockProducts: lowStock.data || [],
    pendingReviews: pendingReviews.data || [],
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      customer: o.customerName || o.customerEmail || 'Guest',
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
    })),
  };
}) satisfies PageServerLoad;

