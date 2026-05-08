import postgres from 'postgres';
const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";
const sql = postgres(DATABASE_URL);
async function run() {
  try {
    console.log("ALtering award_winner...");
    await sql`ALTER TABLE award_winner ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`;
    console.log("Successfully added display_order to award_winner");
    
    console.log("ALtering awards_team...");
    await sql`ALTER TABLE awards_team ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`;
    console.log("Successfully added display_order to awards_team");

    console.log("ALtering awards_jury...");
    await sql`ALTER TABLE awards_jury ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`;
    console.log("Successfully added display_order to awards_jury");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}
run();
