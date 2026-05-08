CREATE TABLE "exercise" (
	"id" text PRIMARY KEY NOT NULL,
	"child" text NOT NULL,
	"exercise_type" text NOT NULL,
	"points" integer NOT NULL,
	"age_at_submission" integer NOT NULL,
	"normalized_score" integer NOT NULL,
	"submission_date" timestamp DEFAULT now() NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercise" ADD CONSTRAINT "exercise_child_child_id_fk" FOREIGN KEY ("child") REFERENCES "public"."child"("id") ON DELETE cascade ON UPDATE no action;