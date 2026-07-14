
import { db } from './src/lib/db/drizzle';
import { user } from './src/lib/db/schema';

async function test() {
  try {
    console.log("Testing connection via src/lib/db/drizzle...");
    const result = await db.select().from(user).limit(1);
    console.log("Success! Connection established.");
    console.log("Result:", result);
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:");
    console.error(error);
    process.exit(1);
  }
}

test();
