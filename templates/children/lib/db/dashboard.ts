import { db } from "./drizzle";
import {
  user,
  child,
  teacher,
  parent,
  meeting,
  attendee,
  score,
} from "./schema";
import { count, sql, eq, and, gte, desc } from "drizzle-orm";
import {
  attendeesRoles,
  childrenRoles,
  meetingRoles,
  parentsRoles,
  scoresRoles,
  teachersRoles,
  usersRoles,
  Role,
} from "$lib/constants";
import { calculateAgeGroup } from "$lib/utils";

export const getDashboardStats = async (userRole: string) => {
  const stats: Record<string, number> = {};

  try {
    // Users
    if (usersRoles.includes(userRole as Role)) {
      const result = await db.select({ count: count() }).from(user);
      stats.users = result[0].count;
    }

    // Children
    if (childrenRoles.includes(userRole as Role)) {
      const result = await db.select({ count: count() }).from(child);
      stats.children = result[0].count;
    }

    // Teachers
    if (teachersRoles.includes(userRole as Role)) {
      const result = await db.select({ count: count() }).from(teacher);
      stats.teachers = result[0].count;
    }

    // Parents
    if (parentsRoles.includes(userRole as Role)) {
      const result = await db.select({ count: count() }).from(parent);
      stats.parents = result[0].count;
    }

    // Meetings
    if (meetingRoles.includes(userRole as Role)) {
      const result = await db.select({ count: count() }).from(meeting);
      stats.meetings = result[0].count;
    }

    // Attendees
    if (attendeesRoles.includes(userRole as Role)) {
      const result = await db.select({ count: count() }).from(attendee);
      stats.attendees = result[0].count;
    }

    // Scores
    if (scoresRoles.includes(userRole as Role)) {
      const result = await db.select({ count: count() }).from(score);
      stats.scores = result[0].count;
    }

    return stats;
  } catch (error) {
    console.error("getDashboardStats error:", error);
    return stats;
  }
};

export const getChartData = async (userRole: string) => {
  const charts: Record<string, any[]> = {};

  try {
    // Children by Age Group
    if (childrenRoles.includes(userRole as Role)) {
      try {
        // Get all children with their dates of birth
        const allChildren = await db
          .select({
            dateOfBirth: child.dateOfBirth,
          })
          .from(child);

        // Calculate age group distribution
        const ageGroupCounts = allChildren.reduce((acc, curr) => {
          const ageGroup = calculateAgeGroup(curr.dateOfBirth);
          const key = ageGroup || "Unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        // Convert to array format for charts
        charts.childrenByAgeGroup = Object.entries(ageGroupCounts).map(([group, value]) => ({
          group,
          value,
        }));
      } catch (error) {
        console.error("Error calculating age group distribution:", error);
        charts.childrenByAgeGroup = [];
      }

      charts.childrenByGender = await db
        .select({
          group: child.gender,
          value: count(),
        })
        .from(child)
        .groupBy(child.gender);

      // Normalize gender data
      const normalizedGender: Record<string, number> = {};
      charts.childrenByGender.forEach((item) => {
        let gender = item.group?.toLowerCase() || "unknown";
        if (gender === "male" || gender === "boy" || gender === "m") gender = "Boy";
        else if (gender === "female" || gender === "girl" || gender === "f") gender = "Girl";
        else {
          gender = "Unknown";
        }

        normalizedGender[gender] = (normalizedGender[gender] || 0) + Number(item.value);
      });

      // DEBUG: Find specific children with invalid gender to report to user
      const allChildren = await db.select({ name: child.name, gender: child.gender }).from(child);
      const invalidChildren = allChildren.filter(c => {
        const g = c.gender?.toLowerCase() || "";
        return !["male", "boy", "m", "female", "girl", "f"].includes(g);
      });
      if (invalidChildren.length > 0) {
        console.log("----------------------------------------");
        console.log("Found children with invalid gender:");
        invalidChildren.forEach(c => console.log(`- ${c.name}: "${c.gender}"`));
        console.log("----------------------------------------");
      }

      charts.childrenByGender = Object.entries(normalizedGender).map(([group, value]) => ({
        group,
        value,
      }));
    }

    // Attendance by Meeting Type (Last 6 months)
    if (attendeesRoles.includes(userRole as Role)) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      charts.attendanceByMeetingType = await db
        .select({
          date: sql<string>`to_char(${meeting.datetime}, 'YYYY-MM-DD')`,
          meetingType: meeting.type,
          value: count(),
        })
        .from(attendee)
        .innerJoin(meeting, eq(attendee.meeting, meeting.id))
        .where(gte(meeting.datetime, sixMonthsAgo))
        .groupBy(sql`to_char(${meeting.datetime}, 'YYYY-MM-DD')`, meeting.type)
        .orderBy(sql`to_char(${meeting.datetime}, 'YYYY-MM-DD')`);

      // Attendance by Meeting (Last 6 months)
      charts.attendanceByMeeting = await db
        .select({
          date: sql<string>`to_char(${meeting.datetime}, 'YYYY-MM-DD')`,
          value: count(),
        })
        .from(attendee)
        .innerJoin(meeting, eq(attendee.meeting, meeting.id))
        .where(gte(meeting.datetime, sixMonthsAgo))
        .groupBy(sql`to_char(${meeting.datetime}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${meeting.datetime}, 'YYYY-MM-DD')`);
    }

    // Scores by Type
    if (scoresRoles.includes(userRole as Role)) {
      charts.scoresByType = await db
        .select({
          group: score.scoreType,
          value: count(),
        })
        .from(score)
        .groupBy(score.scoreType);

      // Average Scores by Type (Radar Chart)
      charts.averageScoresByType = await db
        .select({
          subject: score.scoreType,
          A: sql<number>`AVG(${score.normalizedScore})`,
          fullMark: sql<number>`100`, // Assuming normalized score is out of 100 or similar scale
        })
        .from(score)
        .groupBy(score.scoreType);
    }

    // Teachers by Location
    if (teachersRoles.includes(userRole as Role)) {
      charts.teachersByLocation = await db
        .select({
          group: teacher.location,
          value: count(),
        })
        .from(teacher)
        .groupBy(teacher.location);
    }

    // Users by Role
    if (usersRoles.includes(userRole as Role)) {
      charts.usersByRole = await db
        .select({
          group: user.role,
          value: count(),
        })
        .from(user)
        .groupBy(user.role);
    }

    return charts;
  } catch (error: any) {
    console.error("getChartData() Error:", error.message, error.stack);
    return charts;
  }
};
