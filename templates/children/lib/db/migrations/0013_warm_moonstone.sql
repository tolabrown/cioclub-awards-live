CREATE TABLE "meeting" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"date" timestamp NOT NULL,
	"time" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_image_file_id_fk" FOREIGN KEY ("image") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;