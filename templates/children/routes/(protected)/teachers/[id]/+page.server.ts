import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { FieldsPlural } from '$lib/constants';
import { getTeacher } from '$lib/db/teacher';
import type { iTeacher } from '$lib/interface';
import { pageGuard } from '$lib/server';

export const load = (async ({ locals, params }) => { 
  await pageGuard(params.id, locals, FieldsPlural.TEACHER);

  const teacher = await getTeacher(params.id) as iTeacher;

  if (!teacher) {
    throw redirect(303, '/teachers');
  }

  return { teacher };
}) satisfies PageServerLoad;
