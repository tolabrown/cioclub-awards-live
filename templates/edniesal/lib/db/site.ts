import { db } from "./drizzle";
import { siteContent, services, teamMembers, contactInquiries } from "./schema";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

// Site Content Functions
export const getSiteContent = async (key: string) => {
  try {
    const result = await db.select().from(siteContent).where(eq(siteContent.key, key)).limit(1);
    return result.length > 0 ? JSON.parse(result[0].content) : null;
  } catch (error: any) {
    console.error(`getSiteContent(${key})`, error.message);
    return null;
  }
};

export const updateSiteContent = async (key: string, content: any) => {
  try {
    const jsonContent = JSON.stringify(content);
    await db.insert(siteContent)
      .values({ id: nanoid(), key, content: jsonContent })
      .onConflictDoUpdate({ target: siteContent.key, set: { content: jsonContent, updatedAt: new Date() } });
    return { success: true };
  } catch (error: any) {
    console.error(`updateSiteContent(${key})`, error.message);
    return { success: false, error: error.message };
  }
};

// Services Functions
export const getAllServices = async () => {
  try {
    return await db.select().from(services).orderBy(asc(services.order));
  } catch (error: any) {
    console.error("getAllServices()", error.message);
    return [];
  }
};

// Team Members Functions
export const getTeamMembers = async (type?: 'leadership' | 'staff') => {
  try {
    let query = db.select().from(teamMembers);
    if (type) {
      // @ts-ignore
      query = query.where(eq(teamMembers.type, type));
    }
    return await query.orderBy(asc(teamMembers.displayOrder));
  } catch (error: any) {
    console.error("getTeamMembers()", error.message);
    return [];
  }
};

// Contact Inquiry Functions
export const createInquiry = async (data: { name: string, email: string, subject?: string, message: string }) => {
  try {
    await db.insert(contactInquiries).values({
      id: nanoid(),
      ...data,
      createdAt: new Date()
    });
    return { success: true };
  } catch (error: any) {
    console.error("createInquiry()", error.message);
    return { success: false, error: error.message };
  }
};
