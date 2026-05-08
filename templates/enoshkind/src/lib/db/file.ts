import { db } from "./drizzle"
import { file } from "./schema"
import { eq, desc, or, ilike, count, and } from "drizzle-orm"
import type { iFetchMeta } from "$lib/interface"
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants"
import { onError, onSuccess, type iResult } from "$lib/utils";
import { handleFileUpload } from "$lib/server/minio";

export const getFile = async (fileId: string) => {
  try {
    const result = await db
      .select()
      .from(file)
      .where(eq(file.id, fileId))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error: any) {
    console.log("getFile() Error", error.message)
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
    console.log("getFileByRemoteId() Error", error.message)
    return null
  }
}

export const addFile = async (data: any) => {
  try {
    const [newFile] = await db.insert(file).values(data).returning()
    return onSuccess(newFile)
  } catch (error: any) {
    console.log("addFile() Error", error.message)
    return onError(error.message)
  }
}

export const deleteFile = async (id: string) => {
  try {
    const [deletedFile] = await db
      .delete(file)
      .where(eq(file.id, id))
      .returning()

    if (!deletedFile) {
      return onError("File not found")
    }

    return onSuccess(deletedFile)
  } catch (error: any) {
    console.log("deleteFile() Error", error.message)
    return onError(error.message)
  }
}

export const updateFile = async (id: string, data: any) => {
  try {
    const [updatedFile] = await db
      .update(file)
      .set(data)
      .where(eq(file.id, id))
      .returning()

    if (!updatedFile) {
      return onError("File not found")
    }

    return onSuccess(updatedFile)
  } catch (error: any) {
    console.log("updateFile() Error", error.message)
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
    console.log("getFiles() Error", error.message)
    return onError(error.message)
  }
}

export const getFilesBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
      name,
      type
    } = params

    const offset = parseInt(offsetStr, 10) || 0
    const cleanSearchTerm = searchTerm?.trim() || ""

    const conditions = []

    if (cleanSearchTerm.length > 0) {
      conditions.push(
        or(
          ilike(file.name, `%${cleanSearchTerm}%`),
          ilike(file.type, `%${cleanSearchTerm}%`),
          ilike(file.remoteId, `%${cleanSearchTerm}%`)
        )
      )
    }

    if (name) conditions.push(ilike(file.name, `%${name}%`))
    if (type) conditions.push(eq(file.type, type))

    const whereCondition = conditions.length > 0 ? and(...conditions as any) : undefined

    const [totalResult] = await db
      .select({ count: count() })
      .from(file)
      .where(whereCondition)

    const total = totalResult.count

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
    console.log("getFilesBySearchFilter() Error", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

export const uploadFile = async (fileData: File, category: string = 'general') => {
  try {
    const uploadResult = await handleFileUpload(fileData);
    if (!uploadResult) return onError("Upload failed");

    return await addFile({
      remoteId: uploadResult.id,
      url: uploadResult.directUrl,
      size: uploadResult.size,
      type: uploadResult.contentType,
      name: uploadResult.filename
    });
  } catch (error: any) {
    console.error("uploadFile error:", error.message);
    return onError(error.message);
  }
}

