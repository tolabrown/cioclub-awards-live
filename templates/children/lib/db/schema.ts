import { pgTable, text, timestamp, boolean, integer, doublePrecision } from "drizzle-orm/pg-core";
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

export const child = pgTable("child", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  dateOfBirth: timestamp("date_of_birth"),
  gender: text("gender"),
  allergies: text("allergies"),
  emergencyContact: text("emergency_contact"),
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  image: text("image").references(() => file.id), // Avatar/thumbnail image
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const parent = pgTable("parent", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  parentType: text("parent_type").notNull(), // father, mother, guardian
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const parentChild = pgTable("parent_child", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  parentId: text("parent_id")
    .notNull()
    .references(() => parent.id, { onDelete: "cascade" }),
  childId: text("child_id")
    .notNull()
    .references(() => child.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").default(false).notNull(), // Primary contact parent
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const childFile = pgTable("child_file", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  childId: text("child_id")
    .references(() => child.id)
    .notNull(),
  fileId: text("file_id")
    .references(() => file.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const teacher = pgTable("teacher", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  userId: text("user_id").references(() => user.id),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  gender: text("gender"),
  birthDay: text("birth_day"), // DD-MM
  image: text("image").references(() => file.id),
  teacherType: text("teacher_type"), // Full Time, Volunteer, Utility
  location: text("location"), // Apostolic Center, etc.
  capacity: text("capacity"), // JSON string of age groups
  assignedClass: text("assigned_class"), // Primary class assignment
  note: text("note"), // HOD, etc.
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const teacherFile = pgTable("teacher_file", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  teacherId: text("teacher_id")
    .references(() => teacher.id)
    .notNull(),
  fileId: text("file_id")
    .references(() => file.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const score = pgTable("score", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  child: text("child")
    .references(() => child.id, { onDelete: "cascade" })
    .notNull(),
  scoreType: text("score_type").notNull(), // bible_writing, bible_study_test, entrepreneurial_class
  points: integer("points").notNull(),
  ageAtSubmission: doublePrecision("age_at_submission").notNull(),
  normalizedScore: doublePrecision("normalized_score").notNull(), // points / age
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const scoreRelations = relations(score, ({ one }) => ({
  child: one(child, {
    fields: [score.child],
    references: [child.id],
  }),
}));

export const childRelations = relations(child, ({ one, many }) => ({
  scores: many(score),
  image: one(file, {
    fields: [child.image],
    references: [file.id],
  }),
}));

export const meeting = pgTable("meeting", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  type: text("type").notNull(),
  datetime: timestamp("datetime").notNull(),
  image: text("image").references(() => file.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const memory = pgTable("memory", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  name: text("name").notNull(),
  date: timestamp("date").notNull(),
  location: text("location"),
  description: text("description"),
  coverImage: text("cover_image").references(() => file.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const memoryFile = pgTable("memory_file", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  memoryId: text("memory_id")
    .references(() => memory.id, { onDelete: "cascade" })
    .notNull(),
  fileId: text("file_id")
    .references(() => file.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});


export const meetingRelations = relations(meeting, ({ one }) => ({
  image: one(file, {
    fields: [meeting.image],
    references: [file.id],
  }),
}));

export const attendee = pgTable("attendee", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  meeting: text("meeting")
    .references(() => meeting.id, { onDelete: "cascade" })
    .notNull(),
  child: text("child")
    .references(() => child.id, { onDelete: "cascade" })
    .notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const attendeeRelations = relations(attendee, ({ one }) => ({
  meeting: one(meeting, {
    fields: [attendee.meeting],
    references: [meeting.id],
  }),
  child: one(child, {
    fields: [attendee.child],
    references: [child.id],
  }),
}));

export const memoryRelations = relations(memory, ({ one, many }) => ({
  coverImage: one(file, {
    fields: [memory.coverImage],
    references: [file.id],
  }),
  files: many(memoryFile),
}));

export const memoryFileRelations = relations(memoryFile, ({ one }) => ({
  memory: one(memory, {
    fields: [memoryFile.memoryId],
    references: [memory.id],
  }),
  file: one(file, {
    fields: [memoryFile.fileId],
    references: [file.id],
  }),
}));


export const activityLog = pgTable("activity_log", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  user: text("user").references(() => user.id), // Nullable for system actions
  action: text("action").notNull(), // CREATE, UPDATE, DELETE
  entity: text("entity").notNull(), // Child, Meeting, Attendee, etc.
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

export const schema = {
  user,
  session,
  account,
  verification,
  file,
  child,
  parent,
  parentChild,
  childFile,
  teacher,
  teacherFile,
  score,
  meeting,
  attendee,
  activityLog,
  memory,
  memoryFile,
  scoreRelations,
  childRelations,
  meetingRelations,
  attendeeRelations,
  activityLogRelations,
  memoryRelations,
  memoryFileRelations,
};
