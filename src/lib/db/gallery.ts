import { db } from "./index";
import { album, albumMedia } from "./schema";
import { eq, desc, asc, or, ilike, count, and } from "drizzle-orm";
import type { iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";

export const getAlbumMediaBySearchFilter = async (params: Record<string, string>) => {
  try {
    const { search: searchTerm = "", offset: offsetStr = "0", albumId } = params;

    if (!albumId) {
      return { status: "error", message: "Album ID is required", data: emptyMetalist };
    }

    const offset = parseInt(offsetStr, 10) || 0;
    const cleanSearchTerm = searchTerm?.trim() || "";

    const conditions: any[] = [eq(albumMedia.albumId, albumId), eq(albumMedia.isVisible, true)];

    if (cleanSearchTerm.length > 0) {
      conditions.push(ilike(albumMedia.name, `%${cleanSearchTerm}%`));
    }

    const whereCondition = and(...conditions);

    const albumInfo = await db.query.album.findFirst({
      where: eq(album.id, albumId),
      columns: { displayLimit: true }
    });
    const displayLimit = albumInfo?.displayLimit || 0;

    const totalResult = await db.select({ count: count() }).from(albumMedia).where(whereCondition);
    const actualTotal = totalResult[0].count;
    const total = displayLimit > 0 ? Math.min(actualTotal, displayLimit) : actualTotal;

    if (displayLimit > 0 && offset >= displayLimit) {
      return { status: "success", data: { ...emptyMetalist, total } };
    }

    const remaining = displayLimit > 0 ? displayLimit - offset : MAX_ITEMS_PER_PAGE;
    const currentLimit = Math.min(MAX_ITEMS_PER_PAGE, remaining > 0 ? remaining : 0);

    const media = currentLimit > 0 ? await db.query.albumMedia.findMany({
      where: whereCondition,
      orderBy: [
        asc(albumMedia.displayOrder),
        desc(albumMedia.createdAt)
      ],
      limit: currentLimit,
      offset: offset
    }) : [];

    const hasNextPage = displayLimit > 0 
      ? (offset + media.length < total)
      : (offset + MAX_ITEMS_PER_PAGE < total);

    const mediaMeta: iFetchMeta = {
      total,
      meta: {
        cursor: media.length > 0 ? media[media.length - 1].id : '',
        more: hasNextPage,
        size: media.length
      },
      data: media
    };

    return { status: "success", data: mediaMeta };
  } catch (error: any) {
    console.error("getAlbumMediaBySearchFilter() error:", error.message);
    return { status: "error", message: error.message, data: emptyMetalist };
  }
};
