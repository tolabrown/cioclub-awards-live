import { db } from '$lib/db';
import { pageContent, file, awardWinner } from '$lib/db/schema';
import { eq, desc, like } from 'drizzle-orm';
import { AwardsHeroContent } from '$lib/constants';
import { getNominationPeriod } from '$lib/server/nomination-period';
import type { PageServerLoad } from './$types';

const PATH = '/awards';

export const load: PageServerLoad = async () => {
  let contentRecord = null;
  let nominationPeriod = null;
  let highlightWinner = null;
  let latestWinnerYear = null;

  try {
    const results = await Promise.all([
      db.query.pageContent.findFirst({
        where: eq(pageContent.path, PATH)
      }),
      getNominationPeriod(),
      db.query.awardWinner.findFirst({
        orderBy: [desc(awardWinner.createdAt)],
        with: {
          image: true
        }
      }),
      db.query.awardWinner.findFirst({
        orderBy: [desc(awardWinner.year)]
      })
    ]);
    contentRecord = results[0];
    nominationPeriod = results[1];
    highlightWinner = results[2];
    latestWinnerYear = results[3];
  } catch (err) {
    console.error("Awards Page DB Error:", err);
  }

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
        desc: "Recognizing transformation across Banking, Fintech & Financial Services, FMCG, and beyond.",
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

  return {
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    content: rawData,
    highlightWinner,
    latestWinnerYear: latestWinnerYear?.year || "2024",
    nominationPeriod: nominationPeriod || { startDate: null, endDate: null, status: 'not_set' }
  };
};
