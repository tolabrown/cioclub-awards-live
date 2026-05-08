import { db } from '$lib/db/drizzle';
import { consultations } from '$lib/db/schema';
import { fail } from '@sveltejs/kit';

export const load = async () => {
  return {};
};

export const actions = {
  submit: async ({ request }) => {
    const formData = await request.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const country = formData.get('country') as string;
    const countryOther = formData.get('countryOther') as string;
    const company = formData.get('company') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const topic = formData.get('topic') as string;
    const message = formData.get('message') as string;

    if (!firstName || !lastName || !country || !company || !email || !phone || !topic || !message) {
      return fail(400, { error: 'All marked fields are required.' });
    }

    try {
      await db.insert(consultations).values({
        firstName,
        lastName,
        country,
        countryOther,
        company,
        email,
        phone,
        topic,
        message,
        status: 'new'
      });

      return { success: 'Your consultation request has been submitted successfully. We will get back to you soon.' };
    } catch (error) {
      console.error('Consultation Submission Error:', error);
      return fail(500, { error: 'An unexpected error occurred. Please try again later.' });
    }
  }
};
