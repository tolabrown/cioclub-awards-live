import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/db/drizzle';
import { attendee } from '$lib/db/schema';
import { logActivity } from '$lib/db/log';
import { checkDuplicateAttendee } from '$lib/db/attendee';

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const data = await request.json();
    const { meetingId, childIds, notes } = data;

    if (!meetingId || !childIds || !Array.isArray(childIds) || childIds.length === 0) {
      return json({ status: 'error', message: 'Invalid request data' }, { status: 400 });
    }

    const results = {
      success: 0,
      failed: 0,
      duplicates: 0
    };

    // Process each child
    // In a real high-throughput scenario, we'd do a bulk insert with ON CONFLICT DO NOTHING,
    // but we need to check duplicates specifically to report them and log activities individually or in batch.

    // 1. Fetch meeting details once for logging
    const meetingDetails = await db.query.meeting.findFirst({
      where: (meeting, { eq }) => eq(meeting.id, meetingId),
      columns: { type: true, datetime: true }
    });

    for (const childId of childIds) {
      // Check duplicate
      const isDuplicate = await checkDuplicateAttendee(childId, meetingId);
      if (isDuplicate) {
        results.duplicates++;
        results.failed++;
        continue;
      }

      try {
        const newAttendee = await db.insert(attendee).values({
          child: childId,
          meeting: meetingId,
          notes: notes || '',
        }).returning();

        if (newAttendee.length > 0) {
          results.success++;

          // Log activity (fire and forget to speed up)
          // Fetch child name for log
          const childDetails = await db.query.child.findFirst({
            where: (child, { eq }) => eq(child.id, childId),
            columns: { name: true }
          });

          logActivity({
            user,
            action: "CREATE",
            entity: "Attendee",
            entityId: newAttendee[0].id,
            details: {
              meeting: meetingDetails?.type,
              meetingDate: meetingDetails?.datetime,
              child: childDetails?.name,
              bulk: true
            }
          });
        }
      } catch (err) {
        console.error(`Failed to add child ${childId}`, err);
        results.failed++;
      }
    }

    return json({
      status: 'success',
      data: results,
      message: `Processed ${childIds.length} records. Success: ${results.success}, Duplicates: ${results.duplicates}`
    });

  } catch (error: any) {
    console.error("Bulk add error:", error);
    return json({ status: 'error', message: error.message }, { status: 500 });
  }
};
