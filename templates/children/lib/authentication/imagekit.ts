import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT } from "$env/static/private"; 
import { onError, onSuccess } from "$lib/fxns";
import ImageKit from "imagekit"; 
import type { UploadOptions } from "imagekit/dist/libs/interfaces";


const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT
})

export const uploadFile = async (file: File) => {

  try {
    // Convert the file to a base64 string (server-side)
    const arrayBuffer = await file.arrayBuffer()
    const fileBase64 = Buffer.from(arrayBuffer).toString("base64")
    

    const fileName = file.name;
    const options: UploadOptions = {
      file: fileBase64, // Pass the base64 content
      fileName, // Use the extracted file name 
      // checks: "<25mb" // Update checks format if necessary
    }
    const response = await imagekit.upload(options)
    return onSuccess(response)
  } catch (error: any) {
    return onError(error.message)
  }
}

export const deleteFile = async (fileId: string) => {
  try {
    const response = await imagekit.deleteFile(fileId)
    return onSuccess(response)
  } catch (error: any) {
    return onError(error.message)
  }
}