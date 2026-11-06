/**
 * SCRIPT: Add 4 new jury members and fix all image URLs
 * 
 * This script:
 * 1. Fixes all existing jury image URLs to use direct format
 * 2. Uploads 4 new jury member images and creates DB records
 * 
 * Run from project root:
 *   npx tsx scripts/add-new-jury-members.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { Client } from 'minio';
import postgres from 'postgres';
import { config } from 'dotenv';

config();

// ── DB setup (raw SQL) ────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL!;
const sql = postgres(DATABASE_URL, { max: 5 });

// ── MinIO setup ───────────────────────────────────────────────────────────────
const ENDPOINT = process.env.MINIO_ENDPOINT!;
const BUCKET = process.env.MINIO_BUCKET!;
const USE_SSL = process.env.MINIO_USE_SSL === 'true';
const PORT = process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : (USE_SSL ? 443 : 9000);

const minio = new Client({
  endPoint: ENDPOINT,
  port: PORT,
  useSSL: USE_SSL,
  accessKey: process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_ROOT_PASSWORD!,
});

const YEAR = '2026';

function getDirectUrl(objectName: string): string {
  return `https://${ENDPOINT}/${BUCKET}/${objectName}`;
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return mimes[ext] || 'image/jpeg';
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
}

// ── STEP 1: Fix all existing jury image URLs ──────────────────────────────────
console.log('\n🔧 STEP 1: Fixing existing jury image URLs');
console.log('='.repeat(50));

const juryWithFiles = await sql`
  SELECT j.id as jury_id, j.name, f.id as file_id, f.remote_id, f.url, f.direct_url
  FROM awards_jury j
  JOIN file f ON j.image_id = f.id
`;

console.log(`Found ${juryWithFiles.length} jury members with images`);

let fixCount = 0;
for (const member of juryWithFiles) {
  const correctUrl = getDirectUrl(member.remote_id);
  
  if (member.url === correctUrl && member.direct_url === correctUrl) {
    console.log(`  ✓ Already correct: ${member.name}`);
    continue;
  }
  
  await sql`
    UPDATE file 
    SET url = ${correctUrl}, direct_url = ${correctUrl}
    WHERE id = ${member.file_id}
  `;
  
  console.log(`  ✅ Fixed URL for: ${member.name}`);
  console.log(`     ${correctUrl}`);
  fixCount++;
}

console.log(`\n  Fixed ${fixCount} of ${juryWithFiles.length} records.\n`);

// ── STEP 2: Add 4 new jury members ───────────────────────────────────────────
console.log('\n👥 STEP 2: Adding 4 new jury members for 2026');
console.log('='.repeat(50));

const newMembers = [
  {
    localPath: 'C:\\Users\\TOLAN\\Downloads\\jury\\Celestina Appeal,Head, Card Business and Solutions Zenith Bank Plc  jpeg (1).jpg.jpeg',
    name: 'Celestina Appeal',
    role: 'Juror',
    occupation: 'Head, Card Business and Solutions, Zenith Bank Plc',
    displayOrder: 6,
  },
  {
    localPath: 'C:\\Users\\TOLAN\\Downloads\\jury\\Dr. Olusola Teniola, Director, Strategic Business Initiatives, IPNX.png',
    name: 'Dr. Olusola Teniola',
    role: 'Juror',
    occupation: 'Director, Strategic Business Initiatives, IPNX',
    displayOrder: 7,
  },
  {
    localPath: 'C:\\Users\\TOLAN\\Downloads\\jury\\Onyinye-Ikenna-Emeka,Chief Marketing Officer, MTN Nigeria .jpg (1).jpeg',
    name: 'Onyinye Ikenna-Emeka',
    role: 'Juror',
    occupation: 'Chief Marketing Officer, MTN Nigeria',
    displayOrder: 8,
  },
  {
    localPath: 'C:\\Users\\TOLAN\\Downloads\\jury\\Oyedayo Otokiti, Director IT & Operations, Lagos Business School, Pan-Atlantic University.jpg.jpeg',
    name: 'Oyedayo Otokiti',
    role: 'Juror',
    occupation: 'Director IT & Operations, Lagos Business School, Pan-Atlantic University',
    displayOrder: 9,
  },
];

for (const member of newMembers) {
  console.log(`\n🔄 Processing: ${member.name}`);
  
  if (!fs.existsSync(member.localPath)) {
    console.error(`  ❌ File not found: ${member.localPath}`);
    continue;
  }
  
  try {
    const stats = fs.statSync(member.localPath);
    const filename = path.basename(member.localPath);
    const mime = getMimeType(filename);
    const timestamp = Date.now();
    // Get the last/true extension (handle double extensions like .jpg.jpeg)
    const ext = filename.match(/\.(png|jpg|jpeg|webp|gif)$/i)?.[1]?.toLowerCase() || 'jpeg';
    const objectName = `${timestamp}-${slugify(member.name)}.${ext}`;
    
    console.log(`  📤 Uploading to MinIO: ${objectName}`);
    await minio.fPutObject(BUCKET, objectName, member.localPath, {
      'Content-Type': mime,
    });
    
    const directUrl = getDirectUrl(objectName);
    const fileId = crypto.randomUUID();
    
    // Save file record
    await sql`
      INSERT INTO file (id, remote_id, url, direct_url, size, type, name)
      VALUES (${fileId}, ${objectName}, ${directUrl}, ${directUrl}, ${stats.size}, ${mime}, ${filename})
    `;
    
    console.log(`  ✅ File saved: ${fileId}`);
    
    // Check if member already exists (avoid duplicates)
    const existing = await sql`
      SELECT id FROM awards_jury WHERE name = ${member.name} LIMIT 1
    `;
    
    if (existing.length > 0) {
      await sql`
        UPDATE awards_jury 
        SET image_id = ${fileId}, role = ${member.role}, occupation = ${member.occupation}, 
            display_order = ${member.displayOrder}, year = ${YEAR}
        WHERE id = ${existing[0].id}
      `;
      console.log(`  ♻️  Updated existing member: ${member.name} (order: ${member.displayOrder})`);
    } else {
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO awards_jury (id, name, role, occupation, image_id, year, display_order)
        VALUES (${newId}, ${member.name}, ${member.role}, ${member.occupation}, ${fileId}, ${YEAR}, ${member.displayOrder})
      `;
      console.log(`  ⭐ Created NEW member: ${member.name} (order: ${member.displayOrder})`);
    }
    
    console.log(`  🖼️  Image URL: ${directUrl}`);
  } catch (err) {
    console.error(`  ❌ Failed to process ${member.name}:`, err);
  }
}

console.log('\n\n✅ Done! All operations complete.');
console.log('='.repeat(50));
console.log('\nNext steps:');
console.log('  1. Refresh /awards/jury to see updated photos');
console.log('  2. All existing jury images now use direct URLs\n');

await sql.end();
process.exit(0);
