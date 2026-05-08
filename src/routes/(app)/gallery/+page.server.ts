import { db } from '$lib/db';
import { album, pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

const PATH = '/gallery';

export const load: PageServerLoad = async () => {
  const [contentRecord, albumsList] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, PATH)
    }),
    db.query.album.findMany({
      with: {
        coverImage: true,
        media: true,
      },
      orderBy: (album, { desc }) => [desc(album.year), desc(album.createdAt)],
    })
  ]);

  const parsedContent = contentRecord ? JSON.parse(contentRecord.data) : null;

  return {
    content: parsedContent,
    meta: contentRecord ? {
      title: contentRecord.title,
      description: contentRecord.description,
      ogImage: contentRecord.ogImage
    } : null,
    albums: albumsList.map((a) => {
      const actualCount = (a.media || []).filter((m: any) => m.isVisible !== false).length;
      return {
        ...a,
        image: a.coverImage?.url,
        mediaCount: a.displayLimit && a.displayLimit > 0 ? Math.min(actualCount, a.displayLimit) : actualCount
      };
    })
  };
};
