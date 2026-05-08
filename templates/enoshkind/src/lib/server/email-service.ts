import { EMAIL_WEBHOOK } from '$env/static/private';

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactEmail(data: ContactMessage) {
  if (!EMAIL_WEBHOOK) {
    console.error('EMAIL_WEBHOOK is not defined in environment variables');
    return { success: false, error: 'Email service unconfigured' };
  }

  try {
    const response = await fetch(EMAIL_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: 'support@chanieldigitalhealth.com',
        subject: `Contact Form: ${data.subject}`,
        body: `
					<h2>New Contact Message from EnoshKind</h2>
					<p><strong>Name:</strong> ${data.name}</p>
					<p><strong>Email:</strong> ${data.email}</p>
					<p><strong>Subject:</strong> ${data.subject}</p>
					<p><strong>Message:</strong></p>
					<p>${data.message}</p>
				`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send email:', errorText);
      return { success: false, error: 'Failed to send email' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendContactEmail:', error);
    return { success: false, error: 'Internal server error' };
  }
}
