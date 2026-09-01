import { json } from '@sveltejs/kit';
import { createHmac } from 'crypto';
import { db } from '$lib/db';
import { membershipPayment, user, membershipInquiry } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { calculateSubscriptionYearsFromKobo, calculateExtendedExpiry } from '$lib/utils/subscription';
import { logActivity } from '$lib/server/activity-log';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  if (!signature || !env.PS_SECRET_KEY) {
    return json({ error: 'Missing signature or configuration' }, { status: 400 });
  }

  // Verify HMAC SHA512 signature
  const hash = createHmac('sha512', env.PS_SECRET_KEY).update(rawBody).digest('hex');
  if (hash !== signature) {
    console.warn('[Paystack Webhook] Invalid signature attempt');
    return json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    return json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  if (event.event === 'charge.success' && event.data?.status === 'success') {
    const reference = event.data.reference;

    try {
      // 1. Find the payment record
      const [payment] = await db
        .select()
        .from(membershipPayment)
        .where(eq(membershipPayment.reference, reference));

      if (payment && payment.status !== 'success') {
        // 2. Mark as success
        await db
          .update(membershipPayment)
          .set({ status: 'success', updatedAt: new Date() })
          .where(eq(membershipPayment.reference, reference));

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
            await EmailService.sendMembershipConfirmation(
              payment.email,
              payment.fullName,
              payment.tier,
              `₦${(payment.amount / 100).toLocaleString()}`
            );
          } catch (emailErr) {
            console.error('[Paystack Webhook] Email error:', emailErr);
          }

          // 8. Log activity
          await logActivity(null, {
            userId: payment.userId,
            action: `Membership payment confirmed via Paystack webhook (${payment.tier})`,
            operation: "UPDATE",
            entityType: "membership_payment",
            entityId: payment.id,
            metadata: { reference, amount: payment.amount, tier: payment.tier }
          });
        }
      }
    } catch (dbErr) {
      console.error('[Paystack Webhook] Error processing charge.success:', dbErr);
      return json({ error: 'Database error' }, { status: 500 });
    }
  }

  return json({ received: true }, { status: 200 });
};
