import { FieldsPlural } from '$lib/constants';
import { getChild } from '$lib/db/child';
import { pageGuard } from '$lib/server';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, locals }) => {

  const { id } = params

  await pageGuard(id, locals, FieldsPlural.CHILD);
  const promise = async () => await getChild(id)
  return { promise: promise() };
}) satisfies PageServerLoad;
