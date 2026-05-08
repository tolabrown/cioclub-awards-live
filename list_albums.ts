import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './src/lib/db/schema';

const DATABASE_URL = "postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio";

async function listAlbums() {
  const client = postgres(DATABASE_URL, { timeout: 5000 });
  const db = drizzle(client, { schema });

  console.log("Connecting...");
  try {
    const albums = await db.query.album.findMany();
    console.log("ALBUMS_START");
    console.log(JSON.stringify(albums));
    console.log("ALBUMS_END");
  } catch (e) {
    console.error("Query failed:", e);
  } finally {
    await client.end();
  }
}

listAlbums().then(() => {
  console.log("Done");
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

// Force exit after 10s
setTimeout(() => {
  console.log("Timeout forced exit");
  process.exit(0);
}, 10000);
