import { db } from "./drizzle"
import { attendee, child, meeting, file } from "./schema"
import { eq, desc, or, ilike, count, and, getTableColumns, sql } from "drizzle-orm"
import type { iFetchMeta, iResult } from "$lib/interface"
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants"
import { onError, onSuccess } from "$lib/fxns"
import { logActivity } from "./log"
import { calculateAgeGroup } from "$lib/utils"

// Helper function to get child details with flattened image fields for select
const getChildDetails = () => ({
  id: child.id,
  name: child.name,
  dateOfBirth: child.dateOfBirth,
  gender: child.gender,
  active: child.active,
  // Flattened image fields
  imageId: file.id,
  imageUrl: file.url,
  imageName: file.name,
  imageType: file.type
})

// Helper function to get meeting details for select
const getMeetingDetails = () => ({
  id: meeting.id,
  type: meeting.type,
  datetime: meeting.datetime,
  createdAt: meeting.createdAt,
  updatedAt: meeting.updatedAt
})

// Helper to reconstruct the nested object structure
const mapAttendee = (row: any) => {
  const { child, ...rest } = row;
  const { imageId, imageUrl, imageName, imageType, ...childData } = child;

  return {
    ...rest,
    child: {
      ...childData,
      ageGroup: calculateAgeGroup(childData.dateOfBirth),
      image: imageId ? {
        id: imageId,
        url: imageUrl,
        name: imageName,
        type: imageType
      } : null
    }
  };
}

export const getAttendee = async (attendeeId: string) => {
  try {
    const result = await db
      .select({
        // Attendee fields
        id: attendee.id,
        notes: attendee.notes,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt,
        // Child details with flattened image
        child: getChildDetails(),
        // Meeting details
        meeting: getMeetingDetails()
      })
      .from(attendee)
      .innerJoin(child, eq(attendee.child, child.id))
      .leftJoin(file, eq(child.image, file.id))
      .innerJoin(meeting, eq(attendee.meeting, meeting.id))
      .where(eq(attendee.id, attendeeId))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return mapAttendee(result[0])
  } catch (error: any) {
    console.log("getAttendee() Error", error.message)
    return null
  }
}

// Check if a child is already registered for a specific meeting
export const checkDuplicateAttendee = async (childId: string, meetingId: string, excludeAttendeeId?: string) => {
  try {
    const conditions = [
      eq(attendee.child, childId),
      eq(attendee.meeting, meetingId)
    ]

    // Exclude current record when updating
    if (excludeAttendeeId) {
      conditions.push(sql`${attendee.id} != ${excludeAttendeeId}`)
    }

    const result = await db
      .select({ id: attendee.id })
      .from(attendee)
      .where(and(...conditions))
      .limit(1)

    return result.length > 0
  } catch (error: any) {
    console.log("checkDuplicateAttendee() Error", error.message)
    return false
  }
}

export const addAttendee = async (data: any, user?: any) => {
  try {
    // Check for duplicate before inserting
    const isDuplicate = await checkDuplicateAttendee(data.child, data.meeting)
    if (isDuplicate) {
      throw new Error("This child is already registered for this meeting")
    }

    const sanitizedData = {
      ...data,
    }
    delete sanitizedData.id;

    const newAttendee = await db.insert(attendee).values(sanitizedData).returning()

    // Fetch details for logging
    const childDetails = await db.query.child.findFirst({
      where: (child, { eq }) => eq(child.id, newAttendee[0].child),
      columns: { name: true }
    })
    const meetingDetails = await db.query.meeting.findFirst({
      where: (meeting, { eq }) => eq(meeting.id, newAttendee[0].meeting),
      columns: { type: true, datetime: true }
    })

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "Attendee",
      entityId: newAttendee[0].id,
      details: {
        meeting: meetingDetails?.type,
        meetingDate: meetingDetails?.datetime,
        child: childDetails?.name
      }
    })

    return newAttendee[0]
  } catch (error: any) {
    console.log("addAttendee() Error", error.message)
    throw error
  }
}

export const deleteAttendee = async (id: string, user?: any) => {
  try {
    const deletedAttendee = await db
      .delete(attendee)
      .where(eq(attendee.id, id))
      .returning()

    if (deletedAttendee.length === 0) {
      return onError("Attendee record not found")
    }

    // Fetch details for logging
    const childDetails = await db.query.child.findFirst({
      where: (child, { eq }) => eq(child.id, deletedAttendee[0].child),
      columns: { name: true }
    })
    const meetingDetails = await db.query.meeting.findFirst({
      where: (meeting, { eq }) => eq(meeting.id, deletedAttendee[0].meeting),
      columns: { type: true, datetime: true }
    })

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "Attendee",
      entityId: id,
      details: {
        meeting: meetingDetails?.type,
        meetingDate: meetingDetails?.datetime,
        child: childDetails?.name
      }
    })

    return onSuccess(deletedAttendee[0])
  } catch (error: any) {
    console.log("deleteAttendee()", error.message)
    return onError(error.message)
  }
}

export const updateAttendee = async (id: string, data: any, user?: any) => {
  try {
    // Check for duplicate if child or meeting is being changed
    if (data.child && data.meeting) {
      const isDuplicate = await checkDuplicateAttendee(data.child, data.meeting, id)
      if (isDuplicate) {
        throw new Error("This child is already registered for this meeting")
      }
    }

    const sanitizedData = { ...data }
    delete sanitizedData.id;
    Object.keys(sanitizedData).forEach(key => sanitizedData[key] === undefined && delete sanitizedData[key]);

    const updatedAttendee = await db
      .update(attendee)
      .set(sanitizedData)
      .where(eq(attendee.id, id))
      .returning()

    if (updatedAttendee.length === 0) {
      return onError("Attendee record not found")
    }

    // Fetch details for logging
    const childDetails = await db.query.child.findFirst({
      where: (child, { eq }) => eq(child.id, updatedAttendee[0].child),
      columns: { name: true }
    })
    const meetingDetails = await db.query.meeting.findFirst({
      where: (meeting, { eq }) => eq(meeting.id, updatedAttendee[0].meeting),
      columns: { type: true, datetime: true }
    })

    // Log the activity
    await logActivity({
      user,
      action: "UPDATE",
      entity: "Attendee",
      entityId: id,
      details: {
        meeting: meetingDetails?.type,
        meetingDate: meetingDetails?.datetime,
        child: childDetails?.name,
        changes: Object.keys(sanitizedData)
      }
    })

    return onSuccess(updatedAttendee[0])
  } catch (error: any) {
    console.log("updateAttendee()", error.message)
    return onError(error.message)
  }
}

export const getAttendeesBySearchFilter = async (params: Record<string, string>) => {
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
          ilike(child.name, `%${cleanSearchTerm}%`),
          ilike(meeting.type, `%${cleanSearchTerm}%`),
          ilike(attendee.notes, `%${cleanSearchTerm}%`)
        )
      )
    }

    // Handle meetingType filter specifically
    if (params.meetingType && params.meetingType !== 'all') {
      conditions.push(eq(meeting.type, params.meetingType));
    }

    const attendeeColumns = getTableColumns(attendee);
    const excludedParams = ['search', 'offset', 'limit'];

    Object.keys(params).forEach((key) => {
      if (excludedParams.includes(key)) return;
      if (key in attendeeColumns) {
        const value = params[key];
        const column = attendeeColumns[key as keyof typeof attendeeColumns];
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
      .from(attendee)
      .innerJoin(child, eq(attendee.child, child.id))
      .innerJoin(meeting, eq(attendee.meeting, meeting.id))
      .where(whereCondition)

    const total = totalResult[0].count

    const attendees = await db
      .select({
        id: attendee.id,
        notes: attendee.notes,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt,
        child: getChildDetails(),
        meeting: getMeetingDetails()
      })
      .from(attendee)
      .innerJoin(child, eq(attendee.child, child.id))
      .leftJoin(file, eq(child.image, file.id))
      .innerJoin(meeting, eq(attendee.meeting, meeting.id))
      .where(whereCondition)
      .orderBy(desc(attendee.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total
    const attendeesMeta: iFetchMeta = {
      total,
      meta: {
        cursor: attendees.length > 0 ? (attendees[attendees.length - 1].id as string) : '',
        more: hasNextPage,
        size: attendees.length
      },
      data: attendees.map(mapAttendee)
    }

    return onSuccess(attendeesMeta)
  } catch (error: any) {
    console.log("getAttendeesBySearchFilter()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

export const getAttendeesByMeeting = async (meetingId: string) => {
  try {
    const attendees = await db
      .select({
        id: attendee.id,
        notes: attendee.notes,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt,
        child: getChildDetails()
      })
      .from(attendee)
      .innerJoin(child, eq(attendee.child, child.id))
      .leftJoin(file, eq(child.image, file.id))
      .where(eq(attendee.meeting, meetingId))
      .orderBy(desc(attendee.createdAt))

    return onSuccess(attendees.map(mapAttendee))
  } catch (error: any) {
    console.log("getAttendeesByMeeting()", error.message)
    return onError(error.message)
  }
}

export const getAttendeesByChild = async (childId: string) => {
  try {
    const attendees = await db
      .select({
        id: attendee.id,
        notes: attendee.notes,
        createdAt: attendee.createdAt,
        updatedAt: attendee.updatedAt,
        meeting: getMeetingDetails()
      })
      .from(attendee)
      .innerJoin(meeting, eq(attendee.meeting, meeting.id))
      .where(eq(attendee.child, childId))
      .orderBy(desc(attendee.createdAt))

    return onSuccess(attendees)
  } catch (error: any) {
    console.log("getAttendeesByChild()", error.message)
    return onError(error.message)
  }
}

export const getAttendeeStatistics = async () => {
  try {
    // Count attendances per child
    const distributionResult = await db
      .select({
        childName: child.name,
        count: count()
      })
      .from(attendee)
      .innerJoin(child, eq(attendee.child, child.id))
      .groupBy(child.name)

    const distribution = distributionResult.reduce((acc, curr) => {
      const key = curr.childName || "Unknown"
      acc[key] = curr.count
      return acc
    }, {} as Record<string, number>)

    return onSuccess(distribution)
  } catch (error: any) {
    console.log("getAttendeeStatistics()", error.message)
    return onError(error.message)
  }
}
