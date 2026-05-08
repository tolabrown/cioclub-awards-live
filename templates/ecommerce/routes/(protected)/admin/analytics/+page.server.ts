import { db } from "$lib/db/drizzle";
import { order, product, user, review } from "$lib/db/schema";
import { sql, eq, desc, and } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // Total Revenue
  const [revenueResult] = await db
    .select({ total: sql<number>`SUM(${order.total})` })
    .from(order)
    .where(eq(order.paymentStatus, 'paid'));

  // Total Orders
  const [ordersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(order);

  // Total Customers
  const [customersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(user);

  // Recent Orders
  const recentOrders = await db
    .select()
    .from(order)
    .orderBy(desc(order.createdAt))
    .limit(5);

  return {
    stats: {
      totalRevenue: Number(revenueResult?.total || 0),
      totalOrders: Number(ordersResult?.count || 0),
      totalCustomers: Number(customersResult?.count || 0),
    },
    recentOrders,
  };
};
