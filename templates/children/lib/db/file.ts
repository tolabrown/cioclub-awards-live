import { db } from "./drizzle"
import { file, childFile } from "./schema"
import { eq, desc, or, ilike, count, and, sql } from "drizzle-orm"
import type { iFetchMeta } from "$lib/interface"
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants"
import { onError, onSuccess } from "$lib/fxns"
import type { iResult } from "$lib/interface"
import { randomUUID } from "crypto"

// ==================== FILE CRUD ====================

export const getFile = async (id: string) => {
  try {
    const result = await db
      .select()
      .from(file)
      .where(eq(file.id, id))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error: any) {
    console.log("getFile()", error.message)
    return null
  }
}

export const getFileByRemoteId = async (remoteId: string) => {
  try {
    const result = await db
      .select()
      .from(file)
      .where(eq(file.remoteId, remoteId))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error: any) {
    console.log("getFileByRemoteId()", error.message)
    return null
  }
}

export const addFile = async (data: any) => {
  try {
    const sanitizedData = {
      ...data,
      id: data.id || randomUUID()
    }
    const newFile = await db.insert(file).values(sanitizedData).returning()
    return onSuccess(newFile[0])
  } catch (error: any) {
    console.log("addFile()", error.message)
    return onError(error.message)
  }
}

export const updateFile = async (id: string, data: any) => {
  try {
    const updatedFile = await db
      .update(file)
      .set(data)
      .where(eq(file.id, id))
      .returning()

    if (updatedFile.length === 0) {
      return onError("File not found")
    }


    return onSuccess(updatedFile[0])
  } catch (error: any) {
    console.log("updateFile()", error.message)
    return onError(error.message)
  }
}

export const deleteFile = async (id: string) => {
  try {
    console.log("before getting child")
    const { child } = await import('./schema')

    // Check if file is being used by any entities
    // Check 1: childFile junction table
    const usedInChildFiles = await db.select({ count: count() }).from(childFile).where(eq(childFile.fileId, id))

    console.log("used in childfiles", usedInChildFiles)
    // Check 2: child.image field
    const usedInChildImage = await db.select({ count: count() }).from(child).where(eq(child.image, id))

    console.log("used in childImage", usedInChildImage)
    const totalUsage = usedInChildFiles[0].count + usedInChildImage[0].count

    console.log("totalUsage", totalUsage)
    // if (totalUsage > 0) {
    //   return onError(`Cannot delete file. It is being used by ${totalUsage} entities (${usedInChildFiles[0].count} in media, ${usedInChildImage[0].count} as avatar).`)
    // }

    const deletedFile = await db
      .delete(file)
      .where(eq(file.id, id))
      .returning()

    console.log("deletedFile", deletedFile)
    if (deletedFile.length === 0) {
      return onError("File not found")
    }

    console.log("after deleting file")
    return onSuccess(deletedFile[0])
  } catch (error: any) {
    console.log("deleteFile()", error.message)
    return onError(error.message)
  }
}

/**
 * Cleanup all foreign key references to a file across all schema tables
 * @param id - The file ID to clean up references for
 * @returns Object with counts of cleaned up references
 */
export const cleanupFileReferences = async (id: string) => {
  try {
    const { child, childFile } = await import('./schema')

    let cleanedUp = {
      childImageNullified: 0,
      childFileEntriesDeleted: 0,
      totalCleaned: 0
    }

    // 1. Nullify child.image references
    const childImageUpdates = await db
      .update(child)
      .set({ image: null })
      .where(eq(child.image, id))
      .returning({ id: child.id })

    cleanedUp.childImageNullified = childImageUpdates.length

    // 2. Delete from childFile junction table
    const childFileDeletes = await db
      .delete(childFile)
      .where(eq(childFile.fileId, id))
      .returning({ id: childFile.id })

    cleanedUp.childFileEntriesDeleted = childFileDeletes.length
    cleanedUp.totalCleaned = cleanedUp.childImageNullified + cleanedUp.childFileEntriesDeleted

    console.log(`Cleaned up ${cleanedUp.totalCleaned} references for file ${id}:`, cleanedUp)

    return onSuccess(cleanedUp)
  } catch (error: any) {
    console.log("cleanupFileReferences()", error.message)
    return onError(error.message)
  }
}

/**
 * Delete a file with automatic cleanup of all foreign key references
 */
export const deleteFileWithCleanup = async (id: string) => {
  try {
    const fileToDelete = await getFile(id)

    if (!fileToDelete) {
      return onError("File not found")
    }

    // Clean up all foreign key references
    const cleanupResult = await cleanupFileReferences(id)

    if (cleanupResult.status === 'error') {
      return cleanupResult
    }

    // Delete from file table
    const deletedFile = await db
      .delete(file)
      .where(eq(file.id, id))
      .returning()

    if (deletedFile.length === 0) {
      return onError("File not found in database")
    }

    // Delete from MinIO
    if (fileToDelete.remoteId) {
      const { deleteFileById } = await import('$lib/server/minio')
      const { MINIO_BUCKET } = await import('$env/static/private')

      try {
        await deleteFileById(MINIO_BUCKET, fileToDelete.remoteId)
      } catch (minioError: any) {
        console.error('MinIO deletion failed:', minioError)
      }
    }

    return onSuccess({ file: deletedFile[0], cleanup: cleanupResult.data })
  } catch (error: any) {
    console.log("deleteFileWithCleanup()", error.message)
    return onError(error.message)
  }
}

/**
 * Delete a file and automatically clean up child references (legacy function)
 */
export const deleteFileWithChildCleanup = async (id: string) => {
  try {
    const { child, childFile } = await import('./schema')

    const fileToDelete = await getFile(id)

    if (!fileToDelete) {
      return onError("File not found")
    }

    await db.update(child).set({ image: null }).where(eq(child.image, id))
    await db.delete(childFile).where(eq(childFile.fileId, id))

    console.log("id =>", id)
    const deletedFile = await db.delete(file).where(eq(file.id, id)).returning()

    console.log("deletedFile", deletedFile)

    if (deletedFile.length === 0) {
      return onError("File not found")
    }

    if (fileToDelete.remoteId) {
      const { deleteFileById } = await import('$lib/server/minio')
      const { MINIO_BUCKET } = await import('$env/static/private')

      try {
        await deleteFileById(MINIO_BUCKET, fileToDelete.remoteId)
      } catch (minioError: any) {
        console.error('MinIO deletion failed:', minioError)
      }
    }

    return onSuccess(deletedFile[0])
  } catch (error: any) {
    console.log("deleteFileWithChildCleanup()", error.message)
    return onError(error.message)
  }
}

export const getFiles = async () => {
  try {
    const files = await db
      .select()
      .from(file)
      .orderBy(desc(file.createdAt))
      .limit(200)

    return onSuccess(files)
  } catch (error: any) {
    console.log("getFiles()", error.message)
    return onError(error.message)
  }
}

export const getFilesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
      type: fileType,
      minSize,
      maxSize
    } = params

    const offset = parseInt(offsetStr, 10) || 0
    const cleanSearchTerm = searchTerm?.trim() || ""

    const conditions = []

    // Search condition
    if (cleanSearchTerm.length > 0) {
      conditions.push(
        or(
          ilike(file.name, `%${cleanSearchTerm}%`),
          ilike(file.type, `%${cleanSearchTerm}%`)
        )
      )
    }

    // Type filter
    if (fileType) {
      conditions.push(ilike(file.type, `%${fileType}%`))
    }

    // Size filters
    if (minSize) {
      const minSizeNum = parseInt(minSize, 10)
      if (!isNaN(minSizeNum)) {
        conditions.push(sql`${file.size} >= ${minSizeNum}`)
      }
    }

    if (maxSize) {
      const maxSizeNum = parseInt(maxSize, 10)
      if (!isNaN(maxSizeNum)) {
        conditions.push(sql`${file.size} <= ${maxSizeNum}`)
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(file)
      .where(whereCondition)

    const total = totalResult[0].count

    // Get paginated results
    const files = await db
      .select()
      .from(file)
      .where(whereCondition)
      .orderBy(desc(file.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total

    const filesMeta: iFetchMeta = {
      total,
      meta: {
        cursor: files.length > 0 ? files[files.length - 1].id : '',
        more: hasNextPage,
        size: files.length
      },
      data: files
    }

    return onSuccess(filesMeta)
  } catch (error: any) {
    console.log("getFilesBySearchFilter()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

// ==================== HELPER FUNCTIONS ====================

export const getFilesByType = async (type: string) => {
  try {
    const files = await db
      .select()
      .from(file)
      .where(ilike(file.type, `%${type}%`))
      .orderBy(desc(file.createdAt))
      .limit(100)

    return onSuccess(files)
  } catch (error: any) {
    console.log("getFilesByType()", error.message)
    return onError(error.message)
  }
}

export const getFileStats = async () => {
  try {
    const [totalFiles, totalSize, imageFiles, videoFiles, documentFiles] = await Promise.all([
      db.select({ count: count() }).from(file),
      db.select({ total: sql<number>`SUM(${file.size})` }).from(file),
      db.select({ count: count() }).from(file).where(ilike(file.type, '%image%')),
      db.select({ count: count() }).from(file).where(ilike(file.type, '%video%')),
      db.select({ count: count() }).from(file).where(
        or(
          ilike(file.type, '%pdf%'),
          ilike(file.type, '%document%'),
          ilike(file.type, '%text%')
        )
      )
    ])

    const stats = {
      total: totalFiles[0].count,
      totalSize: totalSize[0].total || 0,
      images: imageFiles[0].count,
      videos: videoFiles[0].count,
      documents: documentFiles[0].count
    }

    return onSuccess(stats)
  } catch (error: any) {
    console.log("getFileStats()", error.message)
    return onError(error.message)
  }
}

export const getRecentFiles = async (limit: number = 10) => {
  try {
    const files = await db
      .select()
      .from(file)
      .orderBy(desc(file.createdAt))
      .limit(limit)

    return onSuccess(files)
  } catch (error: any) {
    console.log("getRecentFiles()", error.message)
    return onError(error.message)
  }
}

export const getUnusedFiles = async () => {
  try {
    // Get all file IDs
    const allFiles = await db.select({ id: file.id }).from(file)

    // Get all file IDs that are in use
    const usedInChildFiles = await db.select({ fileId: childFile.fileId }).from(childFile)

    const usedFileIds = new Set([
      ...usedInChildFiles.map(cf => cf.fileId)
    ])

    const unusedFileIds = allFiles
      .filter(f => !usedFileIds.has(f.id))
      .map(f => f.id)

    if (unusedFileIds.length === 0) {
      return onSuccess([])
    }

    // Get full details of unused files
    const unusedFiles = await db
      .select()
      .from(file)
      .where(sql`${file.id} = ANY(${unusedFileIds})`)
      .orderBy(desc(file.createdAt))

    return onSuccess(unusedFiles)
  } catch (error: any) {
    console.log("getUnusedFiles()", error.message)
    return onError(error.message)
  }
}

export const bulkDeleteFiles = async (fileIds: string[]) => {
  try {
    if (!fileIds || fileIds.length === 0) {
      return onError("No file IDs provided")
    }

    // Check if any files are in use
    const usedInChildFiles = await db.select({ count: count() }).from(childFile).where(sql`${childFile.fileId} = ANY(${fileIds})`)

    const totalUsage = usedInChildFiles[0].count

    if (totalUsage > 0) {
      return onError(`Cannot delete files. ${totalUsage} files are currently in use.`)
    }

    const deletedFiles = await db
      .delete(file)
      .where(sql`${file.id} = ANY(${fileIds})`)
      .returning()

    return onSuccess({
      deleted: deletedFiles.length,
      files: deletedFiles
    })
  } catch (error: any) {
    console.log("bulkDeleteFiles()", error.message)
    return onError(error.message)
  }
}
