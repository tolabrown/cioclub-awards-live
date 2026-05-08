const postgres = require('postgres');
const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";

const sql = postgres(DATABASE_URL, {
  ssl: false,
  connect_timeout: 10
});

async function run() {
  try {
    console.log("Checking award_winner...");
    await sql`ALTER TABLE award_winner ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`;
    console.log("award_winner updated.");

    console.log("Checking awards_team...");
    await sql`ALTER TABLE awards_team ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`;
    console.log("awards_team updated.");

    console.log("Checking awards_jury...");
    await sql`ALTER TABLE awards_jury ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0`;
    console.log("awards_jury updated.");

    console.log("SCHEMA FIX SUCCESSFUL");
  } catch (err) {
    console.error("SCHEMA FIX FAILED:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
