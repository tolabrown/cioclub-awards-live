import type { Actions, RequestEvent } from './$types';
import { fail } from '@sveltejs/kit';
import { emailService } from '$lib/server/emailservice';

export const actions = {
  default: async ({ request }: RequestEvent) => {
    const formData = await request.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!firstName || !email || !message) {
      return fail(400, { message: 'Missing required fields' });
    }

    const name = `${firstName} ${lastName}`.trim();

    try {
      await emailService.sendContactConfirmation(name, email, subject, message);
      return { success: true };
    } catch (error) {
      console.error('Contact form error:', error);
      return fail(500, { message: 'Failed to send message. Please try again later.' });
    }
  }
} satisfies Actions;
