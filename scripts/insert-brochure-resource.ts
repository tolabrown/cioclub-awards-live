import postgres from 'postgres';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://admin:vvxr2q0jISp6vj6JwaMT@164.68.103.133:5094/cio';
const sql = postgres(DATABASE_URL);

async function main() {
  console.log('Inserting brochure into resource table...');

  // Check if already exists
  const existing = await sql`SELECT id FROM resource WHERE title ILIKE '%2026 Conference Brochure%'`;
  if (existing.length > 0) {
    console.log('Brochure resource already exists with id:', existing[0].id);
    process.exit(0);
  }

  const fileId = randomUUID();
  const resourceId = randomUUID();
  const resourceMediaId = randomUUID();

  // 1. Insert file
  await sql`
    INSERT INTO file (id, remote_id, url, direct_url, size, type, name, created_at, updated_at)
    VALUES (
      ${fileId},
      'CIO & C-Suite 2026 Conference Brochure.pdf',
      'https://files.catbox.moe/xj1iro.pdf',
      'https://files.catbox.moe/xj1iro.pdf',
      82260991,
      'application/pdf',
      'CIO & C-Suite 2026 Conference Brochure.pdf',
      NOW(),
      NOW()
    )
  `;
  console.log('✅ File record created:', fileId);

  // 2. Insert resource
  await sql`
    INSERT INTO resource (id, title, description, category, published_date, view_count, created_at)
    VALUES (
      ${resourceId},
      'CIO & C-Suite 2026 Conference Brochure',
      'The official brochure for the 7th edition of the CIO & C-Suite Conference & Awards Africa — featuring the event programme, confirmed speakers, sponsorship tiers, and key information about Africa''s premier technology leadership platform.',
      'Report',
      NOW(),
      0,
      NOW()
    )
  `;
  console.log('✅ Resource record created:', resourceId);

  // 3. Insert resource_media
  await sql`
    INSERT INTO resource_media (id, resource_id, file_id, display_order)
    VALUES (
      ${resourceMediaId},
      ${resourceId},
      ${fileId},
      0
    )
  `;
  console.log('✅ ResourceMedia record created:', resourceMediaId);

  console.log('🎉 Successfully added brochure to Resources database!');
  process.exit(0);
}

main().catch(e => {
  console.error('Error inserting brochure resource:', e);
  process.exit(1);
});
