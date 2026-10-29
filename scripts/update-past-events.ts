import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio';
const sql = postgres(DATABASE_URL);

async function main() {
  console.log('🔄 Updating past events status in database...');
  
  const now = new Date(); // Current date: 2026-10-29
  
  const result = await sql`
    UPDATE event 
    SET status = 'completed', updated_at = NOW()
    WHERE date < ${now} AND status = 'upcoming'
    RETURNING id, title, date, status;
  `;
  
  console.log(`✅ Successfully updated ${result.length} event(s):`);
  for (const r of result) {
    console.log(` - ${r.title} (${new Date(r.date).toDateString()}) -> status set to '${r.status}'`);
  }
  
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Update failed:', err);
  process.exit(1);
});
