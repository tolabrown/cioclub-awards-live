import postgres from 'postgres';

const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";

async function run() {
  const sql = postgres(DATABASE_URL);
  try {
    console.log("ALBUMS_SEARCH:");
    const albums = await sql`SELECT id, title, year, location FROM album WHERE title ILIKE '%Lagos%' OR location ILIKE '%Lagos%' OR year = '2025' OR title ILIKE '%Awards%'`;
    console.log(JSON.stringify(albums, null, 2));

    if (albums.length === 0) {
      console.log("NO_LITERAL_MATCH, LISTING_ALL:");
      const allAlbums = await sql`SELECT id, title, year FROM album ORDER BY created_at DESC LIMIT 10`;
      console.log(JSON.stringify(allAlbums, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
  process.exit(0);
}

run();
