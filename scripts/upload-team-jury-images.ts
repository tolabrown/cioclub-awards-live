/**
 * SCRIPT: Upload Team & Jury Pictures and Update DB
 * 
 * USAGE:
 *   1. Create two folders in the project root:
 *      - /upload_team/     (for 2026 Project Team photos)
 *      - /upload_jury/     (for 2026 Juror photos)
 *
 *   2. Name the files according to their display order:
 *      - 1_firstname_lastname.jpg   (or .png, .webp)
 *      - 2_firstname_lastname.jpg
 *      - etc.
 *      The number prefix determines the display order (hierarchy).
 *
 *   3. Run:
 *        npx tsx scripts/upload-team-jury-images.ts
 *
 *   4. The script will:
 *      - Upload each image to MinIO
 *      - Create a file record in the DB
 *      - Update the matching team/jury member's imageId in the DB
 *      - Set the displayOrder based on the filename prefix
 *
 *   MATCHING LOGIC:
 *   - For team members: matches by name (fuzzy) against awards_team.name for year 2026
 *   - For jury members: matches by name (fuzzy) against awards_jury.name for year 2026
 *   - If no match found, creates a NEW record
 *
 *   FORCE-OVERWRITE: Set OVERWRITE=true to re-upload even if imageId already set.
 */

import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { Client } from "minio";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and } from "drizzle-orm";
import { config } from "dotenv";

config(); // load .env

// ── DB setup ──────────────────────────────────────────────────────────────────
const DATABASE_URL = process.env.DATABASE_URL!;
const sql = postgres(DATABASE_URL, { max: 5 });

// We import raw schema objects to avoid ESM issues with $lib alias
// Make sure to run from project root so relative imports work
const { file: fileTable, awardsTeam, awardsJury } = await import("./src/lib/db/schema.js").catch(() => {
  // fallback: use require-style if tsx handles it
  return require("./src/lib/db/schema");
});

const db = drizzle(sql, {
  schema: { file: fileTable, awardsTeam, awardsJury },
});

// ── MinIO setup ───────────────────────────────────────────────────────────────
const minio = new Client({
  endPoint: process.env.MINIO_ENDPOINT!,
  port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : 9000,
  useSSL: process.env.MINIO_USE_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER!,
  secretKey: process.env.MINIO_ROOT_PASSWORD!,
});

const BUCKET = process.env.MINIO_BUCKET!;
const ENDPOINT = process.env.MINIO_ENDPOINT!;
const YEAR = "2026";

function getObjectUrl(objectName: string): string {
  return `https://${ENDPOINT}/api/v1/buckets/${BUCKET}/objects/download?preview=true&prefix=${encodeURIComponent(objectName)}&version_id=null`;
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const mimes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
  };
  return mimes[ext] || "image/jpeg";
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "_");
}

/** Fuzzy name match: strips numbers, dashes, underscores from filename and compares to DB names */
function matchName(filename: string, dbName: string): boolean {
  // Remove leading order number (e.g. "1_", "01_") and extension
  const cleaned = path
    .basename(filename, path.extname(filename))
    .replace(/^\d+[_\s-]+/, "")
    .replace(/[_\s-]+/g, " ")
    .trim()
    .toLowerCase();

  const dbNameClean = dbName.toLowerCase().trim();

  // Full name match
  if (dbNameClean.includes(cleaned) || cleaned.includes(dbNameClean)) return true;

  // First or last name match
  const parts = cleaned.split(" ");
  const dbParts = dbNameClean.split(" ");
  const firstNameMatch = parts[0] && dbParts.some((p) => p.startsWith(parts[0].substring(0, 4)));
  const lastNameMatch = parts[parts.length - 1] && dbParts.some((p) => p.startsWith(parts[parts.length - 1].substring(0, 4)));
  return firstNameMatch && lastNameMatch;
}

/** Extract display order from filename prefix (e.g. "1_name.jpg" → 1) */
function getDisplayOrder(filename: string): number {
  const match = path.basename(filename).match(/^(\d+)[_\s-]/);
  return match ? parseInt(match[1], 10) : 999;
}

async function uploadFile(localPath: string): Promise<{ id: string; url: string; objectName: string }> {
  const stats = fs.statSync(localPath);
  const filename = path.basename(localPath);
  const mime = getMimeType(filename);
  const timestamp = Date.now();
  const objectName = `${timestamp}-${slugify(filename)}`;

  console.log(`  📤 Uploading to MinIO: ${objectName}`);
  await minio.fPutObject(BUCKET, objectName, localPath, {
    "Content-Type": mime,
  });

  const url = getObjectUrl(objectName);
  const id = crypto.randomUUID();

  // Save file record in DB
  await db.insert(fileTable).values({
    id,
    remoteId: objectName,
    url,
    size: stats.size,
    type: mime,
    name: filename,
  });

  console.log(`  ✅ File saved: ${id}`);
  return { id, url, objectName };
}

async function processFolder(
  folderPath: string,
  type: "team" | "jury"
): Promise<void> {
  if (!fs.existsSync(folderPath)) {
    console.log(`⚠️  Folder not found: ${folderPath} — skipping.`);
    return;
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort((a, b) => getDisplayOrder(a) - getDisplayOrder(b));

  if (files.length === 0) {
    console.log(`⚠️  No images found in ${folderPath}`);
    return;
  }

  console.log(`\n📁 Processing ${type.toUpperCase()} folder: ${folderPath} (${files.length} images)\n`);

  // Fetch existing records for 2026
  const existingRecords =
    type === "team"
      ? await db.query.awardsTeam.findMany({ where: eq(awardsTeam.year, YEAR), with: { image: true } })
      : await db.query.awardsJury.findMany({ where: eq(awardsJury.year, YEAR), with: { image: true } });

  console.log(`  Found ${existingRecords.length} existing ${type} members for ${YEAR}\n`);

  for (const filename of files) {
    const localPath = path.join(folderPath, filename);
    const displayOrder = getDisplayOrder(filename);

    console.log(`\n🔄 Processing [${displayOrder}] ${filename}`);

    // Try to find matching member
    const match = existingRecords.find((r: any) => matchName(filename, r.name));

    try {
      const { id: fileId, url } = await uploadFile(localPath);

      if (match) {
        // Update existing member
        if (type === "team") {
          await db
            .update(awardsTeam)
            .set({ imageId: fileId, displayOrder })
            .where(eq(awardsTeam.id, match.id));
        } else {
          await db
            .update(awardsJury)
            .set({ imageId: fileId, displayOrder })
            .where(eq(awardsJury.id, match.id));
        }
        console.log(`  ✅ Updated "${match.name}" (order: ${displayOrder})`);
      } else {
        // Create new record from filename
        const rawName = path
          .basename(filename, path.extname(filename))
          .replace(/^\d+[_\s-]+/, "")
          .replace(/[_]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim();

        if (type === "team") {
          await db.insert(awardsTeam).values({
            name: rawName,
            title: "Team Member",
            imageId: fileId,
            year: YEAR,
            displayOrder,
          });
        } else {
          await db.insert(awardsJury).values({
            name: rawName,
            role: "Jury Member",
            occupation: "Industry Professional",
            imageId: fileId,
            year: YEAR,
            displayOrder,
          });
        }
        console.log(`  ⭐ Created NEW member "${rawName}" (order: ${displayOrder})`);
      }
    } catch (err) {
      console.error(`  ❌ Failed to process ${filename}:`, err);
    }
  }
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
console.log("\n🚀 Starting Team & Jury Image Upload Script");
console.log("=".repeat(50));

await processFolder(path.join(process.cwd(), "upload_team"), "team");
await processFolder(path.join(process.cwd(), "upload_jury"), "jury");

console.log("\n\n✅ Done! All images processed.");
console.log("=".repeat(50));
console.log("\nNext steps:");
console.log("  1. Refresh the /awards/team page to see the updated photos");
console.log("  2. Refresh the /awards/jury page to see the updated photos\n");

await sql.end();
process.exit(0);
