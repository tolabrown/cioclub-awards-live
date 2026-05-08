import { pgTable, text, timestamp, boolean, integer, decimal, json, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== CORE AUTH TABLES ====================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  role: text("role").default("user"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ==================== PRODUCT MANAGEMENT ====================

export const category = pgTable("category", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  parentId: text("parent_id").references((): any => category.id, { onDelete: "set null" }),
  image: text("image").references(() => file.id, { onDelete: "set null" }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const product = pgTable("product", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
  marketPrice: decimal("market_price", { precision: 10, scale: 2 }),
  sku: text("sku").notNull().unique(),
  barcode: text("barcode"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  isActive: boolean("is_active").notNull().default(true),
  isPublished: boolean("is_published").notNull().default(true),
  isFeatured: boolean("is_featured").notNull().default(false),
  weight: decimal("weight", { precision: 10, scale: 2 }),
  dimensions: json("dimensions").$type<{ length?: number; width?: number; height?: number }>(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  features: json("features").$type<Array<{ name: string; value: string }>>(),
  customFields: json("custom_fields").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productImage = pgTable("product_image", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  fileId: text("file_id").references(() => file.id, { onDelete: "set null" }),
  url: text("url").notNull(),
  remoteId: text("remote_id"),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const size = pgTable("size", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  abbreviation: text("abbreviation").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const productSize = pgTable("product_size", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  sizeId: text("size_id").notNull().references(() => size.id, { onDelete: "cascade" }),
  additionalPrice: decimal("additional_price", { precision: 10, scale: 2 }).notNull().default("0"),
  stockQuantity: integer("stock_quantity").notNull().default(0),
  sku: text("sku").unique(),
  isAvailable: boolean("is_available").notNull().default(true),
}, (table) => [
  unique("product_size_unique").on(table.productId, table.sizeId)
]);

export const tag = pgTable("tag", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  type: text("type"),
  color: text("color"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const productTag = pgTable("product_tag", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  tagId: text("tag_id").notNull().references(() => tag.id, { onDelete: "cascade" }),
}, (table) => [
  unique("product_tag_unique").on(table.productId, table.tagId)
]);

// ==================== CUSTOMER SHOPPING ====================

export const address = pgTable("address", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull().$type<"shipping" | "billing">(),
  isDefault: boolean("is_default").notNull().default(false),
  fullName: text("full_name").notNull(),
  company: text("company"),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("NG"),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cart = pgTable("cart", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  sessionId: text("session_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cartItem = pgTable("cart_item", {
  id: text("id").primaryKey(),
  cartId: text("cart_id").notNull().references(() => cart.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  productSizeId: text("product_size_id").references(() => productSize.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull().default(1),
  priceAtAdd: decimal("price_at_add", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  unique("cart_item_unique").on(table.cartId, table.productId, table.productSizeId)
]);

// ==================== ORDER MANAGEMENT ====================

export const order = pgTable("order", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  guestEmail: text("guest_email"),
  status: text("status").notNull().$type<"pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded">().default("pending"),
  paymentStatus: text("payment_status").notNull().$type<"pending" | "paid" | "failed" | "refunded">().default("pending"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  shippingAddress: json("shipping_address").$type<{
    fullName: string; addressLine1: string; addressLine2?: string;
    city: string; state: string; postalCode: string; country: string; phone: string;
  }>().notNull(),
  billingAddress: json("billing_address").$type<{
    fullName: string; addressLine1: string; addressLine2?: string;
    city: string; state: string; postalCode: string; country: string; phone: string;
  }>().notNull(),
  trackingNumber: text("tracking_number"),
  shippedAt: timestamp("shipped_at"),
  deliveredAt: timestamp("delivered_at"),
  customerNotes: text("customer_notes"),
  adminNotes: text("admin_notes"),
  deliveryMethod: text("delivery_method").$type<"shipping" | "pickup">().notNull().default("shipping"),
  pickupDetails: text("pickup_details"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItem = pgTable("order_item", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => order.id, { onDelete: "cascade" }),
  productId: text("product_id").references(() => product.id, { onDelete: "set null" }),
  productSizeId: text("product_size_id").references(() => productSize.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  productSku: text("product_sku").notNull(),
  sizeName: text("size_name"),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ==================== REVIEW SYSTEM ====================

export const review = pgTable("review", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  orderId: text("order_id").references(() => order.id, { onDelete: "set null" }),
  rating: integer("rating").notNull(),
  title: text("title"),
  comment: text("comment").notNull(),
  isVerifiedPurchase: boolean("is_verified_purchase").notNull().default(false),
  isApproved: boolean("is_approved").notNull().default(false),
  helpfulCount: integer("helpful_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
]);

export const wishlist = pgTable("wishlist", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  unique("wishlist_unique").on(table.userId, table.productId)
]);

// ==================== SYSTEM CONFIGURATION ====================

export const file = pgTable("file", {
  id: text("id").primaryKey(),
  fileId: text("file_id").notNull(),
  filename: text("filename"),
  mimeType: text("mime_type"),
  category: text("category").default("general"),
  size: integer("size").notNull(),
  url: text("url").notNull(),
  remoteId: text("remote_id"),
  uploadedBy: text("uploaded_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey().default("global"),
  storeName: text("store_name").notNull().default("My Store"),
  storeEmail: text("store_email").notNull().default("store@example.com"),
  storePhone: text("store_phone"),
  storeAddress: json("store_address").$type<{
    addressLine1?: string; city?: string; state?: string; postalCode?: string; country?: string;
  }>(),
  currency: text("currency").notNull().default("NGN"),
  taxRate: decimal("tax_rate", { precision: 5, scale: 2 }).notNull().default("0"),
  shippingRates: json("shipping_rates").$type<Array<{ name: string; price: number; minOrder?: number }>>(),
  socialLinks: json("social_links").$type<{ facebook?: string; twitter?: string; instagram?: string; }>(),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  // Theme & Branding
  primaryColor: text("primary_color").notNull().default("oklch(0.623 0.214 259.815)"),
  borderRadius: text("border_radius").notNull().default("0.75rem"),
  logoId: text("logo_id").references(() => file.id, { onDelete: "set null" }), // Legacy
  logoLightId: text("logo_light_id").references(() => file.id, { onDelete: "set null" }),
  logoDarkId: text("logo_dark_id").references(() => file.id, { onDelete: "set null" }),
  faviconId: text("favicon_id").references(() => file.id, { onDelete: "set null" }),
  storeCaption: text("store_caption").default("Lania Stores"),
  // Hero Section
  heroTitle: text("hero_title").default("Your Trusted Retail"),
  heroSubtitle: text("hero_subtitle").default("Lania Stores"),
  heroDescription: text("hero_description").default("From tiny toes to your beauty needs, we have it"),
  heroImageId: text("hero_image_id").references(() => file.id, { onDelete: "set null" }),
  // SEO
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ==================== RELATIONS ====================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  addresses: many(address),
  carts: many(cart),
  orders: many(order),
  reviews: many(review),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  parent: one(category, { fields: [category.parentId], references: [category.id], relationName: "categoryHierarchy" }),
  children: many(category, { relationName: "categoryHierarchy" }),
  products: many(product),
  imageFile: one(file, { fields: [category.image], references: [file.id] }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  category: one(category, { fields: [product.categoryId], references: [category.id] }),
  images: many(productImage),
  sizes: many(productSize),
  tags: many(productTag),
  reviews: many(review),
  cartItems: many(cartItem),
  orderItems: many(orderItem),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, { fields: [productImage.productId], references: [product.id] }),
  imageFile: one(file, { fields: [productImage.fileId], references: [file.id] }),
}));

export const sizeRelations = relations(size, ({ many }) => ({
  productSizes: many(productSize),
}));

export const productSizeRelations = relations(productSize, ({ one }) => ({
  product: one(product, { fields: [productSize.productId], references: [product.id] }),
  size: one(size, { fields: [productSize.sizeId], references: [size.id] }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  productTags: many(productTag),
}));

export const productTagRelations = relations(productTag, ({ one }) => ({
  product: one(product, { fields: [productTag.productId], references: [product.id] }),
  tag: one(tag, { fields: [productTag.tagId], references: [tag.id] }),
}));

export const addressRelations = relations(address, ({ one }) => ({
  user: one(user, { fields: [address.userId], references: [user.id] }),
}));

export const cartRelations = relations(cart, ({ one, many }) => ({
  user: one(user, { fields: [cart.userId], references: [user.id] }),
  items: many(cartItem),
}));

export const cartItemRelations = relations(cartItem, ({ one }) => ({
  cart: one(cart, { fields: [cartItem.cartId], references: [cart.id] }),
  product: one(product, { fields: [cartItem.productId], references: [product.id] }),
  productSize: one(productSize, { fields: [cartItem.productSizeId], references: [productSize.id] }),
}));

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, { fields: [order.userId], references: [user.id] }),
  items: many(orderItem),
  reviews: many(review),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, { fields: [orderItem.orderId], references: [order.id] }),
  product: one(product, { fields: [orderItem.productId], references: [product.id] }),
  productSize: one(productSize, { fields: [orderItem.productSizeId], references: [productSize.id] }),
}));

export const reviewRelations = relations(review, ({ one }) => ({
  product: one(product, { fields: [review.productId], references: [product.id] }),
  user: one(user, { fields: [review.userId], references: [user.id] }),
  order: one(order, { fields: [review.orderId], references: [order.id] }),
}));

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(user, { fields: [wishlist.userId], references: [user.id] }),
  product: one(product, { fields: [wishlist.productId], references: [product.id] }),
}));

// ==================== SCHEMA EXPORT ====================

export const schema = {
  user, session, account, verification,
  category, product, productImage, size, productSize, tag, productTag,
  address, cart, cartItem,
  order, orderItem,
  review,
  wishlist,
  file, settings,
};

export const settingsRelations = relations(settings, ({ one }) => ({
  logo: one(file, { fields: [settings.logoId], references: [file.id] }),
  logoLight: one(file, { fields: [settings.logoLightId], references: [file.id] }),
  logoDark: one(file, { fields: [settings.logoDarkId], references: [file.id] }),
  favicon: one(file, { fields: [settings.faviconId], references: [file.id] }),
  heroImage: one(file, { fields: [settings.heroImageId], references: [file.id] }),
}));

// ==================== TYPE EXPORTS ====================

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Category = typeof category.$inferSelect;
export type NewCategory = typeof category.$inferInsert;
export type Product = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
export type ProductImage = typeof productImage.$inferSelect;
export type NewProductImage = typeof productImage.$inferInsert;
export type Size = typeof size.$inferSelect;
export type NewSize = typeof size.$inferInsert;
export type ProductSize = typeof productSize.$inferSelect;
export type NewProductSize = typeof productSize.$inferInsert;
export type Tag = typeof tag.$inferSelect;
export type NewTag = typeof tag.$inferInsert;
export type ProductTag = typeof productTag.$inferSelect;
export type NewProductTag = typeof productTag.$inferInsert;
export type Address = typeof address.$inferSelect;
export type NewAddress = typeof address.$inferInsert;
export type Cart = typeof cart.$inferSelect;
export type NewCart = typeof cart.$inferInsert;
export type CartItem = typeof cartItem.$inferSelect;
export type NewCartItem = typeof cartItem.$inferInsert;
export type Order = typeof order.$inferSelect;
export type NewOrder = typeof order.$inferInsert;
export type OrderItem = typeof orderItem.$inferSelect;
export type NewOrderItem = typeof orderItem.$inferInsert;
export type Review = typeof review.$inferSelect;
export type NewReview = typeof review.$inferInsert;
export type Wishlist = typeof wishlist.$inferSelect;
export type NewWishlist = typeof wishlist.$inferInsert;
export type File = typeof file.$inferSelect;
export type NewFile = typeof file.$inferInsert;
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type SettingsWithRelations = Settings & {
  logo: File | null;
  logoLight: File | null;
  logoDark: File | null;
  favicon: File | null;
  heroImage: File | null;
};
