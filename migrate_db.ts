import postgres from 'postgres';
const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";
const sql = postgres(DATABASE_URL, { 
  idle_timeout: 20,
  connect_timeout: 10
});

async function run() {
  try {
    console.log("Starting schema fix...");
    
    console.log("Checking award_winner table...");
    const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'award_winner'`;
    console.log("Current columns:", cols.map(c => c.column_name).join(', '));

    if (!cols.some(c => c.column_name === 'display_order')) {
      console.log("Adding display_order to award_winner...");
      await sql`ALTER TABLE award_winner ADD COLUMN display_order INTEGER DEFAULT 0`;
      console.log("Added to award_winner");
    }

    console.log("Checking awards_team table...");
    const teamCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'awards_team'`;
    if (!teamCols.some(c => c.column_name === 'display_order')) {
      console.log("Adding display_order to awards_team...");
      await sql`ALTER TABLE awards_team ADD COLUMN display_order INTEGER DEFAULT 0`;
      console.log("Added to awards_team");
    }

    console.log("Checking awards_jury table...");
    const juryCols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'awards_jury'`;
    if (!juryCols.some(c => c.column_name === 'display_order')) {
      console.log("Adding display_order to awards_jury...");
      await sql`ALTER TABLE awards_jury ADD COLUMN display_order INTEGER DEFAULT 0`;
      console.log("Added to awards_jury");
    }

    console.log("Schema fix completed successfully.");
  } catch (err) {
    console.error("FAILED to fix schema:", err);
  } finally {
    await sql.end();
    process.exit(0);
  }
}

run();
