import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio';
const sql = postgres(DATABASE_URL);

async function main() {
  const f = await sql`SELECT * FROM file WHERE id = '1c6411e5-71ea-4b37-b887-db9e12763257'`;
  console.log('SPECIFIC FILE:', f);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
