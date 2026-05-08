import { fail } from '@sveltejs/kit';
import { createInquiry } from '$lib/db/site';
import { getPageContent } from '$lib/db/pages';
import { CONTACT_DEFAULT } from '$lib/constants/defaults';

export const load = async () => {
  const page = await getPageContent('/contact', CONTACT_DEFAULT);
  return { page };
};

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name')?.toString();
    const email = formData.get('email')?.toString();
    const subject = formData.get('subject')?.toString();
    const message = formData.get('message')?.toString();

    if (!name || !email || !message) {
      return fail(400, { error: 'Name, email, and message are required', values: { name, email, subject, message } });
    }

    const result = await createInquiry({ name, email, subject, message });

    if (!result.success) {
      return fail(500, { error: 'Failed to send inquiry. Please try again later.', values: { name, email, subject, message } });
    }

    return { success: 'Thank you for your inquiry. Our team will get back to you shortly.' };
  }
};
