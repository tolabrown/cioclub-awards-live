import { db } from "./drizzle"
import { activityLog, user } from "./schema"
import type { User } from "$lib/auth"
import { eq, desc, or, inArray, and, not } from "drizzle-orm"
import { Role } from "$lib/constants"

export interface LogActivityParams {
  user?: User | string | null
  action: "CREATE" | "UPDATE" | "DELETE"
  entity: string
  entityId: string
  details?: any
  ipAddress?: string
  userAgent?: string
}

export const logActivity = async (params: LogActivityParams) => {
  try {
    const userId = typeof params.user === "string"
      ? params.user
      : params.user?.id || null

    await db.insert(activityLog).values({
      user: userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      details: params.details ? JSON.stringify(params.details) : null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  } catch (error: any) {
    console.error("logActivity() Error", error.message)
  }
}

export const getActivityLogs = async (params: Record<string, string> = {}) => {
  try {
    const logs = await db.query.activityLog.findMany({
      with: {
        user: true, // Populate user relation
      },
      orderBy: (activityLog, { desc }) => [desc(activityLog.createdAt)],
      limit: 100,
    })

    return logs
  } catch (error: any) {
    console.error("getActivityLogs() Error", error.message)
    return []
  }
}

export const getDashboardLogs = async (currentUser: User) => {
  try {
    if (!currentUser || !currentUser.role) return []

    let whereClause = undefined

    // Role-based filtering logic
    switch (currentUser.role) {
      case Role.ADMIN:
        // ADMIN sees all activities
        whereClause = undefined
        break

      case Role.EDITOR:
        // EDITOR sees their own activity and TEACHER, LEADER, PARENT, USER activity
        // Exclude other ADMINs and EDITORs (unless it's themselves)
        whereClause = or(
          eq(activityLog.user, currentUser.id), // Own activity
          inArray(
            activityLog.user,
            db.select({ id: user.id }).from(user).where(
              inArray(user.role, [Role.TEACHER, Role.LEADER, Role.PARENT, Role.USER])
            )
          )
        )
        break

      case Role.TEACHER:
        // TEACHER sees their own activity as well as LEADER PARENT and USER activities
        whereClause = or(
          eq(activityLog.user, currentUser.id), // Own activity
          inArray(
            activityLog.user,
            db.select({ id: user.id }).from(user).where(
              inArray(user.role, [Role.LEADER, Role.PARENT, Role.USER])
            )
          )
        )
        break

      case Role.LEADER:
        // LEADER sees their own activity as well as PARENT and USER
        whereClause = or(
          eq(activityLog.user, currentUser.id), // Own activity
          inArray(
            activityLog.user,
            db.select({ id: user.id }).from(user).where(
              inArray(user.role, [Role.PARENT, Role.USER])
            )
          )
        )
        break

      case Role.PARENT:
        // PARENT sees their own activity only
        whereClause = eq(activityLog.user, currentUser.id)
        break

      default:
        // Default to own activity only for safety
        whereClause = eq(activityLog.user, currentUser.id)
        break
    }

    const logs = await db.query.activityLog.findMany({
      where: whereClause,
      with: {
        user: true,
      },
      orderBy: (activityLog, { desc }) => [desc(activityLog.createdAt)],
      limit: 10, // Limit to 10 recent items for the dashboard card
    })

    return logs
  } catch (error: any) {
    console.error("getDashboardLogs() Error", error.message)
    return []
  }
}
