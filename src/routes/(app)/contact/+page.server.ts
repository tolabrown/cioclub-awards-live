import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/db';
import { contactInquiry } from '$lib/db/schema';

export const load: PageServerLoad = async () => {
  return {
    inquiryTypes: [
      { value: 'membership', label: 'Club Membership' },
      { value: 'partnership', label: 'Corporate Partnership' },
      { value: 'speaking', label: 'Speaking Opportunity' },
      { value: 'press', label: 'Press & Media' },
      { value: 'other', label: 'Other Inquiry' },
    ],
  };
};

export const actions: Actions = {
  submit: async ({ request, locals }) => {
    const formData = await request.formData();

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const inquiryType = formData.get('inquiryType') as string;
    const message = formData.get('message') as string;

    // Validation
    const requiredFields = [
      { key: 'fullName', label: 'Full Name' },
      { key: 'email', label: 'Professional Email' },
      { key: 'inquiryType', label: 'Inquiry Type' },
      { key: 'message', label: 'Message' },
    ];

    for (const field of requiredFields) {
      if (!formData.get(field.key)) {
        return fail(400, { message: `${field.label} is required` });
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return fail(400, { message: 'Please enter a valid email address' });
    }

    if (message.length < 10) {
      return fail(400, { message: 'Message must be at least 10 characters' });
    }

    try {
      await db.insert(contactInquiry).values({
        fullName,
        email,
        inquiryType,
        message,
      });

      const { logActivity } = await import('$lib/server/activity-log');
      await logActivity(locals, {
        action: `Submitted a ${inquiryType} inquiry`,
        operation: "CREATE",
        entityType: "contact_inquiry",
        metadata: { inquiryType, email }
      });

      return { success: true };
    } catch (e) {
      console.error('Contact form submission error:', e);
      return fail(500, { message: 'Failed to submit inquiry. Please try again.' });
    }
  },
};
