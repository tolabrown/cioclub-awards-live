import { env } from '$env/dynamic/private';
import { createCipheriv } from 'crypto';

const FLW_BASE_URL = env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com';
const FLW_ENCRYPTION_KEY = env.FLUTTERWAVE_ENCRYPTION_KEY;
// v4 uses CLIENT_ID + CLIENT_SECRET for OAuth. Fallback to SECRET_KEY for legacy/v3 compat.
const FLW_CLIENT_ID = env.FLUTTERWAVE_CLIENT_ID;
const FLW_CLIENT_SECRET = env.FLUTTERWAVE_CLIENT_SECRET;
const FLW_SECRET_KEY = env.FLUTTERWAVE_SECRET_KEY || env.FW_SECRET_KEY;

let _accessToken: string | null = null;
let _tokenExpiry = 0;

/**
 * Get an OAuth 2.0 access token for v4 API calls.
 * Falls back to SECRET_KEY if CLIENT_ID/SECRET are not set.
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

/** Fetch exchange rates from NGN to a target currency */
export async function getExchangeRate(toCurrency: string): Promise<number> {
    if (toCurrency === 'NGN') return 1;

    // Try direct pair first
    const directRate = await fetchRate('NGN', toCurrency);
    if (directRate !== null) return directRate;

    // Fallback: NGN → USD → target
    if (toCurrency !== 'USD') {
        const ngnToUsd = await fetchRate('NGN', 'USD');
        const usdToTarget = await fetchRate('USD', toCurrency);
        if (ngnToUsd !== null && usdToTarget !== null) {
            return ngnToUsd * usdToTarget;
        }
    }

    throw new Error(`Could not fetch exchange rate for ${toCurrency}`);
}

/** Internal helper to fetch a single rate pair. Returns null on failure. */
async function fetchRate(from: string, to: string): Promise<number | null> {
    try {
        const res = await flwFetch(`/v3/rates?from=${from}&to=${to}&amount=1`);
        const data = await res.json();

        if (data.status === 'success' && data.data) {
            const rate = data.data.to?.amount ?? data.data.rate;
            if (rate) return Number(rate);
        }

        console.warn(`Rate pair ${from}→${to} not available:`, data.message || data);
        return null;
    } catch (error) {
        console.warn(`Error fetching rate ${from}→${to}:`, error);
        return null;
    }
}

