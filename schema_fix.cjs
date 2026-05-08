const postgres = require('postgres');
const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";

const sql = postgres(DATABASE_URL);

async function run() {
  try {
    console.log("Checking columns for award_winner...");
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'award_winner'
    `;
    console.log("Columns found:", columns.map(c => c.column_name).join(', '));

    const hasDisplayOrder = columns.some(c => c.column_name === 'display_order');
    if (!hasDisplayOrder) {
      console.log("Adding display_order to award_winner...");
      await sql`ALTER TABLE award_winner ADD COLUMN display_order INTEGER DEFAULT 0`;
      console.log("Added column display_order to award_winner");
    } else {
      console.log("display_order already exists in award_winner");
    }

    // Check others too since we are at it
    const teamCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'awards_team'`;
    if (!teamCols.some(c => c.column_name === 'display_order')) {
        console.log("Adding display_order to awards_team...");
        await sql`ALTER TABLE awards_team ADD COLUMN display_order INTEGER DEFAULT 0`;
    }

    const juryCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'awards_jury'`;
    if (!juryCols.some(c => c.column_name === 'display_order')) {
        console.log("Adding display_order to awards_jury...");
        await sql`ALTER TABLE awards_jury ADD COLUMN display_order INTEGER DEFAULT 0`;
    }

    console.log("DONE");
  } catch (err) {
    console.error("ERROR:", err.message);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
