import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env");
  process.exit(1);
}

async function fix() {
  const client = postgres(DATABASE_URL!);
  const db = drizzle(client, { schema });
  
  const email = "taifakus@gmail.com";
  const newDate = new Date("2027-03-02T00:00:00Z");

  console.log(`Updating ${email} to expire on ${newDate}...`);

  const result = await db.update(schema.user)
    .set({ subscriptionEndsAt: newDate })
    .where(eq(schema.user.email, email));

  console.log("Done!", result);
  process.exit(0);
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
