import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { doctor, doctorAvailability } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const {
      name,
      specialty,
      price,
      bio,
      image,
      bankCode,
      accountNumber,
      accountName,
      legalAccepted,
      licenseUrl
    } = data;

    if (!legalAccepted) {
      return json({ success: false, message: 'Legal terms must be accepted' }, { status: 400 });
    }

    // 1. Create Paystack Transfer Recipient
    const recipientRes = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'nuban',
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: 'NGN'
      })
    });

    const recipientData = await recipientRes.json();
    if (!recipientData.status) {
      return json({ success: false, message: recipientData.message || 'Failed to create transfer recipient' }, { status: 400 });
    }

    const paystackRecipientCode = recipientData.data.recipient_code;

    // 2. Save to Database (Upsert based on userId)
    const existingDoctor = await db.query.doctor.findFirst({
      where: eq(doctor.userId, user.id)
    });

    let doctorId: string;

    if (existingDoctor) {
      doctorId = existingDoctor.id;
      await db.update(doctor)
        .set({
          name,
          specialty,
          price: parseInt(price) * 100, // store in kobo
          bio,
          image,
          bankName: data.bankName,
          accountNumber,
          accountName,
          paystackRecipientCode,
          legalAccepted: true,
          available: 'Today',
          verified: false, // Reset or keep? Let's say keep false until admin checks
          approved: false,
          licenseUrl
        })
        .where(eq(doctor.userId, user.id));
    } else {
      const [newDoctor] = await db.insert(doctor).values({
        userId: user.id,
        name,
        specialty,
        price: parseInt(price) * 100,
        bio,
        image,
        bankName: data.bankName,
        accountNumber,
        accountName,
        paystackRecipientCode,
        legalAccepted: true,
        available: 'Today',
        verified: false,
        approved: false,
        licenseUrl
      }).returning({ id: doctor.id });
      doctorId = newDoctor.id;
    }

    // 3. Save Availability Slots if provided
    if (data.availabilitySlots && Array.isArray(data.availabilitySlots)) {
      // First clear existing availability
      await db.delete(doctorAvailability).where(eq(doctorAvailability.doctorId, doctorId));

      if (data.availabilitySlots.length > 0) {
        await db.insert(doctorAvailability).values(
          data.availabilitySlots.map((slot: any) => ({
            doctorId: doctorId,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime
          }))
        );
      }
    }

    return json({ success: true, message: 'Doctor onboarded successfully' });
  } catch (error: any) {
    console.error('Onboarding error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
