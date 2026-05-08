-- This migration converts integer IDs to text IDs
-- Note: This will fail if you have existing data. You need to drop and recreate tables.

-- Drop foreign key constraints first
ALTER TABLE "parent_child" DROP CONSTRAINT IF EXISTS "parent_child_parent_id_parent_id_fk";
ALTER TABLE "parent_child" DROP CONSTRAINT IF EXISTS "parent_child_child_id_child_id_fk";

-- Convert child table
ALTER TABLE "child" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "child" ALTER COLUMN "id" SET DATA TYPE text USING id::text;

-- Convert parent table  
ALTER TABLE "parent" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "parent" ALTER COLUMN "id" SET DATA TYPE text USING id::text;

-- Convert parent_child table
ALTER TABLE "parent_child" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "parent_child" ALTER COLUMN "id" SET DATA TYPE text USING id::text;
ALTER TABLE "parent_child" ALTER COLUMN "parent_id" SET DATA TYPE text USING parent_id::text;
ALTER TABLE "parent_child" ALTER COLUMN "child_id" SET DATA TYPE text USING child_id::text;

-- Recreate foreign key constraints
ALTER TABLE "parent_child" ADD CONSTRAINT "parent_child_parent_id_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "parent"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "parent_child" ADD CONSTRAINT "parent_child_child_id_child_id_fk" FOREIGN KEY ("child_id") REFERENCES "child"("id") ON DELETE cascade ON UPDATE no action;
