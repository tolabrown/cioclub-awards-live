import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { awardEntry, file } from '$lib/db/schema';
import { eq, and, desc, gte, lt } from 'drizzle-orm';
import { handleFileUpload } from '$lib/server/minio';
import { env } from '$env/dynamic/private';
import { getNominationPeriod } from '$lib/server/nomination-period';

export const load: PageServerLoad = async ({ locals }) => {
  // User must be logged in to submit an entry
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/awards/entry');
  }

  // Year boundaries for scoping entries to the current calendar year
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
  const yearEnd = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);

  const [period, existingEntries] = await Promise.all([
    getNominationPeriod(),
    db.query.awardEntry.findMany({
      where: and(
        eq(awardEntry.userId, locals.user.id),
        gte(awardEntry.submittedAt, yearStart),
        lt(awardEntry.submittedAt, yearEnd)
      ),
      orderBy: [desc(awardEntry.submittedAt)],
      with: {
        supportingDoc: true,
      },
    }),
  ]);

  // Categories the user has already entered
  const enteredCategories = existingEntries.map((e) => e.category);

  return {
    user: locals.user,
    existingEntries,
    nominationPeriod: period,
    enteredCategories,
    categories: [
      { value: 'cio_of_the_year', label: 'CIO of the Year' },
      { value: 'digital_transformation', label: 'Digital Transformation Leader' },
      { value: 'innovation', label: 'Innovation Excellence' },
      { value: 'cybersecurity', label: 'Cybersecurity Leadership' },
      { value: 'data_analytics', label: 'Data & Analytics Excellence' },
      { value: 'cloud_infrastructure', label: 'Cloud & Infrastructure' },
      { value: 'emerging_tech', label: 'Emerging Technology Pioneer' },
      { value: 'sustainability', label: 'Technology for Sustainability' },
    ],
    industries: [
      'Banking & Finance',
      'Fintech',
      'Telecommunications',
      'Oil & Gas',
      'Manufacturing',
      'FMCG',
      'Healthcare',
      'Education',
      'Government',
      'Retail',
      'Technology',
      'Other',
    ],
    countries: [
      'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Rwanda',
      'Tanzania', 'Uganda', 'Egypt', 'Morocco', 'Senegal', 'Côte d\'Ivoire'
    ],
  };
};

export const actions: Actions = {
  submit: async ({ request, locals }) => {
    if (!locals.user) {
      return fail(401, { message: 'You must be logged in to submit an entry' });
    }

    // Check nomination period
    const period = await getNominationPeriod();
    if (period.status !== 'active') {
      return fail(403, { message: 'Award entry submissions are not currently open' });
    }

    const formData = await request.formData();

    const category = formData.get('category') as string;
    const projectTitle = formData.get('projectTitle') as string;
    const projectDescription = formData.get('projectDescription') as string;
    const organizationName = formData.get('organizationName') as string;
    const industry = formData.get('industry') as string;
    const country = formData.get('country') as string;
    const impactStatement = formData.get('impactStatement') as string;
    const supportingDoc = formData.get('supportingDoc') as File | null;

    // Validation
    const requiredFields = [
      { key: 'category', label: 'Award Category' },
      { key: 'projectTitle', label: 'Project Title' },
      { key: 'projectDescription', label: 'Project Description' },
      { key: 'organizationName', label: 'Organization Name' },
      { key: 'industry', label: 'Industry' },
      { key: 'country', label: 'Country' },
      { key: 'impactStatement', label: 'Impact Statement' },
    ];

    for (const field of requiredFields) {
      if (!formData.get(field.key)) {
        return fail(400, { message: `${field.label} is required` });
      }
    }

    if (projectDescription.length < 100) {
      return fail(400, { message: 'Project description must be at least 100 characters' });
    }

    if (impactStatement.length < 50) {
      return fail(400, { message: 'Impact statement must be at least 50 characters' });
    }

    // Check if user already has an entry in this category for the current year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const yearEnd = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);

    const existingInCategory = await db.query.awardEntry.findFirst({
      where: and(
        eq(awardEntry.userId, locals.user.id),
        eq(awardEntry.category, category),
        gte(awardEntry.submittedAt, yearStart),
        lt(awardEntry.submittedAt, yearEnd)
      ),
    });

    let supportingDocId: string | null = existingInCategory?.supportingDocId ?? null;

    try {
      // Handle file upload if provided
      if (supportingDoc && supportingDoc.size > 0) {
        const uploadResult = await handleFileUpload(supportingDoc, env.MINIO_BUCKET, `entries/${Date.now()}-${supportingDoc.name}`);

        // Save file record to database
        const [fileRecord] = await db.insert(file).values({
          remoteId: uploadResult.id,
          url: uploadResult.url,
          size: uploadResult.size,
          type: uploadResult.contentType,
          name: uploadResult.filename,
        }).returning();

        supportingDocId = fileRecord.id;
      }

      const { logActivity } = await import('$lib/server/activity-log');

      if (existingInCategory) {
        // Update existing entry
        await db.update(awardEntry)
          .set({
            projectTitle,
            projectDescription,
            organizationName,
            industry,
            country,
            impactStatement,
            supportingDocId,
          })
          .where(eq(awardEntry.id, existingInCategory.id));

        await logActivity(locals, {
          action: `Updated award entry: ${projectTitle}`,
          operation: "UPDATE",
          entityType: "award_entry",
          entityId: existingInCategory.id,
          metadata: { category, projectTitle }
        });

        return { success: true, updated: true };
      }

      // Insert new award entry
      const [newEntry] = await db.insert(awardEntry).values({
        userId: locals.user.id,
        category,
        projectTitle,
        projectDescription,
        organizationName,
        industry,
        country,
        impactStatement,
        supportingDocId,
      }).returning();

      await logActivity(locals, {
        action: `Submitted new award entry: ${projectTitle}`,
        operation: "CREATE",
        entityType: "award_entry",
        entityId: newEntry.id,
        metadata: { category, projectTitle }
      });

      return { success: true };
    } catch (e) {
      console.error('Entry submission error:', e);
      return fail(500, { message: 'Failed to submit entry. Please try again.' });
    }
  },
};
