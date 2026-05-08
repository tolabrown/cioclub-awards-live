import { db } from "./drizzle"
import { childFile, file } from "./schema"
import { eq, and, desc } from "drizzle-orm"
import { onError, onSuccess } from "$lib/fxns"
import { randomUUID } from "crypto"
import { logActivity } from "./log"

// ==================== CHILD-FILE CRUD ====================

export const addChildFile = async (data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      id: data.id || randomUUID()
    }
    const newChildFile = await db.insert(childFile).values(sanitizedData).returning()

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "ChildFile",
      entityId: newChildFile[0].id,
      details: { childId: newChildFile[0].childId, fileId: newChildFile[0].fileId }
    })

    return onSuccess(newChildFile[0])
  } catch (error: any) {
    console.log("addChildFile()", error.message)
    return onError(error.message)
  }
}

export const deleteChildFile = async (childId: string, fileId: string, user?: any) => {
  try {
    const deletedChildFile = await db
      .delete(childFile)
      .where(
        and(
          eq(childFile.childId, childId),
          eq(childFile.fileId, fileId)
        )
      )
      .returning()

    if (deletedChildFile.length === 0) {
      return onError("Child-File relationship not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "ChildFile",
      entityId: deletedChildFile[0].id,
      details: { childId: childId, fileId: fileId }
    })

    return onSuccess(deletedChildFile[0])
  } catch (error: any) {
    console.log("deleteChildFile()", error.message)
    return onError(error.message)
  }
}

export const getFilesByChildId = async (childId: string) => {
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
      .from(childFile)
      .innerJoin(file, eq(childFile.fileId, file.id))
      .where(eq(childFile.childId, childId))
      .orderBy(desc(file.createdAt))

    return onSuccess(result)
  } catch (error: any) {
    console.log("getFilesByChildId()", error.message)
    return onError(error.message)
  }
}

export const deleteFilesByChildId = async (childId: string, user?: any) => {
  try {
    const deletedFiles = await db
      .delete(childFile)
      .where(eq(childFile.childId, childId))
      .returning()

    // Log the activity
    if (deletedFiles.length > 0) {
      await logActivity({
        user,
        action: "DELETE",
        entity: "ChildFile",
        entityId: childId, // Using childId as entityId for bulk delete context
        details: { description: `Deleted ${deletedFiles.length} files for child ${childId}` }
      })
    }

    return onSuccess(deletedFiles)
  } catch (error: any) {
    console.log("deleteFilesByChildId()", error.message)
    return onError(error.message)
  }
}
