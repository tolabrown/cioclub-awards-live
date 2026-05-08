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
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  organizationId: text("organization_id"), // Linked organization
  contactDetails: text("contact_details"),
  previousRole: text("previous_role"),
  sector: text("sector"),
  currentLocation: text("current_location"),
  areasOfExpertise: text("areas_of_expertise"),
  interests: text("interests"),
  collaborationGoals: text("collaboration_goals"),
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
// MinIO FILE MANAGEMENT SYSTEM
// ============================================

export const file = pgTable("file", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  remoteId: text("remote_id").notNull(), // MinIO object name
  url: text("url").notNull(), // Permanent URL
  directUrl: text("direct_url"), // Direct Traefik/MinIO URL
  size: integer("size").notNull(),
  type: text("type"), // MIME type
  name: text("name"), // Original filename
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================
// CONTENT SCHEMAS
// ============================================

export const news = pgTable("news", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  content: text("content").notNull(),
  caption: text("caption"),
  category: text("category").notNull(), // Events, Awards, Industry, Community
  imageUrl: text("image_url"), // Optional URL or file reference
  imageId: text("image_id").references(() => file.id), // Direct MinIO reference
  readTime: text("read_time"),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const event = pgTable("event", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location"),
  status: text("status").default("upcoming"), // upcoming, completed, ongoing
  coverImageId: text("cover_image_id").references(() => file.id),
  imageId: text("image_id").references(() => file.id),
  registrationLink: text("registration_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const partner = pgTable("partner", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(), // Strategic, Tech, Media, etc.
  logoId: text("logo_id").references(() => file.id),
  websiteUrl: text("website_url"),
  type: text("type"), // Strategic Partner, Tech Partner, Media Partner, etc.
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trustee = pgTable("trustee", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  position: text("position").notNull(), // Founder, Chairwoman, etc.
  role: text("role"), // Strategic Director, etc.
  bio: text("bio").notNull(),
  imageId: text("image_id").references(() => file.id),
  linkedinUrl: text("linkedin_url"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const resource = pgTable("resource", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // Report, Whitepaper, Case Study
  publishedDate: timestamp("published_date"),
  viewCount: integer("view_count").default(0),
  coverImageId: text("cover_image_id").references(() => file.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const pageContent = pgTable("page_content", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  path: text("path").notNull().unique(), // e.g. '/', '/awards'
  data: text("data").notNull(), // JSON blob of the page content
  title: text("title"), // Page meta title
  description: text("description"), // Page meta description
  ogImage: text("og_image"), // OG Image URL
  updatedBy: text("updated_by").references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================
// AWARDS SYSTEM TABLES
// ============================================

export const awardEntry = pgTable("award_entry", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").references(() => user.id),
  category: text("category").notNull(), // CIO of the Year, Digital Transformation, etc.
  projectTitle: text("project_title").notNull(),
  projectDescription: text("project_description").notNull(),
  organizationName: text("organization_name").notNull(),
  industry: text("industry").notNull(), // Banking, Fintech, FMCG, etc.
  country: text("country").notNull(),
  impactStatement: text("impact_statement").notNull(),
  supportingDocId: text("supporting_doc_id").references(() => file.id),
  status: text("status").default("pending"), // pending, under_review, shortlisted, winner, rejected
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const nomination = pgTable("nomination", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  nomineeFullName: text("nominee_full_name").notNull(),
  nomineeEmail: text("nominee_email").notNull(),
  nomineeCompany: text("nominee_company").notNull(),
  nomineePosition: text("nominee_position").notNull(),
  category: text("category").notNull(),
  nominatorName: text("nominator_name").notNull(),
  nominatorEmail: text("nominator_email").notNull(),
  nominatorCompany: text("nominator_company"),
  reason: text("reason").notNull(),
  status: text("status").default("pending"), // pending, contacted, converted, declined
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const ticketBooking = pgTable("ticket_booking", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").references(() => user.id),
  ticketType: text("ticket_type").notNull(), // standard, vip, corporate_table
  quantity: integer("quantity").notNull().default(1),
  totalAmount: integer("total_amount").notNull(), // in smallest currency unit (kobo/cents)
  attendeeName: text("attendee_name").notNull(),
  attendeeEmail: text("attendee_email").notNull(),
  attendeeCompany: text("attendee_company"),
  attendeePhone: text("attendee_phone"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed, refunded
  paymentReference: text("payment_reference"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const sponsorshipInquiry = pgTable("sponsorship_inquiry", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  packageInterest: text("package_interest").notNull(), // platinum, gold, silver, bronze
  message: text("message"),
  status: text("status").default("new"), // new, contacted, negotiating, confirmed, declined
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const contactInquiry = pgTable("contact_inquiry", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  inquiryType: text("inquiry_type").notNull(), // membership, partnership, speaking, press, other
  message: text("message").notNull(),
  status: text("status").default("new"), // new, read, responded, archived
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const membershipInquiry = pgTable("membership_inquiry", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  organization: text("organization").notNull(),
  jobTitle: text("job_title").notNull(),
  tier: text("tier").notNull(), // Individual, Corporate, etc.
  currency: text("currency").default("NGN"),
  phone: text("phone"),
  contactDetails: text("contact_details"),
  previousRole: text("previous_role"),
  sector: text("sector"),
  currentLocation: text("current_location"),
  areasOfExpertise: text("areas_of_expertise"),
  interests: text("interests"),
  collaborationGoals: text("collaboration_goals"),
  status: text("status").default("pending"), // pending, processing, approved, rejected
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const membershipPayment = pgTable("membership_payment", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").references(() => user.id),
  email: text("email").notNull(),
  fullName: text("full_name").notNull(),
  tier: text("tier").notNull(),
  amount: integer("amount").notNull(), // Original amount (usually in NGN kobo if that's the base)
  currency: text("currency").notNull().default("NGN"),
  convertedAmount: integer("converted_amount"), // Amount in selected currency (smallest unit)
  status: text("status").notNull().default("pending"), // pending, success, failed
  reference: text("reference").notNull().unique(),
  metadata: text("metadata"), // JSON string for org, job title, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const newsletterSubscriber = pgTable("newsletter_subscriber", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const awardsJury = pgTable("awards_jury", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  role: text("role"), // Chairman, Jury, Vice Chair, etc.
  occupation: text("occupation").notNull(),
  imageId: text("image_id").references(() => file.id),
  year: text("year").notNull().default("2024"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const awardWinner = pgTable("award_winner", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  awardType: text("award_type").notNull(), // e.g. "CIO of the Year"
  awardDescription: text("award_description"), // Optional description for special awards
  organization: text("organization"),
  year: text("year").notNull().default("2024"),
  imageId: text("image_id").references(() => file.id),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const awardsTeam = pgTable("awards_team", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  title: text("title").notNull(),
  imageId: text("image_id").references(() => file.id),
  year: text("year").notNull().default("2024"),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const testimonial = pgTable("testimonial", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  country: text("country"),
  organization: text("organization"),
  testimonial: text("testimonial").notNull(), // HTML content
  imageId: text("image_id").references(() => file.id),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================
// JUNCTION TABLES FOR MULTI-FILE RELATIONS
// ============================================

export const eventMedia = pgTable("event_media", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  eventId: text("event_id").notNull().references(() => event.id, { onDelete: "cascade" }),
  fileId: text("file_id").notNull().references(() => file.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").default(0),
});

// ============================================
// GALLERY SYSTEM TABLES
// ============================================

export const album = pgTable("album", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  year: text("year").notNull().default("2024"),
  location: text("location"),
  coverImageId: text("cover_image_id").references(() => file.id),
  displayLimit: integer("display_limit"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const albumMedia = pgTable("album_media", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  albumId: text("album_id").references(() => album.id, { onDelete: "cascade" }),
  remoteId: text("remote_id").notNull(), // MinIO object name
  url: text("url").notNull(), // Permanent URL
  size: integer("size").notNull(),
  type: text("type"), // MIME type
  name: text("name"), // Original filename
  displayOrder: integer("display_order").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const resourceMedia = pgTable("resource_media", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  resourceId: text("resource_id").notNull().references(() => resource.id, { onDelete: "cascade" }),
  fileId: text("file_id").notNull().references(() => file.id, { onDelete: "cascade" }),
  displayOrder: integer("display_order").default(0),
});

// ============================================
// COMMUNITY SYSTEM TABLES
// ============================================

export const communityPost = pgTable("community_post", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  title: text("title"),
  category: text("category").default("general"), // general, help, announcement, news
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const communityReply = pgTable("community_reply", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  postId: text("post_id").notNull().references(() => communityPost.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const communityLike = pgTable("community_like", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  postId: text("post_id").references(() => communityPost.id, { onDelete: "cascade" }),
  replyId: text("reply_id").references(() => communityReply.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => {
  return {
    postIdIdx: index("community_like_post_id_idx").on(table.postId),
    replyIdIdx: index("community_like_reply_id_idx").on(table.replyId),
    userIdIdx: index("community_like_user_id_idx").on(table.userId),
  };
});

// ============================================
// CORPORATE / ORGANIZATION SYSTEM TABLES
// ============================================

export const organization = pgTable("organization", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  adminId: text("admin_id").notNull().references(() => user.id),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const organizationMember = pgTable("organization_member", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull(), // For invited but not yet registered
  role: text("role").notNull().default("member"), // admin, member
  status: text("status").notNull().default("pending"), // pending, active
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

// ============================================
// RELATIONS
// ============================================

export const userRelations = relations(user, ({ one, many }) => ({
  posts: many(communityPost),
  replies: many(communityReply),
  likes: many(communityLike),
  organization: one(organization, { fields: [user.organizationId], references: [organization.id] }),
  memberships: many(organizationMember),
  activityLogs: many(activityLog),
}));

export const organizationRelations = relations(organization, ({ one, many }) => ({
  admin: one(user, { fields: [organization.adminId], references: [user.id] }),
  members: many(organizationMember),
}));

export const organizationMemberRelations = relations(organizationMember, ({ one }) => ({
  organization: one(organization, { fields: [organizationMember.organizationId], references: [organization.id] }),
  user: one(user, { fields: [organizationMember.userId], references: [user.id] }),
}));

export const fileRelations = relations(file, ({ many }) => ({
  eventMedia: many(eventMedia, { relationName: "file_to_eventMedia" }),
  resourceMedia: many(resourceMedia, { relationName: "file_to_resourceMedia" }),
  news: many(news),
  eventsAsCover: many(event, { relationName: "event_coverImage" }),
  eventsAsMain: many(event, { relationName: "event_image" }),
  partners: many(partner),
  trustees: many(trustee),
  resources: many(resource),
  awardEntries: many(awardEntry),
  albums: many(album),
  awardsJury: many(awardsJury),
  awardWinners: many(awardWinner),
  awardsTeam: many(awardsTeam),
  testimonials: many(testimonial),
}));

export const communityPostRelations = relations(communityPost, ({ one, many }) => ({
  author: one(user, { fields: [communityPost.userId], references: [user.id] }),
  replies: many(communityReply),
  likes: many(communityLike),
}));

export const communityReplyRelations = relations(communityReply, ({ one, many }) => ({
  post: one(communityPost, { fields: [communityReply.postId], references: [communityPost.id] }),
  author: one(user, { fields: [communityReply.userId], references: [user.id] }),
  likes: many(communityLike),
}));

export const communityLikeRelations = relations(communityLike, ({ one }) => ({
  post: one(communityPost, { fields: [communityLike.postId], references: [communityPost.id] }),
  reply: one(communityReply, { fields: [communityLike.replyId], references: [communityReply.id] }),
  user: one(user, { fields: [communityLike.userId], references: [user.id] }),
}));

export const eventRelations = relations(event, ({ one, many }) => ({
  coverImage: one(file, { fields: [event.coverImageId], references: [file.id], relationName: "event_coverImage" }),
  image: one(file, { fields: [event.imageId], references: [file.id], relationName: "event_image" }),
  media: many(eventMedia),
}));

export const eventMediaRelations = relations(eventMedia, ({ one }) => ({
  event: one(event, { fields: [eventMedia.eventId], references: [event.id] }),
  file: one(file, { fields: [eventMedia.fileId], references: [file.id], relationName: "file_to_eventMedia" }),
}));

export const resourceMediaRelations = relations(resourceMedia, ({ one }) => ({
  resource: one(resource, { fields: [resourceMedia.resourceId], references: [resource.id] }),
  file: one(file, { fields: [resourceMedia.fileId], references: [file.id], relationName: "file_to_resourceMedia" }),
}));

export const albumRelations = relations(album, ({ one, many }) => ({
  coverImage: one(file, { fields: [album.coverImageId], references: [file.id] }),
  media: many(albumMedia),
}));

export const albumMediaRelations = relations(albumMedia, ({ one }) => ({
  album: one(album, { fields: [albumMedia.albumId], references: [album.id] }),
}));

export const awardsJuryRelations = relations(awardsJury, ({ one }) => ({
  image: one(file, { fields: [awardsJury.imageId], references: [file.id] }),
}));

export const awardWinnerRelations = relations(awardWinner, ({ one }) => ({
  image: one(file, { fields: [awardWinner.imageId], references: [file.id] }),
}));

export const awardsTeamRelations = relations(awardsTeam, ({ one }) => ({
  image: one(file, { fields: [awardsTeam.imageId], references: [file.id] }),
}));

export const testimonialRelations = relations(testimonial, ({ one }) => ({
  image: one(file, { fields: [testimonial.imageId], references: [file.id] }),
}));

export const awardEntryRelations = relations(awardEntry, ({ one }) => ({
  user: one(user, { fields: [awardEntry.userId], references: [user.id] }),
  supportingDoc: one(file, { fields: [awardEntry.supportingDocId], references: [file.id] }),
}));

export const nominationRelations = relations(nomination, ({ one }) => ({
  // Define relations if needed
}));

export const ticketBookingRelations = relations(ticketBooking, ({ one }) => ({
  user: one(user, { fields: [ticketBooking.userId], references: [user.id] }),
}));

export const membershipPaymentRelations = relations(membershipPayment, ({ one }) => ({
  user: one(user, { fields: [membershipPayment.userId], references: [user.id] }),
}));

export const newsRelations = relations(news, ({ one }) => ({
  image: one(file, { fields: [news.imageId], references: [file.id] }),
}));

export const trusteeRelations = relations(trustee, ({ one }) => ({
  image: one(file, { fields: [trustee.imageId], references: [file.id] }),
}));

export const resourceRelations = relations(resource, ({ one, many }) => ({
  coverImage: one(file, { fields: [resource.coverImageId], references: [file.id] }),
  media: many(resourceMedia),
}));

export const partnerRelations = relations(partner, ({ one }) => ({
  logo: one(file, { fields: [partner.logoId], references: [file.id] }),
}));



export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  operation: text("operation").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(user, { fields: [activityLog.userId], references: [user.id] }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  file,
  news,
  event,
  partner,
  trustee,
  resource,
  pageContent,
  awardEntry,
  nomination,
  ticketBooking,
  sponsorshipInquiry,
  contactInquiry,
  membershipInquiry,
  membershipPayment,
  newsletterSubscriber,
  eventMedia,
  resourceMedia,
  album,
  albumMedia,
  communityPost,
  communityPostRelations,
  communityReply,
  communityReplyRelations,
  communityLike,
  communityLikeRelations,
  fileRelations,
  eventRelations,
  eventMediaRelations,
  resourceMediaRelations,
  albumRelations,
  albumMediaRelations,
  awardsJury,
  awardsJuryRelations,
  awardWinner,
  awardWinnerRelations,
  awardsTeam,
  awardsTeamRelations,
  testimonial,
  testimonialRelations,
  awardEntryRelations,
  nominationRelations,
  ticketBookingRelations,
  newsRelations,
  trusteeRelations,
  resourceRelations,
  partnerRelations,
  membershipPaymentRelations,
  organization,
  organizationMember,
  organizationRelations,
  organizationMemberRelations,
  activityLog,
  activityLogRelations,
  userRelations,
};
