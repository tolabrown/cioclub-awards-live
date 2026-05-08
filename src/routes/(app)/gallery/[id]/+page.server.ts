import { db } from "$lib/db";
import { album, albumMedia } from "$lib/db/schema";
import { eq, and } from "drizzle-orm";
import { error } from "@sveltejs/kit";
import { MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const load = async ({ params }) => {
  const { id } = params;

  const albumData = await db.query.album.findFirst({
    where: eq(album.id, id),
    with: {
      coverImage: true,
      media: {
        where: eq(albumMedia.isVisible, true),
        orderBy: (media: any, { asc }: any) => [asc(media.displayOrder)],
        limit: MAX_ITEMS_PER_PAGE
      }
    }
  });

  if (!albumData) {
    throw error(404, "Album not found");
  }

  const visibleMedia = (albumData.media || [])
    .map((m: any) => ({
      id: m.id,
      url: m.url,
      name: m.name
    }))
    .filter((m: any) => m.url);

  // Apply displayLimit if set
  const displayLimit = albumData.displayLimit;
  const limitedMedia = displayLimit && displayLimit > 0
    ? visibleMedia.slice(0, displayLimit)
    : visibleMedia;

  return {
    album: {
      ...albumData,
      image: albumData.coverImage?.url,
      mediaCount: displayLimit && displayLimit > 0 ? Math.min(visibleMedia.length, displayLimit) : visibleMedia.length,
      displayLimit,
      media: limitedMedia
    }
  };
};
