import { db } from '$lib/db';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PATH = '/donate';

export const load: PageServerLoad = async () => {
  const content = await db.query.pageContent.findFirst({
    where: eq(pageContent.path, PATH)
  });

  const rawData = content?.data ? JSON.parse(content.data) : {
    hero: {
      badge: "Support Our Mission",
      title: "Sponsor a Project",
      description: "Your generous contribution helps us drive digital transformation and empower technology leaders across the African continent."
    },
    bankDetails: {
      accountName: "Edniesal Consulting Ltd (Dollar account)",
      bankName: "First City Monument Bank (FCMB)",
      accountNumber: "6997978022",
      accountType: "Dollar Account",
      additionalNote: "Please use your name or organization as the transfer reference."
    },
    impact: {
      title: "Your Impact",
      description: "Every contribution goes directly toward advancing technology leadership across Africa.",
      items: [
        { label: "Leadership Programs", description: "Fund executive training and mentorship initiatives for emerging CIOs." },
        { label: "Annual Summit", description: "Help underwrite the cost of bringing together Africa's top technology leaders." },
        { label: "Research & Policy", description: "Support the production of industry reports and policy advocacy." },
        { label: "Community Growth", description: "Enable scholarships and access for underrepresented tech leaders." }
      ]
    },
    cta: {
      title: "Questions About Donations?",
      description: "Our partnerships team is happy to discuss custom sponsorship packages, recurring support, or in-kind contributions.",
      buttonText: "Contact Our Team",
      buttonLink: "/contact"
    }
  };

  return {
    content: rawData,
    meta: content ? {
      title: content.title,
      description: content.description,
      ogImage: content.ogImage
    } : null
  };
};
