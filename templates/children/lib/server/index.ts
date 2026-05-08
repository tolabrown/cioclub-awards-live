import { adminRoles, Constants, editors, Fields, FieldsPlural, Role } from "$lib/constants";
import type { iFile, iResult } from "$lib/interface";
import type { iFetchMeta } from "$lib/interface";
import { getUsersBySearchFilter } from "$lib/db/user";
import { json, redirect } from "@sveltejs/kit";
import { addFile } from "$lib/db/file";
import { onError } from "$lib/fxns";
import { env } from "$env/dynamic/private";
import { handleFileUpload } from "./minio";


export const BUCKET_NAME = env.MINIO_BUCKET;

export const throwIfError = (result: iResult) => {
  if (result.status === 'error') {
    throw new Error(result.message);
  }
}

export const fetchSearchFilterList = async (params: Record<string, string>, list: Fields) => {

  switch (list) {
    case Fields.USER:
      const usersResultBySearch = await getUsersBySearchFilter(params)
      const usersMeta = usersResultBySearch.data as iFetchMeta
      return usersMeta
    case Fields.CHILD:
      const { getChildrenBySearchFilter } = await import("$lib/db/child")
      const childrenResultBySearch = await getChildrenBySearchFilter(params)
      const childrenMeta = childrenResultBySearch.data as iFetchMeta
      return childrenMeta
    case Fields.TEACHER:
      const { getTeachers } = await import("$lib/db/teacher")
      const teachersResultBySearch = await getTeachers(params)
      const teachersMeta = teachersResultBySearch.data as iFetchMeta
      return teachersMeta
    case Fields.PARENT:
      const { getParentsBySearchFilter } = await import("$lib/db/parent")
      const parentsResultBySearch = await getParentsBySearchFilter(params)
      const parentsMeta = parentsResultBySearch.data as iFetchMeta
      return parentsMeta
    case Fields.MEETING:
      const { getMeetingsBySearchFilter } = await import("$lib/db/meeting")
      const meetingsResultBySearch = await getMeetingsBySearchFilter(params)
      const meetingsMeta = meetingsResultBySearch.data as iFetchMeta
      return meetingsMeta
    case Fields.MEMORY:
      const { getMemoriesBySearchFilter } = await import("$lib/db/memory")
      const memoriesResultBySearch = await getMemoriesBySearchFilter(params)
      const memoriesMeta = memoriesResultBySearch.data as iFetchMeta
      return memoriesMeta
  }

}


export const pageGuard = async (paramId: string, locals: App.Locals, field: FieldsPlural) => {
  const user = locals.user

  if (!user) {
    throw redirect(303, `/auth/login?redirectTo=/${field}/` + paramId);
  }

  if (!editors.includes(user.role as Role)) {
    throw redirect(303, Constants.AFTERAUTH);
  }
}

export const authGuard = async (locals: App.Locals, authorizedPersonels?: Role[]) => {

  const user = locals.user

  if (!user) {
    return { authorized: false, message: 'Unauthenticated' }
  }

  const personnels = authorizedPersonels ? authorizedPersonels : adminRoles

  if (!personnels.includes(user.role as Role)) {
    return { authorized: false, message: 'Unauthorized' }
  }

  return { authorized: true, message: 'passes check' }
}

export const getSearchFilterList = async (locals: App.Locals, url: URL, field: Fields) => {

  if (!locals.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Convert all search params to a Record<string, string>
  const params: Record<string, string> = {}
  url.searchParams.forEach((value, key) => {
    params[key] = value
  })

  const list = await fetchSearchFilterList(params, field)
  return json(list)
}


export const saveFileToMinioAndFileTable = async (file: File) => {

  try {

    const result = await handleFileUpload(file, BUCKET_NAME);

    const partialFile: Partial<iFile> = {
      name: result.filename,
      type: result.contentType,
      size: result.size,
      remoteId: result.id,
      url: result.directUrl
    }

    const fileResult = await addFile(partialFile)
    return fileResult
  } catch (error: any) {
    return onError(error.message)
  }

}

export const deleteFileFromMinioAndFileTable = async (fileId: string) => {
  try {
    // Get file details first
    const { getFile } = await import("$lib/db/file")
    const fileRecord = await getFile(fileId)

    if (!fileRecord) {
      return onError("File not found")
    }

    // Delete from MinIO first
    const { deleteFileById } = await import("./minio")
    await deleteFileById(BUCKET_NAME, fileRecord.remoteId)

    // Then delete from database
    const { deleteFile } = await import("$lib/db/file")
    const result = await deleteFile(fileId)

    return result
  } catch (error: any) {
    console.log("deleteFileFromMinioAndFileTable error:", error.message)
    return onError(error.message)
  }
}