import { db } from '$lib/db';
import { pageContent, partner, file, awardWinner } from '$lib/db/schema';
import { eq, desc, like } from 'drizzle-orm';
import { AwardsHeroContent } from '$lib/constants';
import { getNominationPeriod } from '$lib/server/nomination-period';
import type { PageServerLoad } from './$types';

const PATH = '/awards';

export const load: PageServerLoad = async () => {
  const [contentRecord, nominationPeriod] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    getNominationPeriod()
  ]);

  let rawData = contentRecord?.data ? JSON.parse(contentRecord.data) : {};

  // Ensure hero content fallbacks if missing or empty
  if (!rawData.hero || (Array.isArray(rawData.hero) && rawData.hero.length === 0)) {
    rawData.hero = AwardsHeroContent;
  }

  // Ensure features fallback if missing or empty
  if (!rawData.features || (Array.isArray(rawData.features) && rawData.features.length === 0)) {
    rawData.features = [
      {
        title: "Sector-Based Excellence",
        desc: "Recognizing transformation across Banking, Fintech, FMCG, and beyond.",
        iconName: "Award",
      },
      {
        title: "Continental Scope",
        desc: "Celebrating IT leadership across 11 major African economic hubs.",
        iconName: "Globe",
      },
      {
        title: "Expert Jury",
        desc: "Vetted by a panel of distinguished industry veterans and policymakers.",
        iconName: "Users",
      },
    ];
  }

  const partners = await db.query.partner.findMany({
    where: eq(partner.category, 'Awards'),
    orderBy: partner.displayOrder,
    with: {
      logo: true
    }
  });

  const defaultPartners = [
    { name: "Friesland Campina", logo: { url: "/partners/friesland_campina_nin.webp" }, type: null },
    { name: "Golden Penny", logo: { url: "/partners/goldenpenny_foods.webp" }, type: null },
    { name: "Guinness Nigeria", logo: { url: "/partners/guinness_nigeria.webp" }, type: null },
    { name: "NBC", logo: { url: "/partners/nbc.webp" }, type: null },
    { name: "Nestle Nigeria", logo: { url: "/partners/nestle_nigeria.webp" }, type: null },
    { name: "Nigerian Breweries", logo: { url: "/partners/nigerian_breweries_plc.webp" }, type: null },
    { name: "PFS", logo: { url: "/partners/pfs.webp" }, type: null },
    { name: "SBC", logo: { url: "/partners/sbc.webp" }, type: null },
    { name: "Unicloud Africa", logo: { url: "/partners/unicloud_africa.webp" }, type: null }
  ];

  const highlightWinner = await db.query.awardWinner.findFirst({
    orderBy: [desc(awardWinner.createdAt)],
    with: {
      image: true
    }
  });

  const latestWinnerYear = await db.query.awardWinner.findFirst({
    orderBy: [desc(awardWinner.year)]
  });

  return {
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    content: rawData,
    partners: partners.length > 0 ? partners : defaultPartners,
    highlightWinner,
    latestWinnerYear: latestWinnerYear?.year || "2024",
    nominationPeriod
  };
};
