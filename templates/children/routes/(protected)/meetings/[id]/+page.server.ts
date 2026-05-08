import { FieldsPlural } from '$lib/constants';
import { getMeeting } from '$lib/db/meeting';
import { pageGuard } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {

  const { id } = params

  await pageGuard(id, locals, FieldsPlural.MEETING);
  
  const promise = async () => await getMeeting(id)
  return { promise: promise() };
}) satisfies PageServerLoad;
