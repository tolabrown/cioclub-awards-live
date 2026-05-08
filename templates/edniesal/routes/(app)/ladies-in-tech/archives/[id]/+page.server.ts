import { db } from '$lib/db/drizzle';
import { ladiesInTechArchives } from '$lib/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const archive = await db.query.ladiesInTechArchives.findFirst({
    where: eq(ladiesInTechArchives.id, params.id),
  });

  if (!archive) {
    throw error(404, 'Album not found');
  }

  const media = typeof archive.media === 'string'
    ? JSON.parse(archive.media || '[]')
    : archive.media || [];

  return {
    album: {
      ...archive,
      media,
    },
  };
};
