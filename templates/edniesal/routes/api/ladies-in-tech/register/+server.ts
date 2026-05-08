import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { ladiesInTechRegistrations } from '$lib/db/schema';
import { env } from '$env/dynamic/private';

export const POST = async ({ request, url }) => {
  try {
    const data = await request.json();
    const {
      eventId, firstName, lastName, email, phone,
      country, organization, designation, category, amount
    } = data;

    if (!eventId || !email || !amount) {
      return json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const tx_ref = `LIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create pending registration record in DB
    await db.insert(ladiesInTechRegistrations).values({
      eventId,
      firstName,
      lastName,
      email,
      phone,
      country,
      organization,
      designation,
      category,
      amount: amount.toString(),
      status: 'pending',
      paymentRef: tx_ref
    });

    // Initiate hosted payment via Flutterwave v3 REST API
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.FW_SECRET_KEY}`
      },
      body: JSON.stringify({
        tx_ref,
        amount,
        currency: 'USD',
        redirect_url: `${url.origin}/api/ladies-in-tech/payment-callback`,
        customer: {
          email,
          phonenumber: phone,
          name: `${firstName} ${lastName}`
        },
        customizations: {
          title: 'Ladies in Tech & Leadership',
          description: category === 'package'
            ? 'Full Experience Package — Conference + Hotel + Transfers'
            : 'Conference-Only Pass',
          logo: `${url.origin}/logo.png`
        },
        meta: { country, organization, designation, category }
      })
    });

    const result = await response.json();

    if (result?.status === 'success' && result?.data?.link) {
      return json({ success: true, paymentLink: result.data.link });
    }

    console.error('Flutterwave initiation failed:', result);
    return json({ success: false, error: result?.message || 'Payment initiation failed' }, { status: 500 });

  } catch (e) {
    console.error('Registration error:', e);
    return json({ success: false, error: 'Failed to process registration' }, { status: 500 });
  }
};
