import { db } from "$lib/db";
import { user, news, event, resource, awardEntry, nomination, ticketBooking, sponsorshipInquiry, contactInquiry } from "$lib/db/schema";
import { count, eq, sql, desc, gte, asc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const currentUser = locals.user;

  // Get date ranges for trends
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Base stats - available for all roles
  const [
    totalUsersResult,
    totalEventsResult,
    totalNewsResult,
    totalResourcesResult,
    upcomingEventsResult,
    recentNewsResult,
  ] = await Promise.all([
    db.select({ count: count() }).from(user),
    db.select({ count: count() }).from(event),
    db.select({ count: count() }).from(news),
    db.select({ count: count() }).from(resource),
    db.select().from(event).where(gte(event.date, now)).orderBy(asc(event.date)).limit(5),
    db.select().from(news).orderBy(desc(news.createdAt)).limit(5),
  ]);

  // Role-specific data
  let adminData = null;
  let editorData = null;
  let sponsorData = null;

  if (currentUser?.role === "admin") {
    const [
      usersByRole,
      awardEntriesResult,
      nominationsResult,
      ticketsResult,
      sponsorshipsResult,
      contactsResult,
      recentUsersResult,
    ] = await Promise.all([
      db.select({
        role: user.role,
        count: count()
      }).from(user).groupBy(user.role),
      db.select({ count: count() }).from(awardEntry),
      db.select({ count: count() }).from(nomination),
      db.select({ count: count() }).from(ticketBooking),
      db.select({ count: count() }).from(sponsorshipInquiry),
      db.select({ count: count() }).from(contactInquiry),
      db.select().from(user).orderBy(desc(user.createdAt)).limit(10),
    ]);

    adminData = {
      usersByRole: usersByRole.map(r => ({
        role: r.role || "user",
        count: r.count
      })),
      awardEntries: awardEntriesResult[0]?.count || 0,
      nominations: nominationsResult[0]?.count || 0,
      tickets: ticketsResult[0]?.count || 0,
      sponsorships: sponsorshipsResult[0]?.count || 0,
      contacts: contactsResult[0]?.count || 0,
      recentUsers: recentUsersResult,
    };
  }

  if (currentUser?.role === "editor") {
    const [
      featuredNewsResult,
      draftNewsResult,
    ] = await Promise.all([
      db.select({ count: count() }).from(news).where(eq(news.isFeatured, true)),
      db.select().from(news).orderBy(desc(news.updatedAt)).limit(5),
    ]);

    editorData = {
      featuredNews: featuredNewsResult[0]?.count || 0,
      recentNews: draftNewsResult,
    };
  }

  if (currentUser?.role === "sponsor") {
    const [sponsorshipData] = await Promise.all([
      db.select().from(sponsorshipInquiry).orderBy(desc(sponsorshipInquiry.createdAt)).limit(5),
    ]);

    sponsorData = {
      inquiries: sponsorshipData,
    };
  }

  return {
    stats: {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalEvents: totalEventsResult[0]?.count || 0,
      totalNews: totalNewsResult[0]?.count || 0,
      totalResources: totalResourcesResult[0]?.count || 0,
    },
    upcomingEvents: upcomingEventsResult,
    recentNews: recentNewsResult,
    adminData,
    editorData,
    sponsorData,
  };
};
