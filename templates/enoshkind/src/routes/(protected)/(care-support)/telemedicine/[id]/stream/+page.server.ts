import { auth } from '$lib/auth';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/drizzle';
import { consultation } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateUserToken, getCallId } from '$lib/server/stream';
import { env } from '$env/dynamic/private';
import type { iConsultation } from '$lib/interface';
import type { StreamConfig } from './stream.svelte';

export const load = (async ({ request, locals, params }) => {
  const session = await auth.api.getSession({
    headers: request.headers
  });

  if (!session) {
    throw redirect(302, '/auth/login');
  }

  const currentUser = locals.user;
  if (!currentUser) {
    throw redirect(302, '/auth/login');
  }

  const consultationId = params.id;

  // Fetch consultation details
  const [consultationData] = await db
    .select()
    .from(consultation)
    .where(eq(consultation.id, consultationId))
    .limit(1);

  if (!consultationData) {
    throw redirect(302, '/telemedicine');
  }

  // Verify payment before allowing video call
  if (!consultationData.paid) {
    throw redirect(302, `/telemedicine?error=unpaid`);
  }

  // Generate GetStream user token
  const userToken = await generateUserToken(currentUser.id);
  const callId = getCallId(consultationId);

  // Calculate consultation duration based on type
  const consultationDurations: Record<string, number> = {
    quick: 15,
    general: 45,
    standard: 45,
    extended: 60
  };
  const duration = consultationDurations[consultationData.type || 'standard'] || 45;

  return {
    user: currentUser,
    consultation: consultationData as iConsultation,
    stream: {
      apiKey: env.GETSTREAM_API_KEY!,
      token: userToken,
      userId: currentUser.id,
      userName: currentUser.name,
      callId,
      callType: 'default'
    } as StreamConfig,
    consultationDuration: duration
  };
}) satisfies PageServerLoad;
