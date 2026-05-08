import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { sendContactEmail } from '$lib/server/email-service';

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !subject || !message) {
      return fail(400, {
        error: 'All fields are required',
        values: { name, email, subject, message }
      });
    }

    const result = await sendContactEmail({ name, email, subject, message });

    if (!result.success) {
      return fail(500, {
        error: result.error,
        values: { name, email, subject, message }
      });
    }

    return { success: true };
  }
};
