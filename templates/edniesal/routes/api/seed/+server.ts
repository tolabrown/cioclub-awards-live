import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { siteContent, services, teamMembers, pageContent } from '$lib/db/schema';
import { nanoid } from 'nanoid';
import { Shield, Rocket, Lock, Users, Briefcase, Globe, Sparkles } from '@lucide/svelte';

export const GET = async ({ url }) => {
  // Simple secret check (for safety)
  if (url.searchParams.get('key') !== 'seed_123') {
    return json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Seed Site Content (Hero, Mission, Stats)
    const homeHero = {
      subtitle: 'Edniesal Consulting',
      title: 'Elevating Governance Standards',
      description: 'Your trusted partner in Enterprise Governance, SME Advisory, and Data Protection across African and international markets.',
      primaryCta: { text: 'Get Started', href: '/services' },
      secondaryCta: { text: 'Learn More', href: '/team' }
    };

    await db.insert(siteContent).values({
      id: nanoid(),
      key: 'home_hero',
      content: JSON.stringify(homeHero)
    }).onConflictDoUpdate({
      target: siteContent.key,
      set: { content: JSON.stringify(homeHero) }
    });

    // 2. Seed Services
    const initialServices = [
      {
        id: nanoid(),
        title: "Enterprise Governance",
        subtitle: "The Foundation of Excellence",
        description: "Robust governance frameworks to instill confidence and ethical growth.",
        iconName: "Shield",
        features: "Board Evaluations;Governance Audits;Policy Development;Conflict Resolution",
        order: "1"
      },
      {
        id: nanoid(),
        title: "SME Advisory",
        subtitle: "Scaling African Businesses",
        description: "Strategic depth for operational efficiency and sustainable scaling.",
        iconName: "Rocket",
        features: "Market Entry;Operational Optimization;Financial Advisory;Scaling Frameworks",
        order: "2"
      },
      {
        id: nanoid(),
        title: "Data Protection",
        subtitle: "Privacy in the Digital Age",
        description: "Ensuring compliance with international and local data protection regulations.",
        iconName: "Lock",
        features: "Compliance Audits;Privacy Impact;Data Training;DPO Service",
        order: "3"
      }
    ];

    for (const s of initialServices) {
      await db.insert(services).values(s).onConflictDoNothing();
    }

    // 3. Seed Team Members (Leadership & Staff)
    const initialTeam = [
      {
        id: nanoid(),
        name: "Abiola Laseinde",
        role: "Managing Director & CEO",
        bio: "Visionary leader with 20+ years in corporate governance and strategic advisory.",
        imageUrl: "/team/abiola.webp",
        type: "leadership",
        linkedinUrl: "http://linkedin.com/in/abiola-laseinde-fcis-mciarb-18a76018",
        order: "1"
      },
      {
        id: nanoid(),
        name: "Oluwakayode Adigun",
        role: "Chairman",
        bio: "Seasoned professional leading the board with strategic oversight.",
        imageUrl: "/team/kayode.webp",
        type: "leadership",
        linkedinUrl: "http://linkedin.com/in/pakay05",
        order: "0"
      },
      {
        id: nanoid(),
        name: "Promise Oriabure",
        role: "Business Manager",
        bio: "Driving business excellence and operations.",
        imageUrl: "/team/promise.webp",
        type: "staff",
        order: "2"
      },
      {
        id: nanoid(),
        name: "Racheal Odeja-Fidelis",
        role: "Creative Strategy Manager",
        bio: "Leading creative direction and strategic communication.",
        imageUrl: "/team/racheal.webp",
        type: "staff",
        order: "3"
      }
    ];

    for (const t of initialTeam) {
      await db.insert(teamMembers).values(t).onConflictDoNothing();
    }

    // 4. Seed Legal Pages and SEO Defaults
    const defaultOgImage = '/ogimage.webp';
    const legalPages = [
      {
        path: '/privacy',
        title: 'Privacy Policy | Edniesal Consulting',
        description: 'Our commitment to protecting your personal data and privacy.',
        data: JSON.stringify({ content: '<h1>Privacy Policy</h1><p>Welcome to our Privacy Policy page...</p>' })
      },
      {
        path: '/cookie-policy',
        title: 'Cookie Policy | Edniesal Consulting',
        description: 'Information about how we use cookies and similar technologies.',
        data: JSON.stringify({ content: '<h1>Cookie Policy</h1><p>We use cookies to improve your experience...</p>' })
      },
      {
        path: '/terms-of-use',
        title: 'Terms of Use | Edniesal Consulting',
        description: 'The terms and conditions for using our website and services.',
        data: JSON.stringify({ content: '<h1>Terms of Use</h1><p>By using our services, you agree to these terms...</p>' })
      }
    ];

    for (const page of legalPages) {
      await db.insert(pageContent).values({
        id: nanoid(),
        ...page,
        ogimage: defaultOgImage
      }).onConflictDoUpdate({
        target: pageContent.path,
        set: {
          title: page.title,
          description: page.description,
          data: page.data,
          ogimage: defaultOgImage
        }
      });
    }

    return json({ message: 'Seeding successful' });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
};
