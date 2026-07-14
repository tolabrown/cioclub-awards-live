import postgres from 'postgres';
import dotenv from 'dotenv';
dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  const files = await sql`SELECT * FROM file WHERE url ILIKE '%ladies%'`;
  console.log(JSON.stringify(files, null, 2));
  process.exit(0);
}

main().catch(console.error);
