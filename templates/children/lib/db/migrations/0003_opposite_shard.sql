CREATE TABLE "child" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"age" integer,
	"date_of_birth" timestamp,
	"gender" text,
	"parent_name" text NOT NULL,
	"parent_phone" text NOT NULL,
	"parent_email" text,
	"age_group" text,
	"medical_info" text,
	"allergies" text,
	"emergency_contact" text,
	"notes" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
