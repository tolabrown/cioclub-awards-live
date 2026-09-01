import { json } from '@sveltejs/kit';
import { db } from '$lib/db';
import { membershipPayment, user, membershipInquiry } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { calculateSubscriptionYearsFromKobo, calculateExtendedExpiry } from '$lib/utils/subscription';
import { SUPPORTED_CURRENCIES } from '$lib/constants/currencies';
import { logActivity } from '$lib/server/activity-log';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const secretHash = env.FLUTTERWAVE_SECRET_HASH || env.FLUTTERWAVE_SECRET_KEY || env.FW_SECRET_KEY;
  const signature = request.headers.get('verif-hash');

  if (secretHash && signature && signature !== secretHash) {
    console.warn('[Flutterwave Webhook] Invalid verif-hash signature attempt');
    return json({ error: 'Invalid signature' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (body?.event === 'charge.completed' && body?.data?.status === 'successful') {
    const tx_ref = body.data.tx_ref;

    try {
      // 1. Find the payment record
      const [payment] = await db
        .select()
        .from(membershipPayment)
        .where(eq(membershipPayment.reference, tx_ref));

      if (payment && payment.status !== 'success') {
        // 2. Mark as success
        await db
          .update(membershipPayment)
          .set({ status: 'success', updatedAt: new Date() })
          .where(eq(membershipPayment.reference, tx_ref));

        if (payment.userId) {
          // 3. Get current user
          const [currentUser] = await db
            .select()
            .from(user)
            .where(eq(user.id, payment.userId));

          // 4. Calculate subscription expiry
          const yearsPaid = calculateSubscriptionYearsFromKobo(payment.tier, payment.amount);
          const newExpiry = calculateExtendedExpiry(currentUser?.subscriptionEndsAt, yearsPaid);

          const isCorporate = payment.tier.toLowerCase().includes('corporate');
          const targetRole = isCorporate ? 'member_corporate' : 'member_individual';

          // 5. Update user role & subscription
          await db
            .update(user)
            .set({
              role: targetRole,
              subscriptionEndsAt: newExpiry,
              updatedAt: new Date()
            })
            .where(eq(user.id, payment.userId));

          // 6. Update inquiry status
          await db
            .update(membershipInquiry)
            .set({ status: 'approved' })
            .where(eq(sql`lower(${membershipInquiry.email})`, payment.email.toLowerCase()));

          // 7. Send confirmation email
          try {
            const { EmailService } = await import('$lib/server/emailservice');
            const currency = SUPPORTED_CURRENCIES.find(c => c.code === payment.currency);
            const amountDisplay = currency 
                ? `${currency.symbol}${payment.convertedAmount?.toLocaleString()}`
                : `${payment.currency} ${payment.convertedAmount?.toLocaleString()}`;

            await EmailService.sendMembershipConfirmation(
              payment.email,
              payment.fullName,
              payment.tier,
              amountDisplay
            );
          } catch (emailErr) {
            console.error('[Flutterwave Webhook] Email error:', emailErr);
          }

          // 8. Log activity
          await logActivity(null, {
            userId: payment.userId,
            action: `Membership payment confirmed via Flutterwave webhook (${payment.tier})`,
            operation: "UPDATE",
            entityType: "membership_payment",
            entityId: payment.id,
            metadata: { reference: tx_ref, amount: payment.amount, tier: payment.tier, currency: payment.currency }
          });
        }
      }
    } catch (dbErr) {
      console.error('[Flutterwave Webhook] Error processing charge.completed:', dbErr);
      return json({ error: 'Database error' }, { status: 500 });
    }
  }

  return json({ received: true }, { status: 200 });
};
