import { json } from '@sveltejs/kit';
import { handleFileUpload } from '$lib/server/minio';

export const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const result = await handleFileUpload(file);

    return json({
      success: true,
      url: result.directUrl,
      filename: result.filename,
      id: result.id
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
};
