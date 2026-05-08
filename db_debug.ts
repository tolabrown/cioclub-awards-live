import postgres from 'postgres';

const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";

async function run() {
  const sql = postgres(DATABASE_URL);
  try {
    console.log("ALBUMS_LIST:");
    const albums = await sql`SELECT id, title, year FROM album`;
    console.log(JSON.stringify(albums, null, 2));

    console.log("AWARDS_CONTENT:");
    const content = await sql`SELECT data FROM page_content WHERE path = '/awards'`;
    console.log(JSON.stringify(content, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
  process.exit(0);
}

run();
