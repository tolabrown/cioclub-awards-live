ALTER TABLE "child" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "parent" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "parent_child" ALTER COLUMN "id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "parent_child" ALTER COLUMN "parent_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "parent_child" ALTER COLUMN "child_id" SET DATA TYPE text;