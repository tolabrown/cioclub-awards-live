import { db } from '$lib/db';
import { pageContent, membershipInquiry, membershipPayment } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { fail, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { auth } from '$lib/auth';
import type { PageServerLoad, Actions } from './$types';
import { MEMBERSHIP_DEFAULT } from '$lib/constants/defaults';
import { flwFetch, getExchangeRate } from '$lib/server/flutterwave';

const PATH = '/membership';

export const load: PageServerLoad = async ({ request, locals, url }) => {
  let session;
  try {
    session = await auth.api.getSession({ headers: request.headers });
  } catch (error) {
    console.error("[Membership Register] Session retrieval failed:", error);
    session = null;
  }

  if (!session) {
    throw redirect(302, `/auth/login?redirectTo=${url.pathname}${url.search}`);
  }

  const tierId = url.searchParams.get('tierId');
  if (!tierId) {
    throw redirect(302, '/membership');
  }

  const contentRecord = await db.query.pageContent.findFirst({
    where: eq(pageContent.path, PATH)
  });

  const rawData = contentRecord?.data ? JSON.parse(contentRecord.data) : MEMBERSHIP_DEFAULT;
  const tiers = rawData?.tiers || [];
  const selectedTier = tiers.find((t: any) => t.id === tierId);

  if (!selectedTier) {
    throw redirect(302, '/membership');
  }

  return {
    user: session.user,
    selectedTier
  };
};

export const actions: Actions = {
  initializePayment: async ({ request, locals, url }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return fail(401, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const fullName = formData.get('fullName') as string;
    const email = (formData.get('email') as string)?.toLowerCase();
    const organization = formData.get('organization') as string;
    const jobTitle = formData.get('jobTitle') as string;
    const phone = formData.get('phone') as string;
    const contactDetails = formData.get('contactDetails') as string;
    const previousRole = formData.get('previousRole') as string;
    const sector = formData.get('sector') as string;
    const currentLocation = formData.get('currentLocation') as string;
    const areasOfExpertise = formData.get('areasOfExpertise') as string;
    const interests = formData.get('interests') as string;
    const collaborationGoals = formData.get('collaborationGoals') as string;

    const tierId = formData.get('tierId') as string;
    const amount = parseInt(formData.get('amount') as string);
    const currency = (formData.get('currency') as string) || 'NGN';
    const clientConvertedAmount = parseInt(formData.get('convertedAmount') as string);

    const sharedMetadata = {
      fullName,
      organization,
      jobTitle,
      phone,
      tierId,
      contactDetails,
      previousRole,
      sector,
      currentLocation,
      areasOfExpertise,
      interests,
      collaborationGoals,
    };

    if (!fullName || !email || !organization || !jobTitle || !tierId || !amount) {
      return fail(400, { message: 'All fields are required' });
    }

    const reference = `MEM-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

    try {
      let authorization_url = '';
      let finalConvertedAmount = amount * 100; // default to NGN kobo

      if (currency === 'NGN') {
        // 1a. Initialize with Paystack
        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.PS_SECRET_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            amount: amount * 100, // Paystack expects kobo
            reference,
            callback_url: `${request.headers.get('origin')}/api/membership/callback/paystack`,
            metadata: sharedMetadata
          })
        });

        const data = await response.json();
        if (!data.status) {
          console.error('Paystack initialization failed:', data);
          return fail(500, { message: data.message || 'Payment initialization failed' });
        }
        authorization_url = data.data.authorization_url;
      } else {
        // 1b. Initialize with Flutterwave
        // Verify exchange rate on server side
        const rate = await getExchangeRate(currency);
        finalConvertedAmount = Math.ceil(amount * rate);

        const response = await flwFetch('/v3/payments', {
          method: 'POST',
          body: JSON.stringify({
            tx_ref: reference,
            amount: finalConvertedAmount,
            currency: currency,
            redirect_url: `${request.headers.get('origin')}/api/membership/callback/flutterwave`,
            customer: {
              email,
              name: fullName,
              phonenumber: phone,
            },
            customizations: {
              title: "Membership Subscription",
              description: `Subscription for ${tierId} tier`,
              logo: "https://cioclub.africa/logo.png" // Replace with actual logo
            },
            meta: sharedMetadata
          })
        });

        const data = await response.json();
        if (data.status !== 'success') {
          console.error('Flutterwave initialization failed:', data);
          return fail(500, { message: data.message || 'Payment initialization failed' });
        }
        authorization_url = data.data.link;
      }

      // 2. Record pending payment
      await db.insert(membershipPayment).values({
        email,
        fullName,
        tier: tierId,
        amount: amount * 100,
        currency,
        convertedAmount: finalConvertedAmount,
        reference,
        status: 'pending',
        metadata: JSON.stringify(sharedMetadata),
        userId: session.user.id
      });

      await db.insert(membershipInquiry).values({
        fullName,
        email,
        organization,
        jobTitle,
        phone,
        tier: tierId,
        currency,
        contactDetails,
        previousRole,
        sector,
        currentLocation,
        areasOfExpertise,
        interests,
        collaborationGoals,
        status: 'pending'
      });

      // 3. Update user profile details
      const { user } = await import('$lib/db/schema');
      await db.update(user).set({
        contactDetails,
        previousRole,
        sector,
        currentLocation,
        areasOfExpertise,
        interests,
        collaborationGoals,
        updatedAt: new Date()
      }).where(eq(user.id, session.user.id));

      const { logActivity } = await import('$lib/server/activity-log');
      await logActivity({ user: session.user }, {
        action: `Initialized membership payment for ${tierId} tier`,
        operation: "CREATE",
        entityType: "membership_payment",
        metadata: { tierId, currency, amount }
      });

      return { success: true, authorization_url, reference };
    } catch (e) {
      console.error('Error in initializePayment:', e);
      return fail(500, { message: 'Internal server error during payment initialization' });
    }
  }
};
