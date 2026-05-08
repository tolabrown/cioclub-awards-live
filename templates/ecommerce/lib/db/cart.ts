import { BaseCRUD, eq, and, sql, type CRUDResult, type CRUDListResult } from "./crud";
import { cart, cartItem, product, productImage, productSize, size, type Cart, type NewCart, type CartItem, type NewCartItem, type Product, type ProductSize, type Size, type ProductImage } from "./schema";
import { db } from "./drizzle";

interface CartItemWithProduct extends CartItem {
  product?: Product & { images: ProductImage[] };
  productSize?: (ProductSize & { size?: Size }) | null;
}

interface CartWithItems extends Cart {
  items?: CartItemWithProduct[];
  subtotal?: number;
  itemCount?: number;
}

class CartCRUDClass extends BaseCRUD<typeof cart, Cart, NewCart> {
  constructor() {
    super(cart);
  }

  /**
   * Get or create cart for user
   */
  async getOrCreateForUser(userId: string): Promise<CRUDResult<CartWithItems>> {
    try {
      let [userCart] = await db
        .select()
        .from(cart)
        .where(eq(cart.userId, userId))
        .limit(1);

      if (!userCart) {
        [userCart] = await db
          .insert(cart)
          .values({ id: crypto.randomUUID(), userId })
          .returning();
      }

      return this.getWithItems(userCart.id);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get cart" };
    }
  }

  /**
   * Get or create cart for guest session
   */
  async getOrCreateForSession(sessionId: string): Promise<CRUDResult<CartWithItems>> {
    try {
      let [sessionCart] = await db
        .select()
        .from(cart)
        .where(eq(cart.sessionId, sessionId))
        .limit(1);

      if (!sessionCart) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        [sessionCart] = await db
          .insert(cart)
          .values({ id: crypto.randomUUID(), sessionId, expiresAt })
          .returning();
      }

      return this.getWithItems(sessionCart.id);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get cart" };
    }
  }

  /**
   * Get cart with items and product details
   */
  async getWithItems(cartId: string): Promise<CRUDResult<CartWithItems>> {
    try {
      const [cartData] = await db
        .select()
        .from(cart)
        .where(eq(cart.id, cartId))
        .limit(1);

      if (!cartData) {
        return { success: false, error: "Cart not found" };
      }

      const items = await db
        .select()
        .from(cartItem)
        .where(eq(cartItem.cartId, cartId));

      // Get product details for each item
      const productIds = [...new Set(items.map(i => i.productId))];
      const products = productIds.length > 0
        ? await db.select().from(product).where(sql`${product.id} IN ${productIds}`)
        : [];

      // Get images for these products
      const images = productIds.length > 0
        ? await db.select().from(productImage).where(sql`${productImage.productId} IN ${productIds}`)
        : [];

      const imageMap = new Map<string, any[]>();
      images.forEach(img => {
        const existing = imageMap.get(img.productId) || [];
        imageMap.set(img.productId, [...existing, img]);
      });

      const productMap = new Map(products.map(p => [p.id, { ...p, images: imageMap.get(p.id) || [] }]));

      // Get size details for each item
      const productSizeIds = [...new Set(items.map(i => i.productSizeId).filter(id => id !== null))] as string[];
      let productSizeMap = new Map<string, ProductSize & { size?: Size }>();

      if (productSizeIds.length > 0) {
        const productSizes = await db
          .select()
          .from(productSize)
          .where(sql`${productSize.id} IN ${productSizeIds}`);

        const sizeIds = [...new Set(productSizes.map(ps => ps.sizeId))];
        const sizes = await db.select().from(size).where(sql`${size.id} IN ${sizeIds}`);
        const sizeMap = new Map(sizes.map(s => [s.id, s]));

        productSizeMap = new Map(productSizes.map(ps => [
          ps.id,
          { ...ps, size: sizeMap.get(ps.sizeId) }
        ]));
      }

      const itemsWithProducts: CartItemWithProduct[] = items.map(item => ({
        ...item,
        product: productMap.get(item.productId),
        productSize: item.productSizeId ? productSizeMap.get(item.productSizeId) : null,
      }));

      const subtotal = itemsWithProducts.reduce((sum, item) => {
        return sum + (parseFloat(item.priceAtAdd) * item.quantity);
      }, 0);

      return {
        success: true,
        data: {
          ...cartData,
          items: itemsWithProducts,
          subtotal,
          itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
        },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to get cart" };
    }
  }

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    productId: string,
    quantity: number,
    priceAtAdd: string,
    productSizeId?: string
  ): Promise<CRUDResult<CartItem>> {
    try {
      // Check if item already exists
      const conditions = [eq(cartItem.cartId, cartId), eq(cartItem.productId, productId)];
      if (productSizeId) {
        conditions.push(eq(cartItem.productSizeId, productSizeId));
      } else {
        conditions.push(sql`${cartItem.productSizeId} IS NULL`);
      }

      const [existingItem] = await db
        .select()
        .from(cartItem)
        .where(and(...conditions))
        .limit(1);

      if (existingItem) {
        // Update quantity
        const [updated] = await db
          .update(cartItem)
          .set({ quantity: existingItem.quantity + quantity, updatedAt: new Date() })
          .where(eq(cartItem.id, existingItem.id))
          .returning();
        return { success: true, data: updated };
      }

      // Create new item
      const [newItem] = await db
        .insert(cartItem)
        .values({
          id: crypto.randomUUID(),
          cartId,
          productId,
          productSizeId,
          quantity,
          priceAtAdd
        })
        .returning();

      // Update cart updatedAt
      await db.update(cart).set({ updatedAt: new Date() }).where(eq(cart.id, cartId));

      return { success: true, data: newItem };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to add item" };
    }
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<CRUDResult<CartItem>> {
    try {
      if (quantity <= 0) {
        return this.removeItem(itemId);
      }

      const [updated] = await db
        .update(cartItem)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItem.id, itemId))
        .returning();

      if (!updated) {
        return { success: false, error: "Item not found" };
      }

      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to update quantity" };
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<CRUDResult<CartItem>> {
    try {
      const [removed] = await db
        .delete(cartItem)
        .where(eq(cartItem.id, itemId))
        .returning();

      if (!removed) {
        return { success: false, error: "Item not found" };
      }

      return { success: true, data: removed };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to remove item" };
    }
  }

  /**
   * Clear all items from cart
   */
  async clearCart(cartId: string): Promise<CRUDResult<number>> {
    try {
      const deleted = await db
        .delete(cartItem)
        .where(eq(cartItem.cartId, cartId))
        .returning();

      return { success: true, data: deleted.length };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to clear cart" };
    }
  }

  /**
   * Merge guest cart into user cart
   */
  async mergeGuestCart(guestSessionId: string, userId: string): Promise<CRUDResult<CartWithItems>> {
    try {
      const [guestCart] = await db
        .select()
        .from(cart)
        .where(eq(cart.sessionId, guestSessionId))
        .limit(1);

      if (!guestCart) {
        return this.getOrCreateForUser(userId);
      }

      const userCartResult = await this.getOrCreateForUser(userId);
      if (!userCartResult.success || !userCartResult.data) {
        return userCartResult;
      }

      // Get guest cart items
      const guestItems = await db
        .select()
        .from(cartItem)
        .where(eq(cartItem.cartId, guestCart.id));

      // Add each guest item to user cart
      for (const item of guestItems) {
        await this.addItem(
          userCartResult.data.id,
          item.productId,
          item.quantity,
          item.priceAtAdd,
          item.productSizeId || undefined
        );
      }

      // Delete guest cart
      await db.delete(cart).where(eq(cart.id, guestCart.id));

      return this.getWithItems(userCartResult.data.id);
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to merge carts" };
    }
  }
}

export const CartCRUD = new CartCRUDClass();
