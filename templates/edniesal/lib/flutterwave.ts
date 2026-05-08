import { env } from '$env/dynamic/private';
import { createCipheriv } from 'crypto';

const FLW_BASE_URL = env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com';
const FLW_ENCRYPTION_KEY = env.FLUTTERWAVE_ENCRYPTION_KEY;
// v4 uses CLIENT_ID + CLIENT_SECRET for OAuth. Fallback to SECRET_KEY for legacy/v3 compat.
const FLW_CLIENT_ID = env.FLUTTERWAVE_CLIENT_ID;
const FLW_CLIENT_SECRET = env.FLUTTERWAVE_CLIENT_SECRET;
const FLW_SECRET_KEY = env.FLUTTERWAVE_SECRET_KEY;

let _accessToken: string | null = null;
let _tokenExpiry = 0;

/**
 * Get an OAuth 2.0 access token for v4 API calls.
 * Falls back to SECRET_KEY if CLIENT_ID/SECRET are not set (e.g. still using v3 sandbox key).
 */
export async function getAccessToken(): Promise<string> {
  // Use static secret key if OAuth credentials are not configured
  if (!FLW_CLIENT_ID || !FLW_CLIENT_SECRET) {
    return FLW_SECRET_KEY || '';
  }

  if (_accessToken && Date.now() < _tokenExpiry) {
    return _accessToken;
  }

  const res = await fetch('https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: FLW_CLIENT_ID,
      client_secret: FLW_CLIENT_SECRET,
      grant_type: 'client_credentials',
    }),
  });

  if (!res.ok) {
    console.error('Failed to get Flutterwave access token:', await res.text());
    throw new Error('Failed to authenticate with Flutterwave');
  }

  const data = await res.json();
  _accessToken = data.access_token;
  // Tokens valid for 10 minutes; refresh 30s early
  _tokenExpiry = Date.now() + (data.expires_in - 30) * 1000;
  return _accessToken!;
}

/**
 * Encrypt data using 3DES as required by Flutterwave v4 card encryption.
 * Uses the FLUTTERWAVE_ENCRYPTION_KEY env variable.
 */
export function encryptData(data: string): string {
  if (!FLW_ENCRYPTION_KEY) throw new Error('FLUTTERWAVE_ENCRYPTION_KEY is not set');

  // Flutterwave uses 3DES with the key padded/trimmed to 24 bytes
  const key = Buffer.from(FLW_ENCRYPTION_KEY).subarray(0, 24);
  const iv = Buffer.alloc(8, 0);

  const cipher = createCipheriv('des-ede3-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

/** Generic authenticated fetch helper for Flutterwave API */
export async function flwFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  return fetch(`${FLW_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    },
  });
}
