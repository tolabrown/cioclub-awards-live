import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getMemory } from '$lib/db/memory';

export const load: PageServerLoad = async ({ params }) => {
  const memoryId = params.id;
  const memory = await getMemory(memoryId);

  if (!memory) {
    throw error(404, 'Memory not found');
  }

  return {
    memory
  };
};
