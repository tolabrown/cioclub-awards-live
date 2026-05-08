CREATE TABLE "teacher" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"gender" text,
	"birth_day" text,
	"image" text,
	"teacher_type" text,
	"location" text,
	"capacity" text,
	"assigned_class" text,
	"note" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teacher" ADD CONSTRAINT "teacher_image_file_id_fk" FOREIGN KEY ("image") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;