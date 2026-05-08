import { db } from "./drizzle"
import { memory, memoryFile, file } from "./schema"
import { eq, desc, or, ilike, count, and, getTableColumns, sql } from "drizzle-orm"
import type { iFetchMeta, iResult, iMemory, iFile } from "$lib/interface"
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

export const getMemory = async (memoryId: string): Promise<iMemory | null> => {
  try {
    const memoryRecord = await db
      .select({
        id: memory.id,
        name: memory.name,
        date: memory.date,
        location: memory.location,
        description: memory.description,
        coverImage: getFileDetails(),
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
      })
      .from(memory)
      .leftJoin(file, eq(memory.coverImage, file.id))
      .where(eq(memory.id, memoryId))
      .limit(1)

    if (!memoryRecord || memoryRecord.length === 0) {
      return null
    }

    // Fetch memory files
    const memoryFiles = await db
      .select({
        file: getFileDetails()
      })
      .from(memoryFile)
      .innerJoin(file, eq(memoryFile.fileId, file.id))
      .where(eq(memoryFile.memoryId, memoryId))

    return {
      ...memoryRecord[0],
      files: memoryFiles.map(mf => mf.file) as iFile[]
    } as iMemory
  } catch (error: any) {
    console.log("getMemory() Error", error.message)
    return null
  }
}

export const addMemory = async (data: any, user?: any) => {
  try {
    const { files, ...memoryData } = data

    const sanitizedData = {
      ...memoryData,
      date: memoryData.date ? new Date(memoryData.date) : new Date(),
    }
    delete sanitizedData.id;

    const [newMemory] = await db.insert(memory).values(sanitizedData).returning()

    if (files && Array.isArray(files) && files.length > 0) {
      const memoryFilesToInsert = files.map((fileId: string) => ({
        memoryId: newMemory.id,
        fileId: fileId
      }))
      await db.insert(memoryFile).values(memoryFilesToInsert)
    }

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "Memory",
      entityId: newMemory.id,
      details: { name: newMemory.name, date: newMemory.date }
    })

    return newMemory
  } catch (error: any) {
    console.log("addMemory() Error", error.message)
    return null
  }
}

export const attachFileToMemory = async (memoryId: string, fileId: string) => {
  try {
    const [attached] = await db
      .insert(memoryFile)
      .values({ memoryId, fileId })
      .returning()
    return onSuccess(attached)
  } catch (error: any) {
    return onError(error.message)
  }
}

export const detachFileFromMemory = async (memoryId: string, fileId: string) => {
  try {
    const [detached] = await db
      .delete(memoryFile)
      .where(and(eq(memoryFile.memoryId, memoryId), eq(memoryFile.fileId, fileId)))
      .returning()
    return onSuccess(detached)
  } catch (error: any) {
    return onError(error.message)
  }
}


export const updateMemory = async (id: string, data: any, user?: any) => {
  try {
    const { files, ...memoryData } = data

    const sanitizedData = {
      ...memoryData,
      date: memoryData.date ? new Date(memoryData.date) : undefined,
    }
    delete sanitizedData.id;
    Object.keys(sanitizedData).forEach(key => sanitizedData[key] === undefined && delete sanitizedData[key]);

    const res = await db.transaction(async (tx) => {
      const [updatedMemory] = await tx
        .update(memory)
        .set(sanitizedData)
        .where(eq(memory.id, id))
        .returning()

      if (!updatedMemory) {
        throw new Error("Memory not found")
      }

      if (files !== undefined && Array.isArray(files)) {
        // Remove existing files
        await tx.delete(memoryFile).where(eq(memoryFile.memoryId, id))

        // Add new files
        const memoryFilesToInsert = files.map((fileId: string) => ({
          memoryId: id,
          fileId: fileId
        }))
        if (memoryFilesToInsert.length > 0) {
          await tx.insert(memoryFile).values(memoryFilesToInsert)
        }
      }

      return updatedMemory
    })

    // Log the activity
    await logActivity({
      user,
      action: "UPDATE",
      entity: "Memory",
      entityId: id,
      details: {
        name: res.name,
        date: res.date,
        changes: Object.keys(sanitizedData)
      }
    })

    return onSuccess(res)
  } catch (error: any) {
    console.log("updateMemory()", error.message)
    return onError(error.message)
  }
}

export const deleteMemory = async (id: string, user?: any) => {
  try {
    const [deletedMemory] = await db
      .delete(memory)
      .where(eq(memory.id, id))
      .returning()

    if (!deletedMemory) {
      return onError("Memory not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "Memory",
      entityId: id,
      details: { name: deletedMemory.name }
    })

    return onSuccess(deletedMemory)
  } catch (error: any) {
    console.log("deleteMemory()", error.message)
    return onError(error.message)
  }
}

export const getMemoriesBySearchFilter = async (params: Record<string, string>) => {
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
          ilike(memory.name, `%${cleanSearchTerm}%`),
          ilike(memory.location, `%${cleanSearchTerm}%`),
          ilike(memory.description, `%${cleanSearchTerm}%`),
          sql`${memory.date}::text ilike ${`%${cleanSearchTerm}%`}`
        )
      )
    }

    const memoryColumns = getTableColumns(memory);
    const excludedParams = ['search', 'offset', 'limit'];

    Object.keys(params).forEach((key) => {
      if (excludedParams.includes(key)) return;
      if (key in memoryColumns) {
        const value = params[key];
        const column = memoryColumns[key as keyof typeof memoryColumns];
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
      .from(memory)
      .where(whereCondition)

    const total = totalResult[0].count

    const memories = await db
      .select({
        id: memory.id,
        name: memory.name,
        date: memory.date,
        location: memory.location,
        description: memory.description,
        coverImage: getFileDetails(),
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
        mediaCount: sql<number>`(SELECT count(*) FROM ${memoryFile} WHERE ${memoryFile.memoryId} = ${memory.id})`.mapWith(Number)
      })
      .from(memory)

      .leftJoin(file, eq(memory.coverImage, file.id))
      .where(whereCondition)
      .orderBy(desc(memory.date))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total
    const memoriesMeta: iFetchMeta = {
      total,
      meta: {
        cursor: (memories.length > 0 ? (memories[memories.length - 1].id as string) : ''),
        more: hasNextPage,
        size: memories.length
      },
      data: memories as any
    }


    return onSuccess(memoriesMeta)
  } catch (error: any) {
    console.log("getMemoriesBySearchFilter()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

export const getMemoryStatistics = async () => {
  try {
    // Statistics based on media count per memory
    const stats = await db
      .select({
        name: memory.name,
        count: count(memoryFile.id)
      })
      .from(memory)
      .leftJoin(memoryFile, eq(memoryFile.memoryId, memory.id))
      .groupBy(memory.name)
      .limit(10); // Limit to 10 for chart readability

    const distribution = stats.reduce((acc, curr) => {
      acc[curr.name] = curr.count
      return acc
    }, {} as Record<string, number>)

    return onSuccess(distribution)
  } catch (error: any) {
    console.log("getMemoryStatistics()", error.message)
    return onError(error.message)
  }
}
