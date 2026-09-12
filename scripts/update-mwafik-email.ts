/**
 * One-time script: Update mwafik@t-a-telecom.com → mwafik@tatelecom.com
 *
 * Run on the deployment server from the project root:
 *   npx tsx scripts/update-mwafik-email.ts
 */

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, ilike } from 'drizzle-orm';
import { contactInquiry, user } from '../src/lib/db/schema.js';

const OLD_EMAIL = 'mwafik@t-a-telecom.com';
const NEW_EMAIL = 'mwafik@tatelecom.com';

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set. Make sure .env is loaded.');
  }

  const client = postgres(process.env.DATABASE_URL);
  const db = drizzle(client);

  console.log(`\n🔍 Searching for "${OLD_EMAIL}" across all tables...\n`);

  // --- contact_inquiry table ---
  const contactMatches = await db
    .select()
    .from(contactInquiry)
    .where(ilike(contactInquiry.email, '%mwafik%'));

  if (contactMatches.length > 0) {
    console.log(`✅ Found ${contactMatches.length} record(s) in contact_inquiry:`);
    contactMatches.forEach((r) =>
      console.log(`   id=${r.id}  email=${r.email}  name=${r.fullName}`)
    );

    const exactMatches = contactMatches.filter(
      (r) => r.email.toLowerCase() === OLD_EMAIL.toLowerCase()
    );

    if (exactMatches.length > 0) {
      console.log(`\n⚙️  Updating ${exactMatches.length} record(s) in contact_inquiry...`);
      for (const r of exactMatches) {
        await db
          .update(contactInquiry)
          .set({ email: NEW_EMAIL })
          .where(eq(contactInquiry.id, r.id));
        console.log(`   ✔ id=${r.id}  ${OLD_EMAIL} → ${NEW_EMAIL}`);
      }
    } else {
      console.log(
        `ℹ️  No exact match for "${OLD_EMAIL}" in contact_inquiry (only partial matches above).`
      );
    }
  } else {
    console.log(`ℹ️  "${OLD_EMAIL}" not found in contact_inquiry.`);
  }

  // --- user table (in case they registered an account) ---
  const userMatches = await db
    .select()
    .from(user)
    .where(ilike(user.email, '%mwafik%'));

  if (userMatches.length > 0) {
    console.log(`\n✅ Found ${userMatches.length} record(s) in user table:`);
    userMatches.forEach((r) =>
      console.log(`   id=${r.id}  email=${r.email}  name=${r.name}`)
    );

    const exactMatches = userMatches.filter(
      (r) => r.email.toLowerCase() === OLD_EMAIL.toLowerCase()
    );

    if (exactMatches.length > 0) {
      console.log(`\n⚙️  Updating ${exactMatches.length} record(s) in user table...`);
      for (const r of exactMatches) {
        await db
          .update(user)
          .set({ email: NEW_EMAIL })
          .where(eq(user.id, r.id));
        console.log(`   ✔ id=${r.id}  ${OLD_EMAIL} → ${NEW_EMAIL}`);
      }
    } else {
      console.log(`ℹ️  No exact match for "${OLD_EMAIL}" in user table.`);
    }
  } else {
    console.log(`ℹ️  "${OLD_EMAIL}" not found in user table.`);
  }

  console.log('\n✅ Done.\n');
  await client.end();
}

main().catch((e) => {
  console.error('❌ Script failed:', e);
  process.exit(1);
});
