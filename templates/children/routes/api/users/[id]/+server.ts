import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { onError, onSuccess } from '$lib/fxns';
import { authGuard } from '$lib/server'; 
import { db } from '$lib/db/drizzle';
import { user } from '$lib/db/schema';
import { eq } from 'drizzle-orm'; 
import { updateUser } from '$lib/db/user';
import { updateAccount } from '$lib/db/account';
import type { ImageKitResponseWithTypedVersion } from '$lib/authentication/types';
import { uploadFile } from '$lib/authentication/imagekit';

export const GET: RequestHandler = async () => {
  return new Response();
};

export const PATCH: RequestHandler = async ({ locals, request, params }) => {


  if (!locals.user) {
    return json(onError('Unauthenticated'))
  }

  try {

    const { id } = params
    const formData = await request.formData()
    const name = formData.get('name') as string
    const image = formData.get('image') as File | null
    const password = formData.get('password') as string

    let data: Record<string, any> = {}

    if (image) {
      const uploaded = await uploadFile(image as File)
      if (uploaded.status === 'error') {
        throw new Error(uploaded.message)
      }
      const data = uploaded.data as ImageKitResponseWithTypedVersion
      const response = await updateUser(id, { name, image: data.url, imageFileId: data.fileId })
      return json(onSuccess(response))
    }

    if (password && password.length > 6) {
      await updateAccount(id, { password })
    }
    const response = await updateUser(id, { name })
    return json(onSuccess(response))
  } catch (error: any) {
    return json(onError(error.message))
  }



  // const result = await updateUser(id, data)

  // return json(result)
  return json({})
};

export const DELETE: RequestHandler = async ({ locals, params }) => {

  const { id } = params
  const { authorized, message } = await authGuard(locals)

  if (!authorized) {
    return json(onError(message))
  }

  const deletedUser = await db
    .delete(user)
    .where(eq(user.id, id))
    .returning();

  return json(deletedUser)
};