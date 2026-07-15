import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { sponsorshipInquiry, partner } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  let partners: any[] = [];
  
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

  try {
    partners = await db.query.partner.findMany({
      where: eq(partner.category, 'Awards'),
      orderBy: partner.displayOrder,
      with: {
        logo: true
      }
    });
  } catch (err) {
    console.error("Sponsorship Page DB Error:", err);
  }

  return {
    partners: partners.length > 0 ? partners : defaultPartners,
    packages: [
      {
        id: 'platinum',
        name: 'Platinum',
        color: 'from-slate-200 to-slate-400',
        benefits: [
          'Title sponsorship recognition',
          '2 premium tables (20 seats)',
          'Exclusive speaking slot',
          'Premier logo placement',
          'Full-page program advertisement',
          'Red carpet branding',
          'Social media spotlight',
          'VIP networking access',
          'Award presentation opportunity',
          'Post-event report inclusion',
        ],
      },
      {
        id: 'gold',
        name: 'Gold',
        color: 'from-yellow-300 to-yellow-500',
        benefits: [
          '1 premium table (10 seats)',
          'Keynote session branding',
          'Prominent logo placement',
          'Half-page program ad',
          'Event signage branding',
          'Social media mentions',
          'Networking session access',
          'Award category sponsorship',
        ],
      },
      {
        id: 'silver',
        name: 'Silver',
        color: 'from-gray-300 to-gray-400',
        benefits: [
          '5 VIP tickets',
          'Logo on event materials',
          'Quarter-page program ad',
          'Social media recognition',
          'Networking access',
          'Certificate of appreciation',
        ],
      },
      {
        id: 'bronze',
        name: 'Bronze',
        color: 'from-amber-600 to-amber-700',
        benefits: [
          '3 VIP tickets',
          'Logo recognition',
          'Program listing',
          'Social media mention',
          'Certificate of appreciation',
        ],
      },
    ],
  };
};

export const actions: Actions = {
  submit: async ({ request, locals }) => {
    const formData = await request.formData();

    const companyName = formData.get('companyName') as string;
    const contactName = formData.get('contactName') as string;
    const contactEmail = formData.get('contactEmail') as string;
    const contactPhone = formData.get('contactPhone') as string;
    const packageInterest = formData.get('packageInterest') as string;
    const message = formData.get('message') as string;

    // Validation
    const requiredFields = [
      { key: 'companyName', label: 'Company Name' },
      { key: 'contactName', label: 'Contact Name' },
      { key: 'contactEmail', label: 'Contact Email' },
      { key: 'packageInterest', label: 'Package Interest' },
    ];

    for (const field of requiredFields) {
      if (!formData.get(field.key)) {
        return fail(400, { message: `${field.label} is required` });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return fail(400, { message: 'Please enter a valid email address' });
    }

    try {
      await db.insert(sponsorshipInquiry).values({
        companyName,
        contactName,
        contactEmail,
        contactPhone: contactPhone || null,
        packageInterest,
        message: message || null,
      });

      const { logActivity } = await import('$lib/server/activity-log');
      await logActivity((locals as any), {
        action: `Inquired about ${packageInterest} sponsorship`,
        operation: "CREATE",
        entityType: "sponsorship_inquiry",
        metadata: { companyName, packageInterest, contactEmail }
      });

      return { success: true };
    } catch (e) {
      console.error('Sponsorship inquiry error:', e);
      return fail(500, { message: 'Failed to submit inquiry. Please try again.' });
    }
  },
};
