CREATE TABLE "child_file" (
	"id" text PRIMARY KEY NOT NULL,
	"child_id" text NOT NULL,
	"file_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "file" (
	"id" text PRIMARY KEY NOT NULL,
	"remote_id" text NOT NULL,
	"url" text NOT NULL,
	"size" integer NOT NULL,
	"type" text,
	"name" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "child_file" ADD CONSTRAINT "child_file_child_id_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."child"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "child_file" ADD CONSTRAINT "child_file_file_id_file_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."file"("id") ON DELETE no action ON UPDATE no action;