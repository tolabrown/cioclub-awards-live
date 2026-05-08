import { env } from '$env/dynamic/private';
import { getConsultation } from '$lib/db/consultation';
import { db } from '$lib/db/drizzle';
import { user } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function sendConsultationNotification(consultationId: string) {
	const consultation = await getConsultation(consultationId);
	if (!consultation) return;

	const patient = await db.query.user.findFirst({
		where: eq(user.id, consultation.userId)
	});

	if (!patient) return;

	const doctor = consultation.doctor;
	const doctorUser = doctor?.userId
		? await db.query.user.findFirst({ where: eq(user.id, doctor.userId) })
		: null;

	const date = new Date(consultation.appointmentDate).toLocaleDateString('en-NG', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	const time = consultation.appointmentTime;

	const streamLink = `https://enoshkind.com/telemedicine/${consultation.id}/stream`;

	const emails = [
		{
			to: 'support@chanieldigitalhealth.com',
			subject: `New Consultation Booked: ${patient.name} with Dr. ${doctor?.name || 'Specialist'}`,
			message: `
				<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
					<h2>New Consultation Booking</h2>
					<p>A new consultation has been booked on the platform.</p>
					<hr />
					<p><strong>Patient:</strong> ${patient.name} (${patient.email})</p>
					<p><strong>Doctor:</strong> Dr. ${doctor?.name || 'Pending'} (${doctor?.specialty || 'General'})</p>
					<p><strong>Date:</strong> ${date}</p>
					<p><strong>Time:</strong> ${time}</p>
					<p><strong>Reason:</strong> ${consultation.reason || 'N/A'}</p>
					<p><strong>Total Fee:</strong> ₦${((consultation.totalFee || 0) / 100).toLocaleString()}</p>
					<br />
					<p><strong>Video Stream Link:</strong> <a href="${streamLink}">${streamLink}</a></p>
				</div>
			`
		},
		{
			to: doctorUser?.email,
			subject: `New Consultation Assigned: ${patient.name}`,
			message: `
				<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
					<h2>Hello Dr. ${doctor?.name},</h2>
					<p>You have a new consultation booked with ${patient.name}.</p>
					<hr />
					<p><strong>Patient Name:</strong> ${patient.name}</p>
					<p><strong>Scheduled Date:</strong> ${date}</p>
					<p><strong>Scheduled Time:</strong> ${time}</p>
					<p><strong>Reason for Visit:</strong> ${consultation.reason || 'Not specified'}</p>
					<br />
					<p><strong>Join Consultation:</strong> <a href="${streamLink}">${streamLink}</a></p>
					<p>Please log in to the Practitioner Portal to view details and join the call at the scheduled time.</p>
				</div>
			`
		},
		{
			to: patient.email,
			subject: `Consultation Booking Confirmed: Dr. ${doctor?.name}`,
			message: `
				<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
					<h2>Hello ${patient.name},</h2>
					<p>Your consultation with Dr. ${doctor?.name} has been successfully booked and confirmed.</p>
					<hr />
					<p><strong>Doctor:</strong> Dr. ${doctor?.name} (${doctor?.specialty})</p>
					<p><strong>Date:</strong> ${date}</p>
					<p><strong>Time:</strong> ${time}</p>
					<br />
					<p><strong>Join Consultation:</strong> <a href="${streamLink}">${streamLink}</a></p>
					<p>You can also join the consultation from your Telemedicine Activity center 10 minutes before the scheduled time.</p>
					<p>Thank you for choosing Chaniel Digital Health.</p>
				</div>
			`
		}
	].filter((e) => e.to);

	// Preparation for metadata
	try {
		const startTime = new Date(consultation.appointmentDate);
		const timeStr = time || '09:00 AM';
		const [timePart, ampm] = timeStr.split(' ');
		let [hours, minutes] = timePart.split(':').map(Number);

		if (ampm === 'PM' && hours !== 12) hours += 12;
		if (ampm === 'AM' && hours === 12) hours = 0;

		startTime.setHours(hours, minutes, 0, 0);

		const endTime = new Date(startTime.getTime() + 45 * 60 * 1000); // 45 minutes duration

		const metadata = {
			guests: [patient.email, doctorUser?.email].filter(Boolean),
			startTime: startTime.toISOString(),
			endTime: endTime.toISOString(),
			description: `Consultation Agenda: ${consultation.reason || 'General health consultation'} with Dr. ${doctor?.name}\n\nJoin Video Stream: ${streamLink}`,
			streamLink
		};

		await fetch(env.CONSULT_NOTIFICATION, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				emails,
				metadata
			})
		});
	} catch (error) {
		console.error('Failed to send consultation notification metadata/fetch:', error);
	}
}
