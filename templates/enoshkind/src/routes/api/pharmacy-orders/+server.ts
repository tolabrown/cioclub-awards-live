import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addPharmacyOrder, getPharmacyOrders, updatePharmacyOrder } from '$lib/db/pharmacy';
import { env } from '$env/dynamic/private';

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await getPharmacyOrders(user.id);
    return json({ success: true, data: orders });
  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request, locals, url }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { pharmacyName, totalAmount, medicationName, prescriptionId } = data;

    // 1. Create a pending pharmacy order
    const order = await addPharmacyOrder({
      userId: user.id,
      pharmacyName: pharmacyName || 'Partner Pharmacy',
      status: 'pending',
      totalAmount, // in kobo
      paid: false
    });

    // 2. Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: totalAmount, // already in kobo from frontend
        currency: 'NGN',
        callback_url: `${url.origin}/telemedicine/verify?type=pharmacy`,
        metadata: {
          orderId: order.id,
          userId: user.id,
          type: 'pharmacy',
          pharmacyName,
          medicationName,
          prescriptionId
        },
        reference: `PHARM_${order.id}_${Date.now()}`
      })
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.ok ? {} : await paystackResponse.json();
      return json({ success: false, message: 'Payment initialization failed', error: errorData }, { status: 500 });
    }

    const paystackData = await paystackResponse.json();

    return json({
      success: true,
      payment_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      orderId: order.id
    });

  } catch (error: any) {
    console.error('Pharmacy order error:', error);
    return json({ success: false, message: error.message }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reference } = await request.json();

    // Verify payment with Paystack
    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      }
    });

    if (!verifyResponse.ok) {
      return json({ success: false, message: 'Payment verification failed' }, { status: 400 });
    }

    const verifyData = await verifyResponse.json();

    if (verifyData.data.status === 'success') {
      const orderId = verifyData.data.metadata.orderId;

      await updatePharmacyOrder(orderId, {
        paid: true,
        status: 'processing'
      });

      return json({ success: true, message: 'Payment verified', orderId });
    } else {
      return json({ success: false, message: 'Payment not successful' }, { status: 400 });
    }

  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
