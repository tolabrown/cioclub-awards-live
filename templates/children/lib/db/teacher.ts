import { db } from "./drizzle"
import { teacher, file, user } from "./schema"
import { eq, desc, or, ilike, count, and, getTableColumns } from "drizzle-orm"
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

export const getTeacher = async (teacherId: string) => {
  try {
    const result = await db
      .select({
        // Teacher fields
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        gender: teacher.gender,
        birthDay: teacher.birthDay,
        teacherType: teacher.teacherType,
        location: teacher.location,
        capacity: teacher.capacity,
        assignedClass: teacher.assignedClass,
        note: teacher.note,
        active: teacher.active,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
        // Full file object for avatar
        image: getFileDetails(),
        // Full user object
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires
        }
      })
      .from(teacher)
      .leftJoin(file, eq(teacher.image, file.id))
      .leftJoin(user, eq(teacher.userId, user.id))
      .where(eq(teacher.id, teacherId))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    const teacherData = result[0]

    // Get all additional media files for this teacher
    const { teacherFile } = await import('./schema')
    const filesResult = await db
      .select({
        file: getFileDetails()
      })
      .from(teacherFile)
      .innerJoin(file, eq(teacherFile.fileId, file.id))
      .where(eq(teacherFile.teacherId, teacherId))

    const files = filesResult.map(r => r.file)

    return {
      ...teacherData,
      files
    }
  } catch (error: any) {
    console.log("getTeacher() Error", error.message)
    return null
  }
}

export const addTeacher = async (data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      active: typeof data.active === 'string' ? data.active === 'true' : data.active
    }
    // Remove id from data if present to let DB generate it
    delete sanitizedData.id;

    const newTeacher = await db.insert(teacher).values(sanitizedData).returning()

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "Teacher",
      entityId: newTeacher[0].id,
      details: { name: newTeacher[0].name }
    })

    return newTeacher[0]
  } catch (error: any) {
    console.log("addTeacher() Error", error.message)
    return null
  }
}

export const updateTeacher = async (id: string, data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      active: typeof data.active === 'string' ? data.active === 'true' : data.active
    }

    // Remove id from data to prevent updating primary key
    delete sanitizedData.id;

    // Remove undefined values
    Object.keys(sanitizedData).forEach(key => sanitizedData[key] === undefined && delete sanitizedData[key]);

    const updatedTeacher = await db
      .update(teacher)
      .set(sanitizedData)
      .where(eq(teacher.id, id))
      .returning()

    if (updatedTeacher.length === 0) {
      return onError("Teacher not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "UPDATE",
      entity: "Teacher",
      entityId: id,
      details: { name: updatedTeacher[0].name, changes: Object.keys(sanitizedData) }
    })

    return onSuccess(updatedTeacher[0])
  } catch (error: any) {
    console.log("updateTeacher() Error", error.message)
    return onError(error.message)
  }
}

export const deleteTeacher = async (id: string, user?: any) => {
  try {
    const deletedTeacher = await db
      .delete(teacher)
      .where(eq(teacher.id, id))
      .returning()

    if (deletedTeacher.length === 0) {
      return onError("Teacher not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "Teacher",
      entityId: id,
      details: { name: deletedTeacher[0].name }
    })

    return onSuccess(deletedTeacher[0])
  } catch (error: any) {
    console.log("deleteTeacher() Error", error.message)
    return onError(error.message)
  }
}

export const getTeachers = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
    } = params

    const offset = parseInt(offsetStr, 10) || 0
    const cleanSearchTerm = searchTerm?.trim() || ""

    // Build base conditions array
    const conditions = []

    // Add search condition if search term exists
    if (cleanSearchTerm.length > 0) {
      conditions.push(
        or(
          ilike(teacher.name, `%${cleanSearchTerm}%`),
          ilike(teacher.email, `%${cleanSearchTerm}%`),
          ilike(teacher.phone, `%${cleanSearchTerm}%`),
          ilike(teacher.note, `%${cleanSearchTerm}%`),
          ilike(teacher.assignedClass, `%${cleanSearchTerm}%`)
        )
      )
    }

    // Dynamic filtering based on schema columns
    const teacherColumns = getTableColumns(teacher);
    const excludedParams = ['search', 'offset', 'limit'];

    Object.keys(params).forEach((key) => {
      if (excludedParams.includes(key)) return;

      // Check if key exists in teacher table columns
      if (key in teacherColumns) {
        const value = params[key];
        const column = teacherColumns[key as keyof typeof teacherColumns];

        // Handle different column types
        if (column.dataType === 'string') {
          // Case-insensitive search for strings
          conditions.push(ilike(column as any, value));
        } else if (column.dataType === 'boolean') {
          conditions.push(eq(column as any, value === 'true'));
        } else {
          // Default equality for other types
          conditions.push(eq(column as any, value));
        }
      }
    });

    // Combine all conditions with AND
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(teacher)
      .where(whereCondition)

    const total = totalResult[0].count

    // Get paginated results with full file and user objects
    const teachers = await db
      .select({
        // Teacher fields
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        gender: teacher.gender,
        birthDay: teacher.birthDay,
        teacherType: teacher.teacherType,
        location: teacher.location,
        capacity: teacher.capacity,
        assignedClass: teacher.assignedClass,
        note: teacher.note,
        active: teacher.active,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
        // Full file object for avatar
        image: getFileDetails(),
        // Full user object
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          role: user.role,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires
        }
      })
      .from(teacher)
      .leftJoin(file, eq(teacher.image, file.id))
      .leftJoin(user, eq(teacher.userId, user.id))
      .where(whereCondition)
      .orderBy(desc(teacher.updatedAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    // Calculate pagination meta
    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total

    const teachersMeta: iFetchMeta = {
      total,
      meta: {
        cursor: teachers.length > 0 ? teachers[teachers.length - 1].id : '',
        more: hasNextPage,
        size: teachers.length
      },
      data: teachers as any
    }

    return onSuccess(teachersMeta)
  } catch (error: any) {
    console.log("getTeachers() Error", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

export const getTeacherStatistics = async () => {
  try {
    const distributionResult = await db
      .select({
        group: teacher.location,
        count: count()
      })
      .from(teacher)
      .groupBy(teacher.location)

    const distribution = distributionResult.reduce((acc, curr) => {
      const key = curr.group || "Unknown"
      acc[key] = curr.count
      return acc
    }, {} as Record<string, number>)

    return onSuccess(distribution)
  } catch (error: any) {
    console.log("getTeacherStatistics()", error.message)
    return onError(error.message)
  }
}
