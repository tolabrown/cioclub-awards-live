import { pgTable, text, timestamp, boolean, decimal, integer, jsonb } from "drizzle-orm/pg-core";
import { randomUUID } from "crypto";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  role: text("role"),
  bio: text("bio"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  user: text("user").references(() => user.id), // Nullable for system actions
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  entity: text("entity").notNull(), // User, Session, etc.
  entityId: text("entity_id").notNull(),
  details: text("details"), // JSON string containing before/after state or diff
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(user, {
    fields: [activityLog.user],
    references: [user.id],
  }),
}));

export const patient = pgTable("patient", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  user: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  location: text("location").notNull(),
  culturalBackground: text("cultural_background").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Telemedicine & Consultations
export const doctor = pgTable("doctor", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  reviews: integer("reviews").default(0),
  image: text("image"),
  available: text("available"), // e.g., "Today", "Tomorrow"
  price: integer("price").notNull(), // in kobo
  bio: text("bio"),
  // Bank Details
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  accountName: text("account_name"),
  paystackRecipientCode: text("paystack_recipient_code"),
  // Legal & Verification
  legalAccepted: boolean("legal_accepted").default(false),
  verified: boolean("verified").default(false),
  approved: boolean("approved").default(false),
  licenseUrl: text("license_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const consultation = pgTable("consultation", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  doctorId: text("doctor_id").references(() => doctor.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // General, Specialist, Mental Health, Emergency
  appointmentDate: timestamp("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  status: text("status").default("pending").notNull(), // pending, confirmed, completed, cancelled
  paid: boolean("paid").default(false).notNull(),
  reason: text("reason"),
  // Feedback and Evidence
  consultationNotes: text("consultation_notes"),
  referralDetails: text("referral_details"),
  nextSteps: text("next_steps"),
  // Financials
  totalFee: integer("total_fee"), // doctor price + service charge
  serviceCharge: integer("service_charge"),
  adminFee: integer("admin_fee").default(0), // additional fee set by admin
  payoutStatus: text("payout_status").default("none"), // none, pending, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const doctorAvailability = pgTable("doctor_availability", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  doctorId: text("doctor_id")
    .notNull()
    .references(() => doctor.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(), // HH:mm
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Home Testing / Labs
export const labTest = pgTable("lab_test", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(), // in kobo
  popular: boolean("popular").default(false),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const labTestOrder = pgTable("lab_test_order", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  testType: text("test_type").notNull(), // Essential, Comprehensive, etc.
  status: text("status").default("order_placed").notNull(), // order_placed, kit_prepared, out_for_delivery, delivered, sample_collected, processing, results_ready
  technicianName: text("technician_name"),
  technicianPhone: text("technician_phone"),
  scheduledCollection: timestamp("scheduled_collection"),
  pdfUrl: text("pdf_url"),
  paid: boolean("paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const labResult = pgTable("lab_result", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  orderId: text("order_id")
    .notNull()
    .references(() => labTestOrder.id, { onDelete: "cascade" }),
  overallScore: integer("overall_score"),
  metrics: text("metrics"), // JSON string of results
  recommendations: text("recommendations"), // JSON string
  rawAnalysis: text("raw_analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Digital Pharmacy
export const prescription = pgTable("prescription", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions"),
  prescribedBy: text("prescribed_by"),
  status: text("status").default("active").notNull(), // active, completed
  autoRefill: boolean("auto_refill").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pharmacyOrder = pgTable("pharmacy_order", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pharmacyName: text("pharmacy_name").notNull(),
  status: text("status").default("pending").notNull(), // pending, delivered
  totalAmount: integer("total_amount").notNull(),
  paid: boolean("paid").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insurance
export const insurancePolicy = pgTable("insurance_policy", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  policyNumber: text("policy_number").notNull(),
  status: text("status").default("active"),
  annualCoverage: integer("annual_coverage"), // in kobo
  usedCoverage: integer("used_coverage").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const healthTracking = pgTable("health_tracking", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  trackingDate: timestamp("tracking_date").notNull(),
  // Vitals
  systolic: text("systolic"),
  diastolic: text("diastolic"),
  heartRate: text("heart_rate"),
  weight: text("weight"),
  // Labs & Specialized Metrics
  bloodSugarFasting: text("blood_sugar_fasting"),
  bloodSugarRandom: text("blood_sugar_random"),
  bloodSugarPostMeal: text("blood_sugar_post_meal"),
  hba1c: text("hba1c"),
  cholesterol: text("cholesterol"),
  creatinine: text("creatinine"),
  egfr: text("egfr"),
  bun: text("bun"),
  proteinuria: text("proteinuria"),
  psaLevel: text("psa_level"),
  // Cancer Symptoms / Indicators
  bowelMovements: text("bowel_movements"),
  urinarySymptoms: text("urinary_symptoms"),
  skinChanges: text("skin_changes"),
  lumps: text("lumps"),
  painLevel: integer("pain_level"),
  familyHistory: text("family_history"),
  screenings: text("screenings"), // JSON string or comma-separated
  // Daily Aggregates & Lifestyle
  steps: integer("steps").default(0),
  hydration: integer("hydration").default(0), // glasses
  sleepDuration: integer("sleep_duration").default(0), // minutes
  exerciseHours: text("exercise_hours"),
  dietCompliance: text("diet_compliance"),
  medicationTaken: boolean("medication_taken").default(false),
  stressLevel: integer("stress_level"),
  // Wellness
  moodRating: text("mood_rating"),
  energyLevel: text("energy_level"),
  appetiteLevel: text("appetite_level"),
  sleepQuality: text("sleep_quality"),
  notes: text("notes"),
  // Exercise Specifics
  workoutType: text("workout_type"),
  workoutIntensity: integer("workout_intensity"),
  workoutMotivation: integer("workout_motivation"),
  benchPress: text("bench_press"),
  squat: text("squat"),
  deadlift: text("deadlift"),
  runDistance: text("run_distance"),
  runTime: text("run_time"),
  injuries: text("injuries"),
  category: text("category").default("general"), // diabetes, hypertension, kidney, cancer, exercise
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const supplementLog = pgTable("supplement_log", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  logDate: timestamp("log_date").defaultNow().notNull(),
  supplements: text("supplements").notNull(), // JSON string of supplements taken
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waterLog = pgTable("water_log", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(), // ml
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const mealLog = pgTable("meal_log", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  calories: integer("calories"),
  protein: integer("protein"),
  carbs: integer("carbs"),
  fats: integer("fats"),
  imageId: text("image_id")
    .references(() => file.id, { onDelete: "set null" }),
  image: text("image"), // Keeping for backward compatibility or direct URL
  type: text("type"), // breakfast, lunch, dinner, snack
  accuracyConfirmed: boolean("accuracy_confirmed").default(false),
  contents: jsonb("contents").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const workoutLog = pgTable("workout_log", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // running, walking, gym, etc.
  duration: integer("duration").notNull(), // minutes
  calories: integer("calories"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const file = pgTable("file", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  remoteId: text("remote_id").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
  type: text("type"),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Education
export const educationItem = pgTable("education_item", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  title: text("title").notNull(),
  category: text("category").notNull(),
  duration: text("duration"),
  image: text("image_id")
    .references(() => file.id, { onDelete: "set null" }),
  premium: boolean("premium").default(false),
  content: text("content"),
  videoUrl: text("video_url"),
  type: text("type").default('article'), // article, course
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const educationItemRelations = relations(educationItem, ({ one }) => ({
  banner: one(file, {
    fields: [educationItem.image],
    references: [file.id],
  }),
}));

// Community
export const communityCycle = pgTable("community_cycle", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "set null" }), // Creator tracking
  members: integer("members").default(0),
  activity: text("activity").default('Moderate'),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPost = pgTable("community_post", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  cycleId: text("cycle_id")
    .notNull()
    .references(() => communityCycle.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityMembership = pgTable("community_membership", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  cycleId: text("cycle_id")
    .notNull()
    .references(() => communityCycle.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const communityPostLike = pgTable("community_post_like", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => communityPost.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPostComment = pgTable("community_post_comment", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  postId: text("post_id")
    .notNull()
    .references(() => communityPost.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityPostRelations = relations(communityPost, ({ one, many }) => ({
  author: one(user, {
    fields: [communityPost.userId],
    references: [user.id]
  }),
  cycle: one(communityCycle, {
    fields: [communityPost.cycleId],
    references: [communityCycle.id]
  }),
  likes: many(communityPostLike),
  comments: many(communityPostComment)
}));

export const communityPostLikeRelations = relations(communityPostLike, ({ one }) => ({
  post: one(communityPost, {
    fields: [communityPostLike.postId],
    references: [communityPost.id]
  }),
  user: one(user, {
    fields: [communityPostLike.userId],
    references: [user.id]
  })
}));

export const communityPostCommentRelations = relations(communityPostComment, ({ one }) => ({
  post: one(communityPost, {
    fields: [communityPostComment.postId],
    references: [communityPost.id]
  }),
  user: one(user, {
    fields: [communityPostComment.userId],
    references: [user.id]
  })
}));

export const communityCycleRelations = relations(communityCycle, ({ many }) => ({
  posts: many(communityPost),
  memberships: many(communityMembership)
}));

export const communityMembershipRelations = relations(communityMembership, ({ one }) => ({
  user: one(user, {
    fields: [communityMembership.userId],
    references: [user.id]
  }),
  cycle: one(communityCycle, {
    fields: [communityMembership.cycleId],
    references: [communityCycle.id]
  })
}));

// Marketplace
export const marketplaceProduct = pgTable("marketplace_product", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  image: text("image"),
  price: integer("price").notNull(), // in kobo
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceWaitlist = pgTable("marketplace_waitlist", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const doctorAvailabilityRelations = relations(doctorAvailability, ({ one }) => ({
  doctor: one(doctor, {
    fields: [doctorAvailability.doctorId],
    references: [doctor.id]
  })
}));

export const doctorRelations = relations(doctor, ({ many }) => ({
  consultations: many(consultation),
  availability: many(doctorAvailability)
}));

export const consultationRelations = relations(consultation, ({ one }) => ({
  user: one(user, {
    fields: [consultation.userId],
    references: [user.id]
  }),
  doctor: one(doctor, {
    fields: [consultation.doctorId],
    references: [doctor.id]
  })
}));

export const labTestOrderRelations = relations(labTestOrder, ({ one }) => ({
  result: one(labResult, {
    fields: [labTestOrder.id],
    references: [labResult.orderId],
  }),
}));

export const labResultRelations = relations(labResult, ({ one }) => ({
  order: one(labTestOrder, {
    fields: [labResult.orderId],
    references: [labTestOrder.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  activityLog,
  activityLogRelations,
  patient,
  doctor,
  doctorRelations,
  doctorAvailability,
  consultation,
  consultationRelations,
  labTest,
  labTestOrder,
  labResult,
  prescription,
  pharmacyOrder,
  insurancePolicy,
  healthTracking,
  educationItem,
  educationItemRelations,
  file,
  communityCycle,
  communityPost,
  communityMembership,
  communityPostLike,
  communityPostComment,
  communityPostRelations,
  communityPostLikeRelations,
  communityPostCommentRelations,
  communityCycleRelations,
  communityMembershipRelations,
  marketplaceProduct,
  marketplaceWaitlist,
  waterLog,
  mealLog,
  workoutLog,
  supplementLog,
};

export const mealLogRelations = relations(mealLog, ({ one }) => ({
  user: one(user, {
    fields: [mealLog.userId],
    references: [user.id],
  }),
  image: one(file, {
    fields: [mealLog.imageId],
    references: [file.id],
  }),
}));
