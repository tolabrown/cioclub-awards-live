import fs from 'fs';
import postgres from 'postgres';
import 'dotenv/config';

async function run() {
  const sqlString = fs.readFileSync('drizzle/0000_living_junta.sql', 'utf8');
  const sql = postgres(process.env.DATABASE_URL);
  try {
    console.log("Running migration manually...");
    await sql.unsafe(sqlString);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await sql.end();
  }
}
run();
