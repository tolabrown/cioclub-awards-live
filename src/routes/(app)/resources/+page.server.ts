import { db } from '$lib/db';
import { pageContent, resource } from '$lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const [contentRecord, resources] = await Promise.all([
    db.query.pageContent.findFirst({
      where: eq(pageContent.path, '/resources')
    }),
    db.query.resource.findMany({
      orderBy: [desc(resource.createdAt)],
      with: {
        coverImage: true,
        media: {
          with: {
            file: true
          }
        }
      }
    })
  ]);

  const defaultContent = {
    hero: {
      badge: "Media & Knowledge",
      title: "Resources Hub",
      description: "Access our exclusive collection of whitepapers, reports, and multimedia content defining the future of Africa's digital landscape."
    }
  };

  const content = contentRecord?.data ? JSON.parse(contentRecord.data) : defaultContent;

  // Add viewUrl (local proxy) to every resource file for iframe/embed rendering
  // This bypasses X-Frame-Options restrictions from MinIO
  const transformedResources = (resources || []).map(res => {
    if (res.media && res.media.length > 0) {
      return {
        ...res,
        media: res.media.map((m: any) => {
          if (m.file) {
            return {
              ...m,
              file: {
                ...m.file,
                viewUrl: `/api/resources/view/${m.file.id}`
              }
            };
          }
          return m;
        })
      };
    }
    return res;
  });

  return {
    content,
    resources: transformedResources
  };
};
