import { db } from "$lib/db/drizzle";
import { user, file, siteContent, teamMembers, contactInquiries, cvApplications, ladiesInTechEvents, ladiesInTechRegistrations } from "$lib/db/schema";
import { count, sql, eq } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // Basic Stats
  const usersResult = await db.select({ value: count() }).from(user);
  const filesResult = await db.select({ value: count() }).from(file);
  const teamResult = await db.select({ value: count() }).from(teamMembers);
  const contactsResult = await db.select({ value: count() }).from(contactInquiries);
  const applicationsResult = await db.select({ value: count() }).from(cvApplications);
  const ladiesInTechResult = await db.select({ value: count() }).from(ladiesInTechEvents);
  const registrationsResult = await db.select({ value: count() }).from(ladiesInTechRegistrations).where(eq(ladiesInTechRegistrations.status, 'success'));

  const totalUsers = usersResult[0]?.value ?? 0;
  const totalFiles = filesResult[0]?.value ?? 0;
  const totalTeam = teamResult[0]?.value ?? 0;
  const totalContacts = contactsResult[0]?.value ?? 0;
  const totalApplications = applicationsResult[0]?.value ?? 0;
  const totalLadiesInTech = ladiesInTechResult[0]?.value ?? 0;
  const totalRegistrations = registrationsResult[0]?.value ?? 0;

  // Growth Data (Last 6 Months)
  let userGrowth: any[] = [];
  try {
    const result = await db.execute(sql`
      SELECT 
        date_trunc('month', created_at) as month,
        count(*) as count
      FROM "user"
      WHERE created_at >= now() - interval '6 months'
      GROUP BY 1
      ORDER BY 1 ASC
    `);
    userGrowth = Array.isArray(result) ? result : [];
  } catch (e) {
    console.error("Error fetching user growth:", e);
  }

  return {
    stats: {
      users: totalUsers,
      files: totalFiles,
      team: totalTeam,
      contacts: totalContacts,
      applications: totalApplications,
      ladiesInTech: totalLadiesInTech,
      registrations: totalRegistrations
    },
    charts: {
      userGrowth: userGrowth.map((r: any) => ({
        month: r.month ? new Date(r.month).toLocaleDateString("en-US", { month: "short" }) : "N/A",
        count: Number(r.count || 0),
      })),
    },
  };
};
