import { db } from "./drizzle";
import { pageContent } from "./schema";
import { eq } from "drizzle-orm";
import { SiteMeta } from "$lib/constants";

export const getPageContent = async (path: string, defaultData: any) => {
  try {
    const adjustedPath = path === 'home' ? '/' : (path.startsWith('/') ? path : '/' + path);
    const result = await db.select().from(pageContent).where(eq(pageContent.path, adjustedPath)).limit(1);

    if (result.length > 0) {
      return {
        ...result[0],
        data: JSON.parse(result[0].data),
        // Ensure we always have an ogimage, falling back to SiteMeta if record is incomplete
        ogimage: result[0].ogimage || SiteMeta.ogimage
      };
    }

    // Default return if no database entry exists
    return {
      path: adjustedPath,
      data: defaultData,
      title: defaultData.title || '',
      description: defaultData.description || '',
      ogimage: SiteMeta.ogimage
    };
  } catch (error: any) {
    console.error(`getPageContent(${path})`, error.message);
    return {
      path,
      data: defaultData,
      title: defaultData.title || '',
      description: defaultData.description || '',
      ogimage: SiteMeta.ogimage
    };
  }
};
