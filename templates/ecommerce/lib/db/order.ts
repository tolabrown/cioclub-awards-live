import { BaseCRUD, eq, and, desc, sql, type CRUDResult, type CRUDListResult } from "./crud";
import { order, orderItem, product, productSize, type Order, type NewOrder, type OrderItem, type NewOrderItem, type User } from "./schema";
import { db } from "./drizzle";
import { generateOrderNumber } from "$lib/fxns";

interface OrderWithItems extends Order {
  items?: OrderItem[];
  user?: User | null;
}

interface OrderFilters {
  userId?: string;
  status?: Order["status"];
  paymentStatus?: Order["paymentStatus"];
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

class OrderCRUDClass extends BaseCRUD<typeof order, Order, NewOrder> {
  constructor() {
    super(order);
  }

  /**
   * Get order by ID with items and user
   */
  async getById(id: string): Promise<CRUDResult<OrderWithItems>> {
    try {
      const result = await db.query.order.findFirst({
        where: eq(order.id, id),
        with: {
          items: true,
          user: true,
        }
      });

      if (!result) {
        return { success: false, error: "Order not found" };
      }

      return { success: true, data: result as OrderWithItems };
    } catch (error) {
      console.error(`[OrderCRUD] GetById error:`, error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to get order" };
    }
  }

  /**
   * Create order with items
   */
  async createWithItems(
    orderData: Omit<NewOrder, 'orderNumber' | 'id'>,
    items: Omit<NewOrderItem, 'orderId' | 'id'>[]
  ): Promise<CRUDResult<OrderWithItems>> {
    try {
      const orderNumber = generateOrderNumber();
      const orderId = crypto.randomUUID();

      const [newOrder] = await db
        .insert(order)
        .values({ ...orderData, id: orderId, orderNumber })
        .returning();

      const orderItems = items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        orderId: newOrder.id,
      }));

      const insertedItems = await db
        .insert(orderItem)
        .values(orderItems)
        .returning();

      return {
        success: true,
        data: { ...newOrder, items: insertedItems },
      };
    } catch (error) {
      console.error(`[OrderCRUD] CreateWithItems error:`, error);
      return { success: false, error: error instanceof Error ? error.message : "Failed to create order" };
    }
  }

  /**
   * Get order by order number
   */
  async getByOrderNumber(orderNumber: string): Promise<CRUDResult<OrderWithItems>> {
    try {
      const [result] = await db
        .select()
        .from(order)
        .where(eq(order.orderNumber, orderNumber))
        .limit(1);

      if (!result) {
        return { success: false, error: "Order not found" };
      }

      const items = await db
        .select()
        .from(orderItem)
        .where(eq(orderItem.orderId, result.id));

      return { success: true, data: { ...result, items } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get order" };
    }
  }

  /**
   * Get order by ID with items
   */
  async getByIdWithItems(id: string): Promise<CRUDResult<OrderWithItems>> {
    try {
      const [result] = await db
        .select()
        .from(order)
        .where(eq(order.id, id))
        .limit(1);

      if (!result) {
        return { success: false, error: "Order not found" };
      }

      const items = await db
        .select()
        .from(orderItem)
        .where(eq(orderItem.orderId, result.id));

      return { success: true, data: { ...result, items } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get order" };
    }
  }

  /**
   * Get orders with filters
   */
  async getFiltered(
    filters?: OrderFilters,
    page = 1,
    limit = 20
  ): Promise<CRUDListResult<OrderWithItems>> {
    try {
      const offset = (page - 1) * limit;
      const conditions: any[] = [];

      if (filters?.userId) {
        conditions.push(eq(order.userId, filters.userId));
      }
      if (filters?.status) {
        conditions.push(eq(order.status, filters.status));
      }
      if (filters?.paymentStatus) {
        conditions.push(eq(order.paymentStatus, filters.paymentStatus));
      }
      if (filters?.startDate) {
        conditions.push(sql`${order.createdAt} >= ${filters.startDate}`);
      }
      if (filters?.endDate) {
        conditions.push(sql`${order.createdAt} <= ${filters.endDate}`);
      }
      if (filters?.search) {
        conditions.push(sql`${order.orderNumber} ILIKE ${'%' + filters.search + '%'}`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const countQuery = db.select({ count: sql<number>`count(*)` }).from(order);
      if (whereClause) countQuery.where(whereClause);
      const [countResult] = await countQuery;
      const total = Number(countResult?.count || 0);

      let query = db.select().from(order).orderBy(desc(order.createdAt));
      if (whereClause) query.where(whereClause);
      const results = await query.limit(limit).offset(offset);

      // Fetch items for these orders
      let finalData: OrderWithItems[] = results;
      if (results.length > 0) {
        const orderIds = results.map(o => o.id);
        const allItems = await db
          .select()
          .from(orderItem)
          .where(sql`${orderItem.orderId} IN ${orderIds}`);

        finalData = results.map(o => ({
          ...o,
          items: allItems.filter(item => item.orderId === o.id)
        }));
      }

      return {
        success: true,
        data: finalData,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to get orders" };
    }
  }

  /**
   * Get user orders
   */
  async getUserOrders(userId: string, page = 1, limit = 20): Promise<CRUDListResult<OrderWithItems>> {
    return this.getFiltered({ userId }, page, limit);
  }

  /**
   * Update order status
   */
  async updateStatus(id: string, status: Order["status"]): Promise<CRUDResult<Order>> {
    const updates: Partial<Order> = { status };

    if (status === 'shipped') {
      updates.shippedAt = new Date();
    } else if (status === 'delivered') {
      updates.deliveredAt = new Date();
    }

    return this.update(id, updates as any);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(id: string, paymentStatus: Order["paymentStatus"], paymentReference?: string): Promise<CRUDResult<Order>> {
    return this.update(id, { paymentStatus, paymentReference } as any);
  }

  /**
   * Add tracking number
   */
  async addTracking(id: string, trackingNumber: string): Promise<CRUDResult<Order>> {
    return this.update(id, { trackingNumber } as any);
  }

  /**
   * Get order statistics
   */
  async getStats(startDate?: Date, endDate?: Date): Promise<CRUDResult<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }>> {
    try {
      const conditions: any[] = [];
      if (startDate) conditions.push(sql`${order.createdAt} >= ${startDate}`);
      if (endDate) conditions.push(sql`${order.createdAt} <= ${endDate}`);

      const whereClause = conditions.length > 0 ? and(...conditions) : sql`1=1`;

      const [stats] = await db
        .select({
          totalOrders: sql<number>`count(*)`,
          totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${order.paymentStatus} = 'paid' THEN ${order.total} ELSE 0 END), 0)`,
          pendingOrders: sql<number>`SUM(CASE WHEN ${order.status} = 'pending' THEN 1 ELSE 0 END)`,
          completedOrders: sql<number>`SUM(CASE WHEN ${order.status} = 'delivered' THEN 1 ELSE 0 END)`,
        })
        .from(order)
        .where(whereClause);

      return {
        success: true,
        data: {
          totalOrders: Number(stats?.totalOrders || 0),
          totalRevenue: Number(stats?.totalRevenue || 0),
          pendingOrders: Number(stats?.pendingOrders || 0),
          completedOrders: Number(stats?.completedOrders || 0),
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get stats" };
    }
  }
}

export const OrderCRUD = new OrderCRUDClass();
