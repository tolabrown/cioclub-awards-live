import { pgTable, text, timestamp, boolean, integer, index } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

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

// ============================================
// FILE MANAGEMENT SYSTEM
// ============================================

export const file = pgTable("file", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  remoteId: text("remote_id").notNull(), // S3/Storage object name
  url: text("url").notNull(), // Permanent URL
  directUrl: text("direct_url"), // Direct public URL (via Traefik)
  size: integer("size").notNull(),
  type: text("type"), // MIME type
  name: text("name"), // Original filename
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================
// CONTENT SCHEMAS
// ============================================

export const siteContent = pgTable("site_content", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  key: text("key").notNull().unique(),
  content: text("content").notNull(), // JSON string for flexibility
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pageContent = pgTable("page_content", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  path: text("path").notNull().unique(), // e.g. '/', '/about'
  data: text("data").notNull(), // JSON blob of the page content
  title: text("title"), // Page meta title
  description: text("description"), // Page meta description
  ogimage: text("og_image"), // OG image URL
  updatedBy: text("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const services = pgTable("services", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  iconName: text("icon_name"),
  features: text("features"), // Semicolon-separated or JSON
  order: text("order").default("0"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  imageUrl: text("image_url"),
  imageId: text("image_id").references(() => file.id),
  linkedinUrl: text("linkedin_url"),
  type: text("type").default("staff"), // 'leadership' | 'staff'
  displayOrder: integer("display_order").default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================
// LADIES IN TECH SYSTEM
// ============================================

export const ladiesInTechEvents = pgTable("ladies_in_tech_events", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location"),
  registrationUrl: text("registration_url"),
  paymentUrl: text("payment_url"),
  imageUrl: text("image_url"),
  imageId: text("image_id").references(() => file.id),
  category: text("category").default("ladies-in-tech"), // ladies-in-tech, leadership
  status: text("status").default("upcoming"), // upcoming, past, cancelled
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contactInquiries = pgTable("contact_inquiries", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const membershipInquiry = pgTable("membership_inquiry", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  organization: text("organization").notNull(),
  jobTitle: text("job_title").notNull(),
  tier: text("tier").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const cvApplications = pgTable("cv_applications", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  coverLetter: text("cover_letter"),
  cvFileId: text("cv_file_id").references(() => file.id),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ladiesInTechRegistrations = pgTable("ladies_in_tech_registrations", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  eventId: text("event_id").notNull().references(() => ladiesInTechEvents.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  organization: text("organization"),
  designation: text("designation"),
  category: text("reg_category").notNull(), // Package vs Pass
  amount: text("amount").notNull(),
  status: text("status").default("pending"), // pending, success, failed
  paymentRef: text("payment_ref"), // Flutterwave tx_ref
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================
// LADIES IN TECH ARCHIVES
// ============================================

export const ladiesInTechArchives = pgTable("ladies_in_tech_archives", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  location: text("location"),
  description: text("description"),
  year: text("year").notNull(),
  date: text("date"), // ISO date string
  coverImageUrl: text("cover_image_url"),
  coverImageId: text("cover_image_id").references(() => file.id),
  media: text("media").default("[]"), // JSON array of { url, fileId }
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================
// RELATIONS
// ============================================

export const userRelations = relations(user, ({ many }) => ({
  // Reduced to only what's kept
}));

export const fileRelations = relations(file, ({ many }) => ({
  teamMembers: many(teamMembers),
  ladiesInTechEvents: many(ladiesInTechEvents),
  ladiesInTechArchives: many(ladiesInTechArchives),
}));

export const teamMemberRelations = relations(teamMembers, ({ one }) => ({
  image: one(file, { fields: [teamMembers.imageId], references: [file.id] }),
}));

export const ladiesInTechEventRelations = relations(ladiesInTechEvents, ({ one }) => ({
  image: one(file, { fields: [ladiesInTechEvents.imageId], references: [file.id] }),
}));

export const cvApplicationRelations = relations(cvApplications, ({ one }) => ({
  cvFile: one(file, { fields: [cvApplications.cvFileId], references: [file.id] }),
}));

export const ladiesInTechRegistrationRelations = relations(ladiesInTechRegistrations, ({ one }) => ({
  event: one(ladiesInTechEvents, { fields: [ladiesInTechRegistrations.eventId], references: [ladiesInTechEvents.id] }),
}));

export const ladiesInTechArchiveRelations = relations(ladiesInTechArchives, ({ one }) => ({
  coverImage: one(file, { fields: [ladiesInTechArchives.coverImageId], references: [file.id] }),
}));

export const consultations = pgTable("consultations", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  country: text("country").notNull(),
  countryOther: text("country_other"),
  company: text("company").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  topic: text("topic").notNull(),
  message: text("message").notNull(),
  status: text("status").default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ============================================
// PARTNERS & BRANDS
// ============================================

export const partner = pgTable("partner", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  logoId: text("logo_id").notNull().references(() => file.id),
  websiteUrl: text("website_url"),
  type: text("type"), // e.g. 'Strategic Partner', 'Sponsor'
  category: text("category").notNull(), // e.g. 'Awards', 'LadiesInTech'
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const partnerRelations = relations(partner, ({ one }) => ({
  logo: one(file, { fields: [partner.logoId], references: [file.id] }),
}));

export const schema = {
  user, session, account, verification,
  file, siteContent, pageContent, services, teamMembers,
  ladiesInTechEvents, ladiesInTechArchives,
  contactInquiries, membershipInquiry, cvApplications, ladiesInTechRegistrations,
  consultations, partner,
  userRelations, fileRelations, teamMemberRelations, ladiesInTechEventRelations, cvApplicationRelations, ladiesInTechRegistrationRelations, ladiesInTechArchiveRelations, partnerRelations
};
