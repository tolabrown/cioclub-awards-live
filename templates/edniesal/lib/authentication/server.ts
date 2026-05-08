import { env } from '$env/dynamic/private';
import crypto from 'node:crypto';

interface SendEmailOptions {
  to: string;
  subject: string;
  meta: {
    description: string;
    link: string;
  };
}

/**
 * Send an email (Trigger a Mailchimp Customer Journey)
 * Uses MC_API (API Key), MC_LIST_ID, and a journeyUrl
 */
export const sendEmailAction = async (options: SendEmailOptions & { journeyUrl?: string }): Promise<void> => {
  const apiKey = env.MC_API;
  const listId = env.MC_LIST_ID;
  const serverPrefix = env.MC_SERVER_PREFIX || 'us21';
  const journeyUrl = options.journeyUrl || env.MC_WELCOME;

  if (!journeyUrl || !apiKey) {
    console.log('[Mailchimp Preview] Triggering journey for:', options.to);
    console.log('[Mailchimp Preview] Set MC_WELCOME/MC_LIT_PAYMENT and MC_API in .env to enable');
    return;
  }

  try {
    // 1. Ensure the member exists in the audience (Upsert)
    // This fixes the "Bad Request: This request can only be made with existing emails" error
    if (listId) {
      console.log(`[Mailchimp] Upserting member ${options.to} to list ${listId}`);
      const subscriberHash = crypto.createHash('md5').update(options.to.toLowerCase()).digest('hex');
      const upsertResponse = await fetch(`https://${serverPrefix}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_address: options.to,
          status_if_new: 'subscribed',
          // Optionally add merge fields if needed by the journey
          merge_fields: {
            // Example: FNAME: options.firstName
          }
        })
      });

      if (!upsertResponse.ok) {
        const errorData = await upsertResponse.json().catch(() => ({}));
        console.warn('Mailchimp member upsert failed (continuing to journey trigger):', errorData);
      }
    }

    // 2. Trigger the journey
    const response = await fetch(journeyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email_address: options.to
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Mailchimp trigger failed:', errorData);
      throw new Error(`Failed to trigger Mailchimp: ${response.statusText}`);
    }

    console.log('Mailchimp journey triggered for:', options.to);
  } catch (error) {
    console.error('Error triggering Mailchimp journey:', error);
    throw error;
  }
};
