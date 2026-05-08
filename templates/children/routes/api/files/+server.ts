// src/routes/api/files/+server.ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { handleFileUpload, deleteFileById, updateFile, listObjects, getDirectObjectUrl, makeBucketPublic } from '$lib/server/minio';
import { env } from '$env/dynamic/private';

const BUCKET_NAME = env.MINIO_BUCKET;
 

export const GET: RequestHandler = async () => {
  try { 
    const objects = await listObjects(BUCKET_NAME);
    
    const files = objects.map((obj: any) => {
      const httpsUrl = getDirectObjectUrl(BUCKET_NAME, obj.name);
      
      return {
        id: obj.name,
        url: httpsUrl, // HTTPS URL via Traefik
        directUrl: httpsUrl,
        filename: obj.name.split('-').slice(1).join('-') || obj.name,
        size: obj.size,
        contentType: 'application/octet-stream',
        etag: obj.etag,
        uploadedAt: obj.lastModified
      };
    });
    
    return json({ success: true, files });
  } catch (error) {
    console.error('Error listing files:', error);
    return json({ error: 'Failed to list files' }, { status: 500 });
  }
};
// POST - Upload new file
export const POST: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return json({ error: 'No file uploaded' }, { status: 400 });
  }

  try {
    const result = await handleFileUpload(file, BUCKET_NAME);

    return json({
      success: true,
      id: result.id,
      url: result.url,
      directUrl: result.directUrl,
      filename: result.filename,
      size: result.size,
      contentType: result.contentType,
      etag: result.etag
    });
  } catch (error) {
    console.error('Upload error:', error);
    return json({ error: 'Upload failed' }, { status: 500 });
  }
};

// PUT - Update/Replace existing file
export const PUT: RequestHandler = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const objectId = formData.get('id') as string | null;

  if (!file || !objectId) {
    return json({ error: 'File and ID required' }, { status: 400 });
  }

  try {
    const result = await updateFile(BUCKET_NAME, objectId, file);

    return json({
      success: true,
      id: result.id,
      url: result.url,
      directUrl: result.directUrl,
      filename: result.filename,
      size: result.size,
      contentType: result.contentType,
      etag: result.etag
    });
  } catch (error) {
    console.error('Update error:', error);
    return json({ error: 'Update failed' }, { status: 500 });
  }
};

// DELETE - Remove file
export const DELETE: RequestHandler = async ({ request }) => {
  const { id } = await request.json();

  if (!id) {
    return json({ error: 'ID required' }, { status: 400 });
  }

  try {
    await deleteFileById(BUCKET_NAME, id);
    return json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    return json({ error: 'Delete failed' }, { status: 500 });
  }
};