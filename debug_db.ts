
import { db } from './src/lib/db/index.js';
import { pageContent } from './src/lib/db/schema.js';

async function check() {
  try {
    const results = await db.select().from(pageContent);
    console.log("All Paths in pageContent:");
    results.forEach(r => console.log(`- "${r.path}"`));

    const membership = results.find(r => r.path === '/membership' || r.path === 'membership');
    if (membership) {
      console.log("\nMembership Data:");
      console.log(membership.data);
    } else {
      console.log("\nNo membership content found!");
    }
  } catch (e) {
    console.error(e);
  }
}
check();
