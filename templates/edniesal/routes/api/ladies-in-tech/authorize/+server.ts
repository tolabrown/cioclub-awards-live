import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { ladiesInTechRegistrations } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { flwFetch } from '$lib/flutterwave';

/**
 * Handles OTP/PIN authorization for Flutterwave v4 General Flow.
 * Called after the initial charge requires OTP authorization.
 */
export const POST = async ({ request }) => {
  try {
    const { chargeId, otp } = await request.json();

    if (!chargeId || !otp) {
      return json({ success: false, error: 'Missing chargeId or OTP' }, { status: 400 });
    }

    // Send OTP to Flutterwave to authorize the charge
    const res = await flwFetch(`/charges/${chargeId}/authorize`, {
      method: 'POST',
      body: JSON.stringify({ otp })
    });

    const result = await res.json();

    if (result.status !== 'success') {
      console.error('OTP authorization failed:', result);
      return json({ success: false, error: result.message || 'Authorization failed' }, { status: 400 });
    }

    const chargeData = result.data;

    if (chargeData?.status !== 'successful') {
      return json({ success: false, error: 'Payment not successful after OTP' }, { status: 400 });
    }

    // Update the registration status in the DB
    const tx_ref = chargeData.reference;
    const [reg] = await db
      .update(ladiesInTechRegistrations)
      .set({ status: 'success' })
      .where(eq(ladiesInTechRegistrations.paymentRef, tx_ref))
      .returning();

    if (!reg) {
      return json({ success: false, error: 'Registration not found for this payment' }, { status: 404 });
    }

    return json({ success: true, registrationId: reg.id });
  } catch (e) {
    console.error('OTP authorization error:', e);
    return json({ success: false, error: 'Authorization failed' }, { status: 500 });
  }
};
