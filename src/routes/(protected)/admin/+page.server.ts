import { db } from "$lib/db";
import { user, awardEntry, ticketBooking, nomination, file, news, event } from "$lib/db/schema";
import { count, sum, eq, sql } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // Basic Stats
  const usersResult = await db.select({ value: count() }).from(user);
  const entriesResult = await db.select({ value: count() }).from(awardEntry);
  const revenueResult = await db.select({ value: sum(ticketBooking.totalAmount) }).from(ticketBooking);
  const filesResult = await db.select({ value: count() }).from(file);
  const newsResult = await db.select({ value: count() }).from(news);
  const eventsResult = await db.select({ value: count() }).from(event);

  const totalUsers = usersResult[0]?.value ?? 0;
  const totalEntries = entriesResult[0]?.value ?? 0;
  const totalRevenue = Number(revenueResult[0]?.value || 0);
  const totalFiles = filesResult[0]?.value ?? 0;
  const totalNews = newsResult[0]?.value ?? 0;
  const totalEvents = eventsResult[0]?.value ?? 0;

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

  // Award Status Distribution
  let entryStatus: any[] = [];
  try {
    entryStatus = await db.select({
      status: awardEntry.status,
      count: count()
    }).from(awardEntry).groupBy(awardEntry.status);
  } catch (e) {
    console.error("Error fetching entry status:", e);
  }

  // Revenue by Month
  let revenueData: any[] = [];
  try {
    const result = await db.execute(sql`
      SELECT 
        date_trunc('month', created_at) as month,
        sum(total_amount) as total
      FROM ticket_booking
      WHERE payment_status = 'paid'
      GROUP BY 1
      ORDER BY 1 ASC
    `);
    revenueData = Array.isArray(result) ? result : [];
  } catch (e) {
    console.error("Error fetching revenue data:", e);
  }

  // Nominations by Category
  let nominationsByCategory: any[] = [];
  try {
    nominationsByCategory = await db.select({
      category: nomination.category,
      count: count()
    }).from(nomination).groupBy(nomination.category);
  } catch (e) {
    console.error("Error fetching nominations by category:", e);
  }

  return {
    stats: {
      users: totalUsers,
      entries: totalEntries,
      revenue: totalRevenue / 100, // Convert from kobo/cents
      files: totalFiles,
      news: totalNews,
      events: totalEvents
    },
    charts: {
      userGrowth: userGrowth.map((r: any) => ({
        month: r.month ? new Date(r.month).toLocaleDateString("en-US", { month: "short" }) : "N/A",
        count: Number(r.count || 0),
      })),
      entryStatus: entryStatus.map((s) => ({
        status: s.status || "unknown",
        count: Number(s.count || 0),
        fill: `var(--chart-${Math.floor(Math.random() * 5) + 1})`,
      })),
      revenue: revenueData.map((r: any) => ({
        month: r.month ? new Date(r.month).toLocaleDateString("en-US", { month: "short" }) : "N/A",
        total: Number(r.total || 0) / 100,
      })),
      nominations: nominationsByCategory.map((n, i) => ({
        category: n.category || "General",
        count: Number(n.count || 0),
        fill: `var(--chart-${(i % 5) + 1})`,
      })),
    },
  };
};
