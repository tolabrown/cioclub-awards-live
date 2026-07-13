import { db } from '$lib/db';
import { pageContent, partner } from '$lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PATH = '/partnerships';

export const load: PageServerLoad = async () => {
  let contentRecord = null;
  let partners: any[] = [];
  try {
    [contentRecord, partners] = await Promise.all([
      db.query.pageContent.findFirst({
        where: eq(pageContent.path, PATH)
      }),
      db.query.partner.findMany({
        with: { logo: true },
        orderBy: [asc(partner.displayOrder)]
      })
    ]);
  } catch (err) {
    console.error("Partnerships DB Error:", err);
  }


  const rawData = contentRecord?.data ? JSON.parse(contentRecord.data) : {
    hero: {
      badge: "Partnerships",
      title: "Partner with Africa's Tech Decision Makers",
      description: "Join the ecosystem that is defining the digital future of the continent. Align your brand with leadership and innovation."
    },
    advantage: {
      title: "The Strategic Advantage",
      description: "Partnering with CIO Club Africa gives you an unparalleled platform to engage with the architects of Africa's digital transformation.",
      props: [
        "Direct access to 500+ African CIOs",
        "Brand alignment with continental excellence",
        "Lead generation through high-impact events",
        "Industry-shaping research sponsorship",
        "Input into policy advocacy agendas"
      ]
    },
    prospectus: {
      tag: "Partnership Commitment",
      title: "Ready to explore a partnership?",
      description: "Read our Partnership Commitment to see full details on benefits, visibility, and investment levels.",
      cta: "Read Partnership Commitment"
    },
    tiers: [
      {
        level: "Diamond",
        iconName: "Shield",
        description: "Maximum visibility and strategic participation across all major events and research projects.",
        color: "blue-500",
        bg: "blue-500/10"
      },
      {
        level: "Gold",
        iconName: "Star",
        description: "Prime branding opportunities at the Annual Summit and inclusion in quarterly industry reports.",
        color: "yellow-500",
        bg: "yellow-500/10"
      },
      {
        level: "Silver",
        iconName: "Award",
        description: "Targeted visibility at niche events and access to our digital membership community.",
        color: "gray-400",
        bg: "gray-400/10"
      }
    ]
  };

  return {
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    content: rawData,
    partners: partners.map(p => ({
      name: p.name,
      category: p.category,
      logo: p.logo?.url || "/hero-bg.webp",
      website: p.websiteUrl || "#"
    }))
  };
};
