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

  // 1. Group trustees by their "role" field
  const roleGroups = new Map<string, any[]>();

  trustees.forEach(t => {
    const roleKey = t.role || "Executive Leadership";
    if (!roleGroups.has(roleKey)) {
      roleGroups.set(roleKey, []);
    }
    roleGroups.get(roleKey)?.push({
      id: t.id,
      name: t.name,
      role: t.position, // We show 'position' as the sub-label
      bio: t.bio,
      image: t.image?.url || "/hero-bg.webp",
      socials: { linkedin: t.linkedinUrl || "#", twitter: "#" }
    });
  });

  // 2. Convert Map to sorted sections
  // We can prioritize certain roles or sort them by their members' displayOrder min value
  const dynamicSections = Array.from(roleGroups.entries())
    .filter(([role]) => !role.toLowerCase().includes('board'))
    .map(([role, members]) => ({
      id: role.toLowerCase().replace(/\s+/g, '-'),
      title: role,
      description: `Meet the experts driving our mission in the ${role} capacity.`,
      members
    }))
    .sort((a, b) => {
      // Sort primarily by the lowest displayOrder in the group
      const minA = Math.min(...trustees.filter(t => (t.role || "Executive Leadership") === a.title).map(t => t.displayOrder || 0));
      const minB = Math.min(...trustees.filter(t => (t.role || "Executive Leadership") === b.title).map(t => t.displayOrder || 0));
      return minA - minB;
    });

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
