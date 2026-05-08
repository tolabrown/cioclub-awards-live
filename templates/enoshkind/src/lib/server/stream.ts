import { StreamClient } from '@stream-io/node-sdk';
import { env } from '$env/dynamic/private';

const apiKey = env.GETSTREAM_API_KEY;
const apiSecret = env.GETSTREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.warn('GetStream API credentials are not configured. Please set GETSTREAM_API_KEY and GETSTREAM_API_SECRET in your .env file');
}

/**
 * Generate a user token for GetStream Video
 * @param userId - The user ID to generate a token for
 * @returns A valid user token for GetStream
 */
export async function generateUserToken(userId: string): Promise<string> {
  if (!apiKey || !apiSecret) {
    throw new Error('GetStream API credentials are not configured');
  }
  const client = new StreamClient(apiKey, apiSecret);
  const token = client.createToken(userId);
  return token;
}

/**
 * Create a call ID for a consultation
 * @param consultationId - The consultation ID
 * @returns A formatted call ID
 */
export function getCallId(consultationId: string): string {
  return `consultation-${consultationId}`;
}
