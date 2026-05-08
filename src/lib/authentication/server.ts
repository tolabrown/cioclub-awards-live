import { env } from '$env/dynamic/private';

interface SendEmailOptions {
  to: string;
  subject: string;
  meta: {
    description: string;
    link: string;
  };
}

/**
 * Send an email using a webhook endpoint
 * Configure EMAIL_WEBHOOK in your .env file to point to your email service
 */
export const sendEmailAction = async (options: SendEmailOptions): Promise<void> => {
  const { EmailService } = await import('$lib/server/emailservice');

  await EmailService.sendTransactional(
    options.to,
    options.subject,
    options.meta.description,
    'Click Here',
    options.meta.link
  );
};
