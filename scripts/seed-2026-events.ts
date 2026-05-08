console.log('--- START SEED SCRIPT ---');
import postgres from 'postgres';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

const events = [
  {
    title: "Leadership Strategy Session 2026",
    description: "Annual strategy session for the Board of the CIO & C-SUITE CLUB Africa. Setting the continental roadmap for the year ahead.",
    shortDescription: "Strategic roadmap session for the executive board.",
    date: "2026-02-12T09:00:00Z",
    location: "Accra, Ghana & Virtual",
    type: "Strategy Session",
    status: "upcoming"
  },
  {
    title: "The Founders Circle: Continental Vision",
    description: "Exclusive gathering for founders and executive leaders to discuss scaling digital transformation across Africa.",
    shortDescription: "Elite gathering for executive founders and leaders.",
    date: "2026-03-06T18:00:00Z",
    location: "Lagos, Nigeria",
    type: "Founders Circle",
    status: "upcoming"
  },
  {
    title: "Strategic Leadership & Management Webinar",
    description: "In-depth masterclass on modern management frameworks for the digital age.",
    shortDescription: "Digital management masterclass for tech leaders.",
    date: "2026-03-27T14:00:00Z",
    location: "Online / Virtual",
    type: "Webinar",
    status: "upcoming"
  },
  {
    title: "CSR: AI & Innovation Hackathon",
    description: "Empowering the next generation of developers with AI tools and mentorship.",
    shortDescription: "Community-driven AI development challenge.",
    date: "2026-04-08T08:00:00Z",
    location: "Nairobi, Kenya",
    type: "CSR",
    status: "upcoming"
  },
  {
    title: "Ladies-in-Tech 4.0: Rwanda Summit",
    description: "The definitive gathering for women in technology across Africa. Empowering female leadership in the digital economy.",
    shortDescription: "Africa's largest summit for women in technology.",
    date: "2026-05-18T09:00:00Z",
    location: "Kigali, Rwanda",
    type: "Ladies-in-Tech",
    status: "upcoming"
  },
  {
    title: "The Annual CIO & C-Suite Summit",
    description: "Our flagship summit bringing together 1000+ IT leaders from across the globe to discuss the future of Africa's tech landscape.",
    shortDescription: "Continental flagship summit for IT decision makers.",
    date: "2026-07-08T09:00:00Z",
    location: "Johannesburg, South Africa",
    type: "Annual Summit",
    status: "upcoming"
  },
  {
    title: "CIO Awards Africa 2026: The Oscars of IT",
    description: "Celebrating excellence, innovation, and leadership in the African technology sector.",
    shortDescription: "The most prestigious recognition for African IT leaders.",
    date: "2026-10-17T19:00:00Z",
    location: "Lagos, Nigeria",
    type: "Conference & Awards",
    status: "upcoming"
  },
  {
    title: "AGM & 2026 Membership Induction",
    description: "Official annual general meeting and welcoming of new fellows into the CIO & C-Suite Club.",
    shortDescription: "Annual general meeting and new member induction.",
    date: "2026-10-29T10:00:00Z",
    location: "Virtual",
    type: "AGM",
    status: "upcoming"
  }
];

async function seed() {
  console.log('🌱 Seeding 2026 events...');

  for (const ev of events) {
    try {
      await sql`
        INSERT INTO event (id, title, description, short_description, date, location, type, status, updated_at)
        VALUES (
          ${randomUUID()},
          ${ev.title},
          ${ev.description},
          ${ev.shortDescription},
          ${ev.date},
          ${ev.location},
          ${ev.type},
          ${ev.status},
          NOW()
        )
      `;
      console.log(`✅ Seeded: ${ev.title}`);
    } catch (err) {
      console.error(`❌ Failed: ${ev.title}`, err);
    }
  }

  console.log('🏁 Seeding complete!');
  process.exit(0);
}

seed();
