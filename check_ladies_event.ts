import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { event, file } from './src/lib/db/schema';
import { eq, ilike } from 'drizzle-orm';

const connectionString = 'postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio';
const client = postgres(connectionString);
const db = drizzle(client);

async function main() {
  const ladiesEvent = await db.select().from(event).where(ilike(event.title, '%Ladies in Tech%'));
  console.log(JSON.stringify(ladiesEvent, null, 2));

  // let's fetch media if imageId or coverImageId exists
  if (ladiesEvent.length > 0) {
    const ev = ladiesEvent[0];
    if (ev.imageId) {
      const img = await db.select().from(file).where(eq(file.id, ev.imageId));
      console.log('Image:', img);
    }
    if (ev.coverImageId) {
      const cover = await db.select().from(file).where(eq(file.id, ev.coverImageId));
      console.log('Cover Image:', cover);
    }
  }

  process.exit(0);
}

main();
