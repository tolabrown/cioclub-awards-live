import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL);

async function fix() {
  console.log('Starting DB fix...');
  try {
    // Check if organization_id exists in user table
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'user' AND column_name = 'organization_id'
    `;

    if (columns.length === 0) {
      console.log('Adding organization_id to user table...');
      await sql`ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "organization_id" text`;
      console.log('Added organization_id to user table.');
    } else {
      console.log('organization_id already exists in user table.');
    }

    // Ensure organization table exists
    console.log('Ensuring organization table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS "organization" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "admin_id" text NOT NULL,
        "subscription_ends_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log('Organization table ensured.');

    // Ensure organization_member table exists
    console.log('Ensuring organization_member table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS "organization_member" (
        "id" text PRIMARY KEY NOT NULL,
        "organization_id" text NOT NULL,
        "user_id" text,
        "email" text NOT NULL,
        "role" text DEFAULT 'member' NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log('Organization member table ensured.');

    console.log('DB fix completed successfully.');
  } catch (err) {
    console.error('Error fixing DB:', err);
  } finally {
    await sql.end();
  }
}

fix();
