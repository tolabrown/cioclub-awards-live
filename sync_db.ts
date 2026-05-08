import 'dotenv/config';
import postgres from 'postgres';

async function main() {
    const client = postgres(process.env.DATABASE_URL!);
    
    try {
        console.log("Checking for organization_id column in user table...");
        const columns = await client`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'user' AND column_name = 'organization_id'
        `;

        if (columns.length === 0) {
            console.log("Column 'organization_id' is missing. Adding it...");
            await client`ALTER TABLE "user" ADD COLUMN "organization_id" text`;
            console.log("Column 'organization_id' added successfully.");
        } else {
            console.log("Column 'organization_id' already exists.");
        }

        console.log("Checking for organization table...");
        const orgTable = await client`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'organization'
        `;

        if (orgTable.length === 0) {
            console.log("Table 'organization' is missing. Creating it...");
            await client`
                CREATE TABLE "organization" (
                    "id" text PRIMARY KEY NOT NULL,
                    "name" text NOT NULL,
                    "admin_id" text NOT NULL,
                    "subscription_ends_at" timestamp,
                    "created_at" timestamp DEFAULT now() NOT NULL,
                    "updated_at" timestamp DEFAULT now() NOT NULL
                )
            `;
            console.log("Table 'organization' created successfully.");
        } else {
            console.log("Table 'organization' already exists.");
        }

        console.log("Checking for organization_member table...");
        const memberTable = await client`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = 'organization_member'
        `;

        if (memberTable.length === 0) {
            console.log("Table 'organization_member' is missing. Creating it...");
            await client`
                CREATE TABLE "organization_member" (
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
            console.log("Table 'organization_member' created successfully.");
        } else {
            console.log("Table 'organization_member' already exists.");
        }

        console.log("Database sync completed.");
    } catch (error) {
        console.error("Error syncing database:", error);
    } finally {
        await client.end();
    }
}

main();
