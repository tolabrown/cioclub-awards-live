CREATE TABLE "attendee" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting" text NOT NULL,
	"child" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_meeting_meeting_id_fk" FOREIGN KEY ("meeting") REFERENCES "public"."meeting"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendee" ADD CONSTRAINT "attendee_child_child_id_fk" FOREIGN KEY ("child") REFERENCES "public"."child"("id") ON DELETE cascade ON UPDATE no action;