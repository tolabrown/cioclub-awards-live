import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { cvApplications, file as fileTable } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, phone, coverLetter, cvFileId } = body;

    // Validate required fields
    if (!name?.trim()) return json({ error: 'Name is required' }, { status: 400 });
    if (!email?.trim()) return json({ error: 'Email is required' }, { status: 400 });
    if (!phone?.trim()) return json({ error: 'Phone number is required' }, { status: 400 });
    if (!cvFileId) return json({ error: 'CV file is required' }, { status: 400 });

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return json({ error: 'Invalid email address' }, { status: 400 });

    const [application] = await db.insert(cvApplications).values({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      coverLetter: coverLetter || null,
      cvFileId,
    }).returning();

    return json({ success: true, id: application.id });
  } catch (error) {
    console.error('CV application error:', error);
    return json({ error: 'Failed to submit application' }, { status: 500 });
  }
};

export const GET: RequestHandler = async () => {
  try {
    const applications = await db
      .select({
        id: cvApplications.id,
        name: cvApplications.name,
        email: cvApplications.email,
        phone: cvApplications.phone,
        coverLetter: cvApplications.coverLetter,
        status: cvApplications.status,
        createdAt: cvApplications.createdAt,
        cvFile: {
          id: fileTable.id,
          url: fileTable.url,
          name: fileTable.name,
          type: fileTable.type,
        },
      })
      .from(cvApplications)
      .leftJoin(fileTable, eq(cvApplications.cvFileId, fileTable.id))
      .orderBy(desc(cvApplications.createdAt));

    return json({ success: true, applications });
  } catch (error) {
    console.error('Failed to fetch CV applications:', error);
    return json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
};
