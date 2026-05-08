import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addConsultation, updateConsultation, getConsultations } from '$lib/db/consultation';
import { db } from '$lib/db/drizzle';
import { doctor, consultation } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import { sendConsultationNotification } from '$lib/server/notifications';

const CONSULTATION_PRICES: Record<string, number> = {
  general: 15000,
  specialist: 25000,
  mental_health: 20000,
  emergency: 35000
};

export const GET: RequestHandler = async ({ locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const consultations = await getConsultations(user.id);
    return json({ success: true, data: consultations });
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
    const { consultationId, doctorId, type, appointmentDate, appointmentTime, reason, adminFee } = data;

    let targetConsultation;
    let basePrice;
    let serviceCharge;
    let totalFee;

    if (consultationId) {
      // RETRY LOGIC: Use existing consultation
      targetConsultation = await db.query.consultation.findFirst({
        where: eq(consultation.id, consultationId),
        with: { user: true }
      });

      if (!targetConsultation) {
        return json({ success: false, message: 'Consultation not found' }, { status: 404 });
      }

      if (targetConsultation.paid) {
        return json({ success: false, message: 'Consultation already paid' }, { status: 400 });
      }

      totalFee = (targetConsultation.totalFee || 0) / 100;
    } else {
      // NEW BOOKING LOGIC
      basePrice = CONSULTATION_PRICES[type] || 15000;

      // If doctor is provided, use their custom price
      if (doctorId) {
        const dr = await db.query.doctor.findFirst({
          where: eq(doctor.id, doctorId)
        });
        if (dr) {
          basePrice = dr.price / 100; // converted back to naira for standard map compliance or just used directly
        }
      }

      serviceCharge = Math.round(basePrice * 0.15);
      totalFee = basePrice + serviceCharge + (adminFee || 0);

      // 1. Create a pending consultation
      targetConsultation = await addConsultation({
        userId: user.id,
        doctorId,
        type,
        appointmentDate: new Date(appointmentDate),
        appointmentTime,
        reason,
        status: 'pending',
        paid: false,
        totalFee: totalFee * 100, // store in kobo
        serviceCharge: serviceCharge * 100, // store in kobo
        adminFee: (adminFee || 0) * 100 // store in kobo
      });
    }

    // 2. Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: targetConsultation.totalFee || 0, // in kobo
        currency: 'NGN',
        callback_url: `${url.origin}/telemedicine/verify`,
        metadata: {
          consultationId: targetConsultation.id,
          userId: user.id,
          appointment_date: targetConsultation.appointmentDate,
          appointment_time: targetConsultation.appointmentTime,
          custom_fields: [
            {
              display_name: "Consultation Type",
              variable_name: "consultation_type",
              value: targetConsultation.type
            },
            {
              display_name: "Appointment Date",
              variable_name: "appointment_date",
              value: new Date(targetConsultation.appointmentDate).toLocaleDateString()
            },
            {
              display_name: "Appointment Time",
              variable_name: "appointment_time",
              value: targetConsultation.appointmentTime
            }
          ]
        },
        reference: `CONS_${targetConsultation.id}_${Date.now()}`
      })
    });

    if (!paystackResponse.ok) {
      const errorData = await paystackResponse.json();
      return json({ success: false, message: 'Payment initialization failed', error: errorData }, { status: 500 });
    }

    const paystackData = await paystackResponse.json();

    return json({
      success: true,
      payment_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      consultationId: targetConsultation.id
    });

  } catch (error: any) {
    console.error('Consultation error:', error);
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
      const consultationId = verifyData.data.metadata.consultationId;

      await updateConsultation(consultationId, {
        paid: true,
        status: 'confirmed'
      });

      // 3. Send notifications
      await sendConsultationNotification(consultationId);

      return json({ success: true, message: 'Payment verified', consultationId });
    } else {
      return json({ success: false, message: 'Payment not successful' }, { status: 400 });
    }

  } catch (error: any) {
    return json({ success: false, message: error.message }, { status: 500 });
  }
};
