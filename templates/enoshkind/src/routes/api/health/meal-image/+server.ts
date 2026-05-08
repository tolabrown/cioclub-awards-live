import { json } from '@sveltejs/kit';
import { uploadFile } from '$lib/db/file';

export const POST = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) {
    return json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file || file.size === 0) {
      return json({ success: false, message: 'No image provided' }, { status: 400 });
    }

    const result = await uploadFile(file, 'meals');

    if (result.status === "error") {
      return json({ success: false, message: result.message || 'Failed to upload image' }, { status: 400 });
    }

    return json({
      success: true,
      file: result.data
    });
  } catch (error: any) {
    console.error('[API/MealImage] Error:', error);
    return json({
      success: false,
      message: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
};
