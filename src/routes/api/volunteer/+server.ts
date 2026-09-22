import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db';
import { volunteerApplication } from '$lib/db/schema';
import { EmailService } from '$lib/server/emailservice';
import { Constants } from '$lib/constants';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      ageRange,
      helpAreas,
      helpAreasOther,
      aboutYourself,
      whyVolunteer,
      hasPreviousExperience,
      hasProgramManagementExperience,
      programManagementExperience,
      availableFullDay,
      availableBriefing,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !location || !ageRange || !helpAreas?.length || !aboutYourself || !whyVolunteer || hasProgramManagementExperience === undefined || hasProgramManagementExperience === null) {
      return json({ success: false, message: 'Please fill in all required fields.' }, { status: 400 });
    }

    // Store in database
    const [saved] = await db.insert(volunteerApplication).values({
      firstName,
      lastName,
      email,
      phone,
      location: location.trim(),
      ageRange,
      helpAreas: JSON.stringify(helpAreas),
      helpAreasOther: helpAreasOther || null,
      aboutYourself,
      whyVolunteer,
      hasPreviousExperience: !!hasPreviousExperience,
      hasProgramManagementExperience: !!hasProgramManagementExperience,
      programManagementExperience: hasProgramManagementExperience ? (programManagementExperience?.trim() || null) : null,
      availableFullDay: !!availableFullDay,
      availableBriefing: !!availableBriefing,
    }).returning();

    // Send confirmation email to applicant
    try {
      const confirmHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <div style="background: linear-gradient(135deg, #1e3a5f 0%, #d97706 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 0;">THE CIO &amp; C-SUITE AWARDS AFRICA 2026</h1>
            <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 8px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Volunteer Application Received</p>
          </div>
          <div style="background: #f9fafb; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 18px; font-weight: 700; color: #111827;">Dear ${firstName},</p>
            <p style="font-size: 15px; line-height: 1.7; color: #4b5563;">Thank you for applying to volunteer at <strong>The CIO &amp; C-Suite Awards Africa 2026</strong>. We are excited to have you join our volunteer team for this landmark event!</p>
            <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 20px; margin: 24px 0;">
              <p style="font-size: 14px; font-weight: 700; color: #92400e; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Event Details</p>
              <p style="font-size: 15px; color: #78350f; margin: 4px 0;"><strong>📅 Date:</strong> Tuesday, 27 October 2026</p>
              <p style="font-size: 15px; color: #78350f; margin: 4px 0;"><strong>📍 Venue:</strong> Balmoral Convention Center, Victoria Island, Lagos</p>
            </div>
            <p style="font-size: 15px; line-height: 1.7; color: #4b5563;">Our volunteer coordination team will review your application and reach out to you with next steps including your role assignment and briefing session schedule.</p>
            <p style="font-size: 15px; line-height: 1.7; color: #4b5563;">If you have any questions in the meantime, please contact us at <a href="mailto:${Constants.SUPPORTEMAIL}" style="color: #d97706; font-weight: 600;">${Constants.SUPPORTEMAIL}</a>.</p>
            <p style="font-size: 15px; color: #4b5563; margin-top: 32px;">Warm regards,<br /><strong style="color: #111827;">The CIO &amp; C-Suite Awards Africa Team</strong></p>
          </div>
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">&copy; ${new Date().getFullYear()} The CIO &amp; C-Suite Awards Africa. All rights reserved.</p>
        </div>
      `;
      await EmailService.sendGeneric(email, `Your Volunteer Application – The CIO & C-Suite Awards Africa 2026`, confirmHtml);
    } catch (emailErr) {
      console.warn('[Volunteer] Failed to send confirmation email:', emailErr);
    }

    // Send notification email to admin
    try {
      const adminHtml = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #111827; font-size: 22px; font-weight: 800; border-bottom: 2px solid #d97706; padding-bottom: 8px;">New Volunteer Application</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700; width: 40%;">Name</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Email</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${email}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Phone</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${phone}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Location</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${location}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Age Range</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${ageRange}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Help Areas</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${Array.isArray(helpAreas) ? helpAreas.join(', ') : helpAreas}${helpAreasOther ? ` (Other: ${helpAreasOther})` : ''}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">About</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${aboutYourself}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Why Volunteer</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${whyVolunteer}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Previous Experience</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${hasPreviousExperience ? 'Yes' : 'No'}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Program Management Experience</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${hasProgramManagementExperience ? `Yes${programManagementExperience ? ` (${programManagementExperience})` : ''}` : 'No'}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Available Full Day</td><td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb;">${availableFullDay ? 'Yes' : 'No'}</td></tr>
            <tr><td style="padding: 8px 12px; background: #f3f4f6; font-weight: 700;">Available for Briefing</td><td style="padding: 8px 12px;">${availableBriefing ? 'Yes' : 'No'}</td></tr>
          </table>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">Submitted at ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT</p>
        </div>
      `;
      await EmailService.sendGeneric(Constants.SUPPORTEMAIL, `[Volunteer Application] ${firstName} ${lastName}`, adminHtml);
    } catch (adminEmailErr) {
      console.warn('[Volunteer] Failed to send admin notification:', adminEmailErr);
    }

    return json({ success: true, message: 'Your volunteer application has been submitted successfully!' });
  } catch (error: any) {
    console.error('[Volunteer] Error:', error);
    return json({ success: false, message: 'An error occurred. Please try again.' }, { status: 500 });
  }
};
