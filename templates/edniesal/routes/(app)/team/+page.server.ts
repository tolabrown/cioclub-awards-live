import { db } from "$lib/db/drizzle";
import { pageContent, teamMembers, file } from "$lib/db/schema";
import { eq, sql, asc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // Fetch page metadata from /team path
  const pageResult = await db
    .select()
    .from(pageContent)
    .where(eq(pageContent.path, "/team"))
    .limit(1);

  // Fetch all team members with their images
  const members = await db
    .select({
      id: teamMembers.id,
      name: teamMembers.name,
      role: teamMembers.role,
      bio: teamMembers.bio,
      imageUrl: teamMembers.imageUrl,
      type: teamMembers.type,
      linkedinUrl: teamMembers.linkedinUrl,
      image: {
        url: file.url,
      },
    })
    .from(teamMembers)
    .leftJoin(file, eq(teamMembers.imageId, file.id))
    .orderBy(asc(teamMembers.displayOrder), teamMembers.name);

  if (!pageResult[0]) {
    return {
      page: {
        title: "Our Team | Edniesal Consulting",
        description: "Meet the world-class leadership and management team behind Edniesal Consulting.",
        data: {
          overview: "Meet our exceptional leadership and management team.",
          board: members.filter(m => m.type === 'leadership'),
          team: members.filter(m => m.type !== 'leadership')
        }
      }
    };
  }

  const data = JSON.parse(pageResult[0].data || "{}");

  return {
    page: {
      ...pageResult[0],
      data: {
        ...data,
        board: members.filter(m => m.type === 'leadership'),
        team: members.filter(m => m.type !== 'leadership')
      }
    },
  };
};
