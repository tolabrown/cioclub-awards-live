import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { membershipPayment, user, membershipInquiry } from '$lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { PS_SECRET_KEY } from '$env/static/private';
import { calculateSubscriptionYearsFromKobo, calculateExtendedExpiry } from '$lib/utils/subscription';
import { logActivity } from '$lib/server/activity-log';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const reference = url.searchParams.get('reference');

  if (!reference) {
    throw redirect(303, '/membership?error=no_reference');
  }

  try {
    // 1. Verify transaction with Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PS_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      // 2. Get payment and user details
      const [payment] = await db.select()
        .from(membershipPayment)
        .where(eq(membershipPayment.reference, reference));

      // 3. Update Payment Status
      await db.update(membershipPayment)
        .set({ status: 'success' })
        .where(eq(membershipPayment.reference, reference));

      if (payment && payment.userId) {
        // 4. Get current user to check for existing expiry
        const [currentUser] = await db.select()
          .from(user)
          .where(eq(user.id, payment.userId));

        // 5. Calculate New Expiry (support multi-year and extension)
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

        // 6. Update Inquiry Status
        await db.update(membershipInquiry)
          .set({ status: 'approved' })
          .where(eq(sql`lower(${membershipInquiry.email})`, payment.email.toLowerCase()));

        // 7. Send Confirmation Email
        try {
          const { EmailService } = await import('$lib/server/emailservice');
          await EmailService.sendMembershipConfirmation(
            payment.email,
            payment.fullName,
            payment.tier,
            `₦${(payment.amount / 100).toLocaleString()}`
          );
        } catch (emailError) {
          console.error('Failed to send membership confirmation email:', emailError);
        }

        // 8. Log the successful payment
        await logActivity(null, {
          userId: payment.userId,
          action: `Membership payment successful (${payment.tier})`,
          operation: "UPDATE",
          entityType: "membership_payment",
          entityId: payment.id,
          metadata: { reference, amount: payment.amount, tier: payment.tier }
        });
      }

      // Redirect with success flag to dashboard
      throw redirect(303, '/dashboard?status=success&ref=' + reference);
    } else {
      // Mark as failed
      await db.update(membershipPayment)
        .set({ status: 'failed' })
        .where(eq(membershipPayment.reference, reference));

      throw redirect(303, '/membership?status=error&message=Payment failed or was cancelled');
    }
  } catch (e: any) {
    if (e.status === 303) throw e;
    console.error('Error verifying payment:', e);
    throw redirect(303, '/membership?status=error&message=Internal verification error');
  }
};
