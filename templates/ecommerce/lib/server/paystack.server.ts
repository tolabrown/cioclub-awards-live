import { env } from '$env/dynamic/private';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
    };
    paid_at: string;
    channel: string;
  };
}

/**
 * Initialize a Paystack transaction
 */
export async function initializeTransaction(params: {
  email: string;
  amount: number; // Amount in kobo (NGN * 100)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, any>;
}): Promise<{ success: boolean; data?: PaystackInitResponse['data']; error?: string }> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: params.email,
        amount: params.amount,
        reference: params.reference,
        callback_url: params.callback_url,
        metadata: params.metadata,
      }),
    });

    const result: PaystackInitResponse = await response.json();

    if (!result.status) {
      return { success: false, error: result.message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Paystack] Initialize error:', error);
    return { success: false, error: 'Failed to initialize payment' };
  }
}

/**
 * Verify a Paystack transaction
 */
export async function verifyTransaction(reference: string): Promise<{
  success: boolean;
  data?: PaystackVerifyResponse['data'];
  error?: string;
}> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const result: PaystackVerifyResponse = await response.json();

    if (!result.status) {
      return { success: false, error: result.message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Paystack] Verify error:', error);
    return { success: false, error: 'Failed to verify payment' };
  }
}

/**
 * Create a charge authorization (for saved cards)
 */
export async function chargeAuthorization(params: {
  email: string;
  amount: number;
  authorization_code: string;
  reference?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/charge_authorization`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!result.status) {
      return { success: false, error: result.message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Paystack] Charge error:', error);
    return { success: false, error: 'Failed to charge card' };
  }
}

/**
 * Create a refund
 */
export async function createRefund(params: {
  transaction: string; // Transaction reference or ID
  amount?: number; // Amount in kobo (optional, full refund if not specified)
}): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();

    if (!result.status) {
      return { success: false, error: result.message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Paystack] Refund error:', error);
    return { success: false, error: 'Failed to create refund' };
  }
}

/**
 * List transactions
 */
export async function listTransactions(params?: {
  perPage?: number;
  page?: number;
  from?: string;
  to?: string;
}): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.perPage) searchParams.set('perPage', params.perPage.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.from) searchParams.set('from', params.from);
    if (params?.to) searchParams.set('to', params.to);

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction?${searchParams}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const result = await response.json();

    if (!result.status) {
      return { success: false, error: result.message };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('[Paystack] List error:', error);
    return { success: false, error: 'Failed to list transactions' };
  }
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PAY-${timestamp}-${random}`.toUpperCase();
}
