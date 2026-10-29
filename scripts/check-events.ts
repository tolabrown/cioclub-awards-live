import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio';
const sql = postgres(DATABASE_URL);

async function main() {
  const events = await sql`SELECT id, title, date, status, location FROM event ORDER BY date ASC`;
  console.log('--- DB EVENTS ---');
  for (const e of events) {
    console.log(`Title: ${e.title}`);
    console.log(`  Date: ${e.date}`);
    console.log(`  Status in DB: ${e.status}`);
    console.log(`  Passed? ${new Date(e.date) < new Date('2026-09-30T10:30:00Z') ? 'YES (PASSED)' : 'NO (UPCOMING)'}`);
    console.log('---');
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
