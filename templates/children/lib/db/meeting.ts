import { db } from "./drizzle"
import { meeting, file } from "./schema"
import { eq, desc, or, ilike, count, and, getTableColumns, sql } from "drizzle-orm"
import type { iFetchMeta, iResult } from "$lib/interface"
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants"
import { onError, onSuccess } from "$lib/fxns"
import { logActivity } from "./log"

// Helper function to get file details for select
const getFileDetails = () => ({
  id: file.id,
  remoteId: file.remoteId,
  url: file.url,
  size: file.size,
  type: file.type,
  name: file.name,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt
})

export const getMeeting = async (meetingId: string) => {
  try {
    const result = await db
      .select({
        // Meeting fields
        id: meeting.id,
        type: meeting.type,
        datetime: meeting.datetime,
        createdAt: meeting.createdAt,
        updatedAt: meeting.updatedAt,
        // Image file
        image: getFileDetails()
      })
      .from(meeting)
      .leftJoin(file, eq(meeting.image, file.id))
      .where(eq(meeting.id, meetingId))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error: any) {
    console.log("getMeeting() Error", error.message)
    return null
  }
}

export const addMeeting = async (data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      datetime: data.datetime ? new Date(data.datetime) : new Date(),
    }
    delete sanitizedData.id;

    const newMeeting = await db.insert(meeting).values(sanitizedData).returning()

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "Meeting",
      entityId: newMeeting[0].id,
      details: { type: newMeeting[0].type, datetime: newMeeting[0].datetime }
    })

    return newMeeting[0]
  } catch (error: any) {
    console.log("addMeeting() Error", error.message)
    return null
  }
}

export const deleteMeeting = async (id: string, user?: any) => {
  try {
    const deletedMeeting = await db
      .delete(meeting)
      .where(eq(meeting.id, id))
      .returning()

    if (deletedMeeting.length === 0) {
      return onError("Meeting not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "Meeting",
      entityId: id,
      details: { type: deletedMeeting[0].type }
    })

    return onSuccess(deletedMeeting[0])
  } catch (error: any) {
    console.log("deleteMeeting()", error.message)
    return onError(error.message)
  }
}

export const updateMeeting = async (id: string, data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      datetime: data.datetime ? new Date(data.datetime) : undefined,
    }
    delete sanitizedData.id;
    Object.keys(sanitizedData).forEach(key => sanitizedData[key] === undefined && delete sanitizedData[key]);

    const updatedMeeting = await db
      .update(meeting)
      .set(sanitizedData)
      .where(eq(meeting.id, id))
      .returning()

    if (updatedMeeting.length === 0) {
      return onError("Meeting not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "UPDATE",
      entity: "Meeting",
      entityId: id,
      details: {
        type: updatedMeeting[0].type,
        datetime: updatedMeeting[0].datetime,
        changes: Object.keys(sanitizedData)
      }
    })

    return onSuccess(updatedMeeting[0])
  } catch (error: any) {
    console.log("updateMeeting()", error.message)
    return onError(error.message)
  }
}

export const getMeetingsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
    } = params

    const offset = parseInt(offsetStr, 10) || 0
    const cleanSearchTerm = searchTerm?.trim() || ""

    const conditions = []

    if (cleanSearchTerm.length > 0) {
      conditions.push(
        or(
          ilike(meeting.type, `%${cleanSearchTerm}%`),
          sql`${meeting.datetime}::text ilike ${`%${cleanSearchTerm}%`}`
        )
      )
    }

    const meetingColumns = getTableColumns(meeting);
    const excludedParams = ['search', 'offset', 'limit'];

    Object.keys(params).forEach((key) => {
      if (excludedParams.includes(key)) return;
      if (key in meetingColumns) {
        const value = params[key];
        const column = meetingColumns[key as keyof typeof meetingColumns];
        if (column.dataType === 'string') {
          conditions.push(ilike(column as any, value));
        } else {
          conditions.push(eq(column as any, value));
        }
      }
    });

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    const totalResult = await db
      .select({ count: count() })
      .from(meeting)
      .where(whereCondition)

    const total = totalResult[0].count

    const meetings = await db
      .select({
        id: meeting.id,
        type: meeting.type,
        datetime: meeting.datetime,
        createdAt: meeting.createdAt,
        updatedAt: meeting.updatedAt,
        image: getFileDetails()
      })
      .from(meeting)
      .leftJoin(file, eq(meeting.image, file.id))
      .where(whereCondition)
      .orderBy(desc(meeting.datetime))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total
    const meetingsMeta: iFetchMeta = {
      total,
      meta: {
        cursor: meetings.length > 0 ? meetings[meetings.length - 1].id : '',
        more: hasNextPage,
        size: meetings.length
      },
      data: meetings as any
    }

    return onSuccess(meetingsMeta)
  } catch (error: any) {
    console.log("getMeetingsBySearchFilter()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

export const getMeetingStatistics = async () => {
  try {
    const distributionResult = await db
      .select({
        group: meeting.type,
        count: count()
      })
      .from(meeting)
      .groupBy(meeting.type)

    const distribution = distributionResult.reduce((acc, curr) => {
      const key = curr.group || "Unknown"
      acc[key] = curr.count
      return acc
    }, {} as Record<string, number>)

    return onSuccess(distribution)
  } catch (error: any) {
    console.log("getMeetingStatistics()", error.message)
    return onError(error.message)
  }
}
