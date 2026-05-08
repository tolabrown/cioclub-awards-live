import { db } from "./drizzle"
import { teacherFile, file } from "./schema"
import { eq, and, desc } from "drizzle-orm"
import { onError, onSuccess } from "$lib/fxns"
import { randomUUID } from "crypto"
import { logActivity } from "./log"

// ==================== TEACHER-FILE CRUD ====================

export const addTeacherFile = async (data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      id: data.id || randomUUID()
    }
    const newTeacherFile = await db.insert(teacherFile).values(sanitizedData).returning()

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "TeacherFile",
      entityId: newTeacherFile[0].id,
      details: { teacherId: newTeacherFile[0].teacherId, fileId: newTeacherFile[0].fileId }
    })

    return onSuccess(newTeacherFile[0])
  } catch (error: any) {
    console.log("addTeacherFile()", error.message)
    return onError(error.message)
  }
}

export const deleteTeacherFile = async (teacherId: string, fileId: string, user?: any) => {
  try {
    const deletedTeacherFile = await db
      .delete(teacherFile)
      .where(
        and(
          eq(teacherFile.teacherId, teacherId),
          eq(teacherFile.fileId, fileId)
        )
      )
      .returning()

    if (deletedTeacherFile.length === 0) {
      return onError("Teacher-File relationship not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "TeacherFile",
      entityId: deletedTeacherFile[0].id,
      details: { teacherId: teacherId, fileId: fileId }
    })

    return onSuccess(deletedTeacherFile[0])
  } catch (error: any) {
    console.log("deleteTeacherFile()", error.message)
    return onError(error.message)
  }
}

export const getFilesByTeacherId = async (teacherId: string) => {
  try {
    const result = await db
      .select({
        id: file.id,
        remoteId: file.remoteId,
        url: file.url,
        size: file.size,
        type: file.type,
        name: file.name,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      })
      .from(teacherFile)
      .innerJoin(file, eq(teacherFile.fileId, file.id))
      .where(eq(teacherFile.teacherId, teacherId))
      .orderBy(desc(file.createdAt))

    return onSuccess(result)
  } catch (error: any) {
    console.log("getFilesByTeacherId()", error.message)
    return onError(error.message)
  }
}

export const deleteFilesByTeacherId = async (teacherId: string, user?: any) => {
  try {
    const deletedFiles = await db
      .delete(teacherFile)
      .where(eq(teacherFile.teacherId, teacherId))
      .returning()

    // Log the activity
    if (deletedFiles.length > 0) {
      await logActivity({
        user,
        action: "DELETE",
        entity: "TeacherFile",
        entityId: teacherId, // Using teacherId as entityId for bulk delete context
        details: { description: `Deleted ${deletedFiles.length} files for teacher ${teacherId}` }
      })
    }

    return onSuccess(deletedFiles)
  } catch (error: any) {
    console.log("deleteFilesByTeacherId()", error.message)
    return onError(error.message)
  }
}
