import postgres from 'postgres';
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

interface WinnerDef {
  name: string;
  awardType: string;
  awardDescription: string;
  organization: string;
  filePath: string;
  displayOrder: number;
}

const corporateDir = 'C:\\Users\\TOLAN\\Downloads\\Winners for corporate special awards';
const individualDir = 'C:\\Users\\TOLAN\\Downloads\\Winners for individual special awards';
const professionalDir = 'C:\\Users\\TOLAN\\Downloads\\winnwers for Professional awards';

const winnersList: WinnerDef[] = [
  // ==================== CORPORATE SPECIAL AWARDS ====================
  {
    name: 'National Identity Management Commission (NIMC)',
    awardType: 'Corporate Award',
    awardDescription: 'Best Innovation in Public Digital Services Award',
    organization: 'National Identity Management Commission (NIMC)',
    filePath: path.join(corporateDir, '(BEST INNOVATION IN PUBLIC DIGITAL SERVICES AWARD)National Identity Management Commission (NIMC).jpeg'),
    displayOrder: 1,
  },
  {
    name: 'Wema Bank (ALAT Xplore)',
    awardType: 'Corporate Award',
    awardDescription: 'Best Youth Digital Banking Innovation Award - ALAT Xplore',
    organization: 'Wema Bank',
    filePath: path.join(corporateDir, '(BEST YOUTH DIGITAL BANKING INNOVATION AWARD - ALAT XPLORE)Wema Bank Logo.jpeg'),
    displayOrder: 2,
  },
  {
    name: 'Digital Encode Limited',
    awardType: 'Corporate Award',
    awardDescription: 'Cybersecurity Excellence Award',
    organization: 'Digital Encode Limited',
    filePath: path.resolve('static/news/digital_encode_limited_logo.png'),
    displayOrder: 3,
  },
  {
    name: 'Nigeria Civil Aviation Authority (NCAA)',
    awardType: 'Corporate Award',
    awardDescription: 'Distinguished Award for Digital Transformation in Aviation',
    organization: 'Nigeria Civil Aviation Authority (NCAA)',
    filePath: path.join(corporateDir, '(DISTINGUISHED AWARD FOR DIGITAL TRANSFORMATION IN AVIATION) Nigeria Civil Aviation Authority (NCAA).jpeg'),
    displayOrder: 4,
  },
  {
    name: 'Lagos State Internal Revenue Service (LIRS)',
    awardType: 'Corporate Award',
    awardDescription: 'Excellence in Revenue Innovation & Digital Transformation Award',
    organization: 'Lagos State Internal Revenue Service (LIRS)',
    filePath: path.join(corporateDir, '(EXCELLENCE IN REVENUE INNOVATION & DIGITAL _TRANSFORMATION AWARD)Lagos State Internal Revenue Service (LIRS) Logo.jpeg'),
    displayOrder: 5,
  },
  {
    name: 'Sabre',
    awardType: 'Corporate Award',
    awardDescription: 'Excellence in Travel Technology & Digital Transformation Award',
    organization: 'Sabre',
    filePath: path.join(corporateDir, '(EXCELLENCE IN TRAVEL TECHNOLOGY  & DIGITAL TRANSFORMATION AWARD) Sabre .png'),
    displayOrder: 6,
  },
  {
    name: 'First City Monument Bank (FCMB)',
    awardType: 'Corporate Award',
    awardDescription: 'Responsible AI & Intelligent Finance Award',
    organization: 'First City Monument Bank (FCMB)',
    filePath: path.join(corporateDir, '(RESPONSIBLE AI & INTELLIGENT FINANCE AWARD)First City Monument Bank(FCMB).jpeg'),
    displayOrder: 7,
  },

  // ==================== INDIVIDUAL SPECIAL AWARDS ====================
  {
    name: 'Prof. Olayinka David-West',
    awardType: 'Special Award',
    awardDescription: 'Best Female Leader in Digital and Technology - Nigeria',
    organization: 'Associate Dean & Professor of Information Systems, Lagos Business School',
    filePath: path.join(individualDir, '(BEST FEMALE LEADER IN DIGITAL AND TECHNOLOGY - NIGERIA) Prof Olayinka David West.jpg.jpeg'),
    displayOrder: 8,
  },
  {
    name: 'Prof. Obadere Peter Adewale',
    awardType: 'Special Award',
    awardDescription: 'Distinguished Digital Trust Leader Award',
    organization: 'Co-founder & Chief Visionary Officer, Digital Encode Limited',
    filePath: path.join(individualDir, '(DISTINGUISHED DIGITAL TRUST LEADER AWARD)Prof. Obadere Peter Adewale.jpeg'),
    displayOrder: 9,
  },
  {
    name: 'Dr. Rasheed Olu-Ajayi',
    awardType: 'Special Award',
    awardDescription: 'Excellence in Digital and Technology Leadership Award',
    organization: 'Digital and Technology Leader',
    filePath: path.join(individualDir, '(EXCELLENCE IN DIGITAL AND TECHNOLOGY LEADERSHIP AWARD​)Dr. Rasheed Olu-Ajayi.jpeg'),
    displayOrder: 10,
  },
  {
    name: 'Taiwo Aluko',
    awardType: 'Special Award',
    awardDescription: 'Excellence in Digital Infrastructure & Transformation',
    organization: 'Digital Infrastructure & Transformation Leader',
    filePath: path.join(individualDir, '(EXCELLENCE IN DIGITAL INFRASTRUCTURE & TRANSFORMATION) Taiwo Aluko.jpeg'),
    displayOrder: 11,
  },
  {
    name: 'Victoria A. Ajayi',
    awardType: 'Special Award',
    awardDescription: 'Excellence in Strategic Media Leadership Award',
    organization: 'Strategic Media Leader',
    filePath: path.join(individualDir, '(EXCELLENCE IN STRATEGIC MEDIA LEADERSHIP AWARD) VICTORIA A. AJAYI.jpeg'),
    displayOrder: 12,
  },
  {
    name: 'Dr. Oyenike Abiodun Adeleke',
    awardType: 'Special Award',
    awardDescription: 'Iconic Ladies in Business and Technology Award',
    organization: 'Business and Technology Leader',
    filePath: path.resolve('static/news/dr_oyenike_abiodun_adeleke.jpg'),
    displayOrder: 13,
  },
  {
    name: 'Dr. Usman Abdullahi',
    awardType: 'Special Award',
    awardDescription: 'Lifetime Achievement Awards - Nigeria',
    organization: 'Director, National Information Technology Development Agency (NITDA)',
    filePath: path.join(individualDir, '(LIFETIME ACHIEVEMENT AWARDS - NIGERIA) Dr. Usman Abdullahi, Director, National Information Technology Development Agency.jpeg'),
    displayOrder: 14,
  },
  {
    name: 'Engr. Dr. Abisoye Coker-Odusote',
    awardType: 'Special Award',
    awardDescription: 'Public Sector Digital Leader of the Year',
    organization: 'Director General / CEO, National Identity Management Commission (NIMC)',
    filePath: path.join(individualDir, '(Public Sector Digital Leader of the Year)Dr. Abisoye Coker-Odusoke, DG, Nim C_.jpg'),
    displayOrder: 15,
  },
  {
    name: 'Olayemi Popoola',
    awardType: 'Special Award',
    awardDescription: 'Visionary Leader in Technology & Business',
    organization: 'Technology & Business Leader',
    filePath: path.join(individualDir, '(VISIONARY LEADER IN TECHNOLOGY & BUSINESS) Olayemi Popoola.jpeg'),
    displayOrder: 16,
  },
  {
    name: 'Daniel Awe',
    awardType: 'Special Award',
    awardDescription: 'Visionary Leader in Technology & Business',
    organization: 'Head, Africa Fintech Foundry',
    filePath: path.join(individualDir, '(VISIONARY LEADER IN TECHNOLOGY & BUSINESS​)Daniel Awe.jpg.jpeg'),
    displayOrder: 17,
  },
  {
    name: 'Kayowa Ogunrinde',
    awardType: 'Special Award',
    awardDescription: 'Visionary Leader in Technology & Business',
    organization: 'Technology & Business Leader',
    filePath: path.join(individualDir, '(VISIONARY LEADER IN TECHNOLOGY & BUSINESS​)Kayowa Ogunrinde .png'),
    displayOrder: 18,
  },

  // ==================== PROFESSIONAL AWARDS (INDUSTRY) ====================
  {
    name: 'Maria Njoroge',
    awardType: 'Agritech',
    awardDescription: 'Winner - Agritech',
    organization: 'Founder and Lead Researcher, Hive Blue Trace',
    filePath: path.join(professionalDir, '( WINNER Agritech ) Maria Njoroge ,Founder and lead Researcher,  Hive Blue Trace.png'),
    displayOrder: 19,
  },
  {
    name: 'Nancy Teta Kwizera',
    awardType: 'AI & Data (OAC)',
    awardDescription: 'Winner - AI & Data (Other African Countries)',
    organization: 'Founder & CEO, Baho Inclusive Tech Ltd',
    filePath: path.join(professionalDir, '( WINNER AI & Data OAC  ) Nancy Teta kwizera, Founder & CEO, Baho Inclusive Tech Ltd__.jpg'),
    displayOrder: 20,
  },
  {
    name: 'Dr. Oluwatobi Adeogun',
    awardType: 'AI & Data',
    awardDescription: 'Winner - AI & Data',
    organization: 'CEO & Co-Founder, Thrivyx Nigeria',
    filePath: path.join(professionalDir, '( winner AI & Data) Dr. Oluwatobi Adeogun, CEO_Co-Founder, Thrivyx Nigeria.png'),
    displayOrder: 21,
  },
  {
    name: 'Femi Adeyemi',
    awardType: 'Cleantech Energy',
    awardDescription: 'Winner - Cleantech Energy',
    organization: 'General Manager, Information and Digital Technology, Renaissance Africa Energy Company Limited',
    filePath: path.join(professionalDir, '( winner Cleantech Energy ) Femi Adeyemi., General Manager, Information and Digital Technology ,Renaissance Africa Energy Company Limited.jpg'),
    displayOrder: 22,
  },
  {
    name: 'Metkel Abraham',
    awardType: 'Cleantech Energy (OAC)',
    awardDescription: 'Winner - Cleantech Energy (Other African Countries)',
    organization: 'CEO, Aptech Africa Ltd',
    filePath: path.join(professionalDir, '( WINNER Cleantech Energy OAC ) Metkel Abraham CEO, Aptech Africa Ltd.jpg'),
    displayOrder: 23,
  },
  {
    name: 'Bright Ogwuh',
    awardType: 'E-Commerce',
    awardDescription: 'Winner - E-Commerce',
    organization: 'Chief Digital & Technology Officer, SIMS Nigeria Limited',
    filePath: path.join(professionalDir, '( winner E-Commerce) Bright Ogwuh , Chief Digital & Technology Officer , SIMS Nigeria Limited.jpeg'),
    displayOrder: 24,
  },
  {
    name: 'Yetunde Ayodeji',
    awardType: 'Education',
    awardDescription: 'Winner - Education',
    organization: 'Educator, Oxbridge Tutorial College',
    filePath: path.join(professionalDir, '( WINNER Education ) Yetunde Ayodeji ,Educator, Oxbridge Tutorial College.jpg'),
    displayOrder: 25,
  },
  {
    name: 'Uche Uzoebo',
    awardType: 'Fintech and Financial Services',
    awardDescription: 'Winner - Fintech and Financial Services',
    organization: 'MD / CEO, Shared Agent Network Expansion Facility (SANEF)',
    filePath: path.join(professionalDir, '( winner Fintech and Financial Services )  UCHE UZOEBO , MD_CEO , SHARED AGENT NETWORK EXPANSION FAVILITIES.jpg'),
    displayOrder: 26,
  },
  {
    name: 'Peter Kakoma',
    awardType: 'Fintech and Financial Services (OAC)',
    awardDescription: 'Winner - Fintech and Financial Services (Other African Countries)',
    organization: 'Founder and Principal Technical Consultant, Kanzu Code Limited',
    filePath: path.join(professionalDir, '( WINNER Fintech and Financial Services OAC )  Peter Kakoma, Founder and Principal Technical Consultant, Kanzu Code Limited.jpg'),
    displayOrder: 27,
  },
  {
    name: 'Oluwaseun Afolayan',
    awardType: 'Healthtech',
    awardDescription: 'Winner - Healthtech',
    organization: 'Co-founder, Mytherapist.ng',
    filePath: path.join(professionalDir, '( WINNER Healthtech ) Oluwaseun Afolayan ,Co-founder ,Mytherapis.jpg'),
    displayOrder: 28,
  },
  {
    name: 'Donald Saola',
    awardType: 'Media',
    awardDescription: 'Winner - Media',
    organization: 'Chief Technology Officer, News Central TV Limited',
    filePath: path.join(professionalDir, '( WINNER Media ) Donald Saola, CHIEF TECHNOLOGY OFFICER , NEWSCENTRAL TV LIMITED.jpg'),
    displayOrder: 29,
  },
  {
    name: 'Myke Koledoye',
    awardType: 'Technology Services',
    awardDescription: 'Winner - Technology Services',
    organization: 'CTO & Group Head of Information Technology, PremiumTrust Bank',
    filePath: path.join(professionalDir, '( winner Technology Services ) MYKE KOLEDOYE,  CTO _ Group Head of Information Technology  ,PremiumTrust Bank.jpg'),
    displayOrder: 30,
  },
  {
    name: 'Aderonke Adeyegbe',
    awardType: 'Telecommunications',
    awardDescription: 'Winner - Telecommunications',
    organization: 'Group Managing Director, Comercio Limited',
    filePath: path.join(professionalDir, '( winner Telecommunications ) Aderonke Adeyegbe , GMD , Comercio Limited.jpeg'),
    displayOrder: 31,
  },
  {
    name: 'Sylvia Nakanwagi',
    awardType: 'Technology Services (OAC)',
    awardDescription: 'Winner - Technology Services (Other African Countries)',
    organization: 'Manager IT Service Delivery, Centenary Technology Services',
    filePath: path.join(professionalDir, '(winner Technology Services OAC) Sylvia Nakanwagi, Manager IT Service Delivery ,Centenary Technology Services.jpg'),
    displayOrder: 32,
  },
];

async function uploadToCatbox(buffer: Buffer, originalFilename: string, mimeType: string): Promise<string> {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', new Blob([buffer], { type: mimeType }), originalFilename);

  const res = await fetch('https://catbox.moe/user/api.php', {
    method: 'POST',
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Catbox HTTP error: ${res.status} ${res.statusText}`);
  }

  const url = (await res.text()).trim();
  if (!url.startsWith('http')) {
    throw new Error(`Invalid Catbox response: ${url}`);
  }

  return url;
}

async function main() {
  console.log(`Starting 2026 award winners processing (${winnersList.length} items)...`);

  // Verify all files exist first
  for (const w of winnersList) {
    if (!fs.existsSync(w.filePath)) {
      throw new Error(`File missing for ${w.name}: ${w.filePath}`);
    }
  }
  console.log('✅ All 32 local files verified.');

  // Clean existing 2026 winners if any
  console.log('Cleaning existing 2026 winners from DB...');
  const deletedWinners = await sql`DELETE FROM award_winner WHERE year = '2026' RETURNING id`;
  console.log(`Deleted ${deletedWinners.length} previous 2026 winner records.`);

  let index = 0;
  for (const item of winnersList) {
    index++;
    console.log(`\n[${index}/${winnersList.length}] Processing: ${item.name} (${item.awardType})`);

    const rawBuffer = fs.readFileSync(item.filePath);
    let finalBuffer: Buffer = rawBuffer;
    let finalExt = path.extname(item.filePath).toLowerCase();
    let mimeType = 'image/jpeg';

    if (finalExt === '.png') {
      mimeType = 'image/png';
    } else if (finalExt === '.webp') {
      mimeType = 'image/webp';
    }

    // Optimize large images (> 1.5MB) to fast high quality JPEG/PNG
    if (rawBuffer.length > 1.5 * 1024 * 1024) {
      console.log(`  Optimizing large image (${(rawBuffer.length / (1024 * 1024)).toFixed(1)}MB)...`);
      try {
        finalBuffer = await sharp(rawBuffer)
          .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();
        finalExt = '.jpg';
        mimeType = 'image/jpeg';
        console.log(`  Optimized to ${(finalBuffer.length / 1024).toFixed(1)}KB`);
      } catch (err: any) {
        console.log(`  Sharp optimization skipped: ${err.message}, using original buffer`);
        finalBuffer = rawBuffer;
      }
    }

    const cleanFilename = `${item.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}${finalExt}`;
    console.log(`  Uploading to Catbox CDN...`);
    const cdnUrl = await uploadToCatbox(finalBuffer, cleanFilename, mimeType);
    console.log(`  Uploaded: ${cdnUrl}`);

    const fileId = randomUUID();
    const winnerId = randomUUID();

    // Insert file record
    await sql`
      INSERT INTO file (id, remote_id, url, direct_url, size, type, name, created_at, updated_at)
      VALUES (
        ${fileId},
        ${path.basename(cdnUrl)},
        ${cdnUrl},
        ${cdnUrl},
        ${finalBuffer.length},
        ${mimeType},
        ${cleanFilename},
        NOW(),
        NOW()
      )
    `;

    // Insert award_winner record
    await sql`
      INSERT INTO award_winner (
        id, name, award_type, award_description, organization, year, image_id, display_order, created_at, updated_at
      )
      VALUES (
        ${winnerId},
        ${item.name},
        ${item.awardType},
        ${item.awardDescription},
        ${item.organization},
        ${'2026'},
        ${fileId},
        ${item.displayOrder},
        NOW(),
        NOW()
      )
    `;

    console.log(`  ✅ Successfully saved winner & file in DB.`);
  }

  console.log('\n=============================================');
  console.log('🎉 ALL 32 2026 AWARD WINNERS SEEDED SUCCESSFULLY!');
  console.log('=============================================');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
