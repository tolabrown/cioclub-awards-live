import { json } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { doctor } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { doctorId, approved } = await request.json();

    if (!doctorId) {
      return json({ success: false, message: 'Doctor ID is required' }, { status: 400 });
    }

    await db.update(doctor)
      .set({
        approved: approved,
        verified: approved // Also update verification status if approved
      })
      .where(eq(doctor.id, doctorId));

    return json({
      success: true,
      message: approved ? 'Doctor approved successfully' : 'Doctor status updated'
    });
  } catch (error: any) {
    console.error('Approval error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
