import postgres from 'postgres';

const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";

async function run() {
  const sql = postgres(DATABASE_URL);
  try {
    console.log("Checking columns for award_winner:");
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'award_winner'
    `;
    console.log(JSON.stringify(columns, null, 2));

    const displayOrderExists = columns.some(c => c.column_name === 'display_order');
    console.log("display_order exists in award_winner:", displayOrderExists);
    
    if (!displayOrderExists) {
        console.log("ALTERING TABLE to add display_order...");
        await sql`ALTER TABLE award_winner ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`;
        console.log("Column added successfully.");
    }

  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
  process.exit(0);
}

run();
