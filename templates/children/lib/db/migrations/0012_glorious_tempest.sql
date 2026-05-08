ALTER TABLE "exercise" RENAME TO "score";--> statement-breakpoint
ALTER TABLE "score" RENAME COLUMN "exercise_type" TO "score_type";--> statement-breakpoint
ALTER TABLE "score" DROP CONSTRAINT "exercise_child_child_id_fk";
--> statement-breakpoint
ALTER TABLE "score" ADD CONSTRAINT "score_child_child_id_fk" FOREIGN KEY ("child") REFERENCES "public"."child"("id") ON DELETE cascade ON UPDATE no action;