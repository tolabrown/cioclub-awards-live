import { db } from '$lib/db';
import { pageContent, trustee } from '$lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PATH = '/team';

export const load: PageServerLoad = async () => {
  let contentRecord = null;
  let trustees: any[] = [];

  try {
    const results = await Promise.all([
      db.query.pageContent.findFirst({
        where: eq(pageContent.path, PATH)
      }),
      db.query.trustee.findMany({
        with: {
          image: true
        },
        orderBy: [asc(trustee.displayOrder)]
      })
    ]);
    contentRecord = results[0];
    trustees = results[1];
  } catch (err) {
    console.error("Team Page DB Error:", err);
  }

  const rawData = contentRecord?.data ? JSON.parse(contentRecord.data) : {
    hero: {
      badge: "Governance & Leadership",
      title: "Our Leadership",
      description: "Meet the distinguished visionaries driving the CIO & C-Suite Club Africa toward a digitally empowered future."
    },
    sections: [
      { id: "governing-board", title: "Board of Trustees", description: "Founding members and executive advisors shaping the continental tech landscape." },
      { id: "elc", title: "Executive Leadership Council", description: "Outgoing members driving operational excellence and strategic execution." }
    ],
    values: {
      title: "Guided by Excellence",
      subtitle: "Our leadership team operates under a shared vision of pan-African integration through technology.",
      items: [
        { title: "Integrity", desc: "Upholding the highest standards of professional and ethical conduct." },
        { title: "Innovation", desc: "Fostering a culture that embraces breakthrough technologies." },
        { title: "Inclusion", desc: "Ensuring every voice in the African tech ecosystem is heard." }
      ]
    },
    quote: {
      text: "We are defined by the impact of our decisions today on the digital landscape of tomorrow.",
      author: "Abiola Laseinde",
      role: "Founder's Vision",
      image: "https://minio.toolsntuts.com/api/v1/buckets/cio/objects/download?preview=true&prefix=1770778607374-abiola_laseinde.webp"
    }
  };

  const defaultElcMembers = [
    {
      id: "mories-atoki",
      name: "Dr. Mories Atoki",
      designation: "CHIEF EXECUTIVE OFFICER",
      organization: "AFRICAN BUSINESS COALITION FOR HEALTH (ABC)",
      councilRole: "Vice President",
      role: "CHIEF EXECUTIVE OFFICER",
      bio: "Dr. Mories Atoki is a seasoned technology entrepreneur and business leader passionate about using innovation to solve real problems, improve lives, and shape Africa's future.",
      image: "/team/mories_atoki.jpg",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      id: "enoch-agbona",
      name: "Enoch Agbona",
      designation: "CHIEF OPERATING OFFICER",
      organization: "BCT LIMITED",
      councilRole: "Honorary Secretary",
      role: "CHIEF OPERATING OFFICER",
      bio: "Enoch Agbona is Chief Operating Officer at BCT Limited, leading operational strategy and technology development.",
      image: "/team/enoch_agbona.jpg",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      id: "emmanuel-morka",
      name: "Emmanuel Morka",
      designation: "REGIONAL CHIEF INFORMATION OFFICER",
      organization: "ACCESS BANK PLC",
      councilRole: "Advocacy & Stakeholder Relations Director",
      role: "REGIONAL CHIEF INFORMATION OFFICER",
      bio: "Emmanuel Morka is a strategic IT Executive (CIO) with 20+ years of experience leading enterprise-wide technology transformation, IT governance, and cybersecurity initiatives that drive business growth.",
      image: "/team/olusegun_dada.webp",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      id: "mohammed-besheer",
      name: "Mohammed Besheer",
      designation: "DEPUTY IT DIRECTOR",
      organization: "EGYPTIAN BANKING INSTITUTE",
      councilRole: "Programme & Events Director",
      role: "DEPUTY IT DIRECTOR",
      bio: "Mohammed Besheer is Deputy IT Director at Egyptian Banking Institute, driving digital transformation across cloud, AI, data infrastructure, and enterprise IT.",
      image: "/team/mohammed_besheer.jpg",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      id: "ruth-osaigbovo",
      name: "Ruth Osaigbovo",
      designation: "HEAD OF INFORMATION TECHNOLOGY",
      organization: "FOOD CONCEPT PLC",
      councilRole: "Finance & Budgeting Director",
      role: "HEAD OF INFORMATION TECHNOLOGY",
      bio: "Ruth Osaigbovo is Head of Information Technology at Food Concept Plc, leading enterprise technology governance and budgeting.",
      image: "/team/rita_amuchienwa.webp",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      id: "tasha-fopi-tagha",
      name: "Tasha Fopi Tagha",
      designation: "PRODUCT MANAGER",
      organization: "MTN (CAMEROON)",
      councilRole: "Marketing & Organizational Communications Director",
      role: "PRODUCT MANAGER",
      bio: "Tasha Fopi Tagha is a Product Manager at MTN (Cameroon), driving digital communications, marketing, and product innovation.",
      image: "/team/fikayo_olagunju.webp",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      id: "ifeoma-obata",
      name: "Ifeoma Obata",
      designation: "PROJECT COORDINATOR",
      organization: "PWC",
      councilRole: "Youth Affairs Director",
      role: "PROJECT COORDINATOR",
      bio: "Ifeoma Obata is a Project Coordinator at PwC, driving youth engagement, tech transformation, and continental project coordination.",
      image: "/team/ifeoma_obata.jpg",
      socials: { linkedin: "#", twitter: "#" }
    },
    {
      id: "ignace-kwizera",
      name: "Ignace Kwizera",
      designation: "FOUNDER",
      organization: "JACKAL TECH LTD",
      councilRole: "Learning & Development Director",
      role: "FOUNDER",
      bio: "Ignace Kwizera is the Founder of Jackal Tech Ltd, focused on technology innovation, learning, and talent capacity development.",
      image: "/team/ignace_kwizera.jpg",
      socials: { linkedin: "#", twitter: "#" }
    }
  ];

  // 1. Group trustees by their "role" field
  const roleGroups = new Map<string, any[]>();

  trustees.forEach(t => {
    const roleKey = t.role || "Executive Leadership Council";
    if (!roleGroups.has(roleKey)) {
      roleGroups.set(roleKey, []);
    }
    roleGroups.get(roleKey)?.push({
      id: t.id,
      name: t.name,
      designation: t.position || t.role,
      organization: t.organization || "",
      councilRole: t.councilRole || t.position || "",
      role: t.position,
      bio: t.bio,
      image: t.image?.url || "/hero-bg.webp",
      socials: { linkedin: t.linkedinUrl || "#", twitter: "#" }
    });
  });

  // 2. Convert Map to sorted sections
  let dynamicSections = Array.from(roleGroups.entries())
    .filter(([role]) => !role.toLowerCase().includes('board'))
    .map(([role, members]) => ({
      id: role.toLowerCase().replace(/\s+/g, '-'),
      title: role.includes('2026') ? role : `2026 ${role}`,
      description: `Meet the experts driving our mission in the ${role} capacity.`,
      members
    }))
    .sort((a, b) => {
      const minA = Math.min(...trustees.filter(t => (t.role || "Executive Leadership Council") === a.title).map(t => t.displayOrder || 0));
      const minB = Math.min(...trustees.filter(t => (t.role || "Executive Leadership Council") === b.title).map(t => t.displayOrder || 0));
      return minA - minB;
    });

  if (!dynamicSections.length || !dynamicSections.some(s => s.members && s.members.length > 0)) {
    dynamicSections = [
      {
        id: "elc",
        title: "2026 Executive Leadership Council (ELC)",
        description: "Meet the experts driving our mission in the Executive Leadership Council capacity.",
        members: defaultElcMembers
      }
    ];
  } else {
    // Ensure ELC section uses defaultElcMembers if DB entries are minimal
    dynamicSections = dynamicSections.map(s => {
      if (s.id.includes('elc') || s.title.toLowerCase().includes('executive')) {
        return {
          ...s,
          title: "2026 Executive Leadership Council (ELC)",
          members: defaultElcMembers
        };
      }
      return s;
    });
  }

  return {
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    content: {
      ...rawData,
      sections: dynamicSections
    }
  };
};
