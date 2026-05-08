console.log('--- START 2024 WINNERS SEED SCRIPT ---');
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

// Parsed from image filenames using naming convention:
// category_medalType_firstname_lastname.webp
// Some entries don't follow the medal convention (no gold/silver/bronze after category)
const winners = [
  { name: "Nsimire Aston", awardType: "Agriculture - Bronze" },
  { name: "Irankunda Faustin", awardType: "Agriculture - Gold" },
  { name: "Adeola Balogun", awardType: "Agriculture - Silver" },
  { name: "Ojo Oyedeji", awardType: "Aviation - Bronze" },
  { name: "Gbolahan Salami", awardType: "Aviation - Gold" },
  { name: "Eric Lewis", awardType: "Aviation - Silver" },
  { name: "Myke Koledoye", awardType: "Banking - Bronze" },
  { name: "Zechariah Oluleke Akinpelu", awardType: "Banking - Gold" },
  { name: "Dr Nnaji Harrison", awardType: "Banking - Silver" },
  { name: "Ruby Igwe", awardType: "Education - Bronze" },
  { name: "Tajudeen Odufeso", awardType: "Education - Gold" },
  { name: "Olugboji Akindele", awardType: "Education - Silver" },
  { name: "Adedotun Adeleke", awardType: "Fintech - Gold" },
  { name: "Oluwatobi Adeogun", awardType: "Fintech - Silver" },
  { name: "Lateefat Yasir", awardType: "FMCG - Bronze" },
  { name: "Albert Anietie", awardType: "FMCG - Gold" },
  { name: "David Onabajo", awardType: "FMCG - Silver" },
  { name: "Nicholas Bortey", awardType: "Ghana - Gold" },
  { name: "Abel Daitey", awardType: "Ghana - Silver" },
  { name: "Ojogun Victor Danboyi", awardType: "Media - Bronze" },
  { name: "Adeyemi Olalekan", awardType: "Media - Gold" },
  { name: "Aderemi Ogunpitan", awardType: "Media - Silver" },
  { name: "Mobolaji Odumosu", awardType: "Other Financial Institutions - Bronze" },
  { name: "Dr Nelson Madu", awardType: "Other Financial Institutions - Gold" },
  { name: "Olufemi Yoloye", awardType: "Other Financial Institutions - Silver" },
  { name: "Harmanpreet Dhillon", awardType: "Overall Tech Champion of the Year" },
  { name: "Badara Diouf", awardType: "Senegal - Gold" },
  { name: "Yusuf Afinni", awardType: "Senegal - Silver" },
  { name: "Maurice Juma", awardType: "Technology & Telecomms Kenya - Silver" },
  { name: "Hossam Makky", awardType: "Technology & Telecommunications Egypt - Bronze" },
  { name: "Mohamed Besheer", awardType: "Technology & Telecommunications Egypt - Gold" },
  { name: "Mohamed Talaat", awardType: "Technology & Telecommunications Egypt - Silver" },
  { name: "Dominic Ogar", awardType: "Technology Services - Gold" },
  { name: "Elvis Chukwu", awardType: "Technology Services - Silver" },
  { name: "Shoyinka Shodunke", awardType: "Telecommunications - Bronze" },
  { name: "Harmanpreet Dhillon", awardType: "Telecommunications - Gold" },
  { name: "Kemi Ariyo", awardType: "Telecommunications - Silver" },
  { name: "Joseph Olatunde", awardType: "Universal Energy - Gold" },
  { name: "Joseph Nkrumah", awardType: "Universal Energy - Silver" },
  { name: "Dr Mories Atoki", awardType: "Universal Health - Bronze" },
  { name: "Charles Chibuisi Chiemere", awardType: "Universal Health - Silver" },
  { name: "Rachael Ongalo", awardType: "Universal Health - Gold" },
  { name: "Ons Najjar Mansour", awardType: "Universal Other African Countries - Gold" },
  { name: "Kevin Masaba", awardType: "Universal Other African Countries - Silver" },
  { name: "Chukwunweike Onyepunuka", awardType: "Universal Public Social Services & Agencies - Bronze" },
  { name: "Dimaktso Masiteng", awardType: "Universal Public Social Services & Agencies - Gold" },
  { name: "Tobe Nnadozie", awardType: "Universal Public Social Services & Agencies - Silver" },
];

async function seed() {
  console.log(`🌱 Seeding ${winners.length} award winners for 2024...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < winners.length; i++) {
    const w = winners[i];
    try {
      await sql`
        INSERT INTO award_winner (id, name, award_type, year, display_order, created_at, updated_at)
        VALUES (
          ${randomUUID()},
          ${w.name},
          ${w.awardType},
          ${'2024'},
          ${i + 1},
          NOW(),
          NOW()
        )
      `;
      console.log(`✅ [${i + 1}/${winners.length}] ${w.name} — ${w.awardType}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed: ${w.name} — ${w.awardType}`, err);
      failCount++;
    }
  }

  console.log(`\n🏁 Seeding complete! ✅ ${successCount} succeeded, ❌ ${failCount} failed.`);
  process.exit(0);
}

seed();
