import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { membershipPayment, user, membershipInquiry } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { calculateSubscriptionYearsFromKobo, calculateExtendedExpiry } from '$lib/utils/subscription';
import { SUPPORTED_CURRENCIES } from '$lib/constants/currencies';
import { logActivity } from '$lib/server/activity-log';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const status = url.searchParams.get('status');
  const tx_ref = url.searchParams.get('tx_ref');
  const transaction_id = url.searchParams.get('transaction_id');

  if (!tx_ref) {
    throw redirect(303, '/membership?error=no_reference');
  }

  if (status === 'successful' || status === 'completed') {
    try {
      // 1. Verify via Flutterwave REST API
      const secretKey = env.FLUTTERWAVE_SECRET_KEY || env.FW_SECRET_KEY;
      const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secretKey}`
        }
      });

      const verification = await response.json();

      if (
        verification?.status === 'success' &&
        verification?.data?.status === 'successful' &&
        verification?.data?.tx_ref === tx_ref
      ) {
        // 2. Get payment and user details
        const [payment] = await db.select()
          .from(membershipPayment)
          .where(eq(membershipPayment.reference, tx_ref));

        // 3. Update Payment Status
        await db.update(membershipPayment)
          .set({ status: 'success' })
          .where(eq(membershipPayment.reference, tx_ref));

        if (payment && payment.userId) {
          // 4. Get current user
          const [currentUser] = await db.select()
            .from(user)
            .where(eq(user.id, payment.userId));

          // 5. Calculate New Expiry
          // We use the original Naira amount (payment.amount) for consistency in term calculation
          const yearsPaid = calculateSubscriptionYearsFromKobo(payment.tier, payment.amount);
          const newExpiry = calculateExtendedExpiry(currentUser?.subscriptionEndsAt, yearsPaid);

          // Map tier to role
          const isCorporate = payment.tier.toLowerCase().includes('corporate');
          const targetRole = isCorporate ? 'member_corporate' : 'member_individual';

          // 6. Update User
          await db.update(user)
            .set({
              role: targetRole,
              subscriptionEndsAt: newExpiry,
              updatedAt: new Date()
            })
            .where(eq(user.id, payment.userId));

          // 7. Update Inquiry Status
          await db.update(membershipInquiry)
            .set({ status: 'approved' })
            .where(eq(sql`lower(${membershipInquiry.email})`, payment.email.toLowerCase()));

          // 8. Send Confirmation Email
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
          } catch (emailError) {
            console.error('Failed to send membership confirmation email:', emailError);
          }

          // 9. Log the successful payment
          await logActivity(null, {
            userId: payment.userId,
            action: `Membership payment successful (${payment.tier}) via Flutterwave`,
            operation: "UPDATE",
            entityType: "membership_payment",
            entityId: payment.id,
            metadata: { reference: tx_ref, amount: payment.amount, tier: payment.tier, currency: payment.currency }
          });
        }

        throw redirect(303, '/dashboard?status=success&ref=' + tx_ref);
      }
    } catch (e: any) {
      if (e.status === 303) throw e;
      console.error('Flutterwave verification error:', e);
    }
  }

  // If we reach here, payment failed or was invalid
  await db.update(membershipPayment)
    .set({ status: 'failed' })
    .where(eq(membershipPayment.reference, tx_ref || ''));

  throw redirect(303, '/membership?status=error&message=Payment failed or was cancelled');
};
