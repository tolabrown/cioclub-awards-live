import { db } from '$lib/db';
import { pageContent } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export async function getPageContent(path: string, defaultValue: any) {
  try {
    const content = await db.query.pageContent.findFirst({
      where: eq(pageContent.path, path)
    });
    if (content && content.data) {
      try {
        return JSON.parse(content.data);
      } catch (e) {
        console.error(`Error parsing JSON content for ${path}:`, e);
      }
    }
  } catch (e) {
    // Table might not exist yet
    console.error(`Error fetching content for ${path}:`, e);
  }
  return defaultValue;
}
