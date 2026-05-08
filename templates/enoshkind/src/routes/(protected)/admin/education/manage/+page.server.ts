import { fail, redirect } from "@sveltejs/kit";
import { EducationCRUD } from "$lib/db/education";
import { addFile, uploadFile } from "$lib/db/file";
import { handleFileUpload } from "$lib/server/minio";
import type { Actions } from "./$types";

export const actions: Actions = {
  create: async ({ request, locals }) => {
    if (locals.user?.role !== 'admin') {
      return fail(403, { message: 'Unauthorized' });
    }

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const duration = formData.get("duration") as string;
    const type = formData.get("type") as string;
    const premium = formData.get("premium") === "true";
    const content = formData.get("content") as string;
    const videoUrl = formData.get("videoUrl") as string;
    const bannerFileId = formData.get("banner") as string;

    if (!title || !category) {
      return fail(400, { message: "Title and Category are required" });
    }

    try {
      const newArticle = await EducationCRUD.create({
        title,
        category,
        duration,
        type,
        premium,
        content,
        videoUrl,
        image: bannerFileId || null
      });

      if (!newArticle) {
        return fail(500, { message: "Failed to create article" });
      }
    } catch (error: any) {
      console.error("Article creation error:", error.message);
      return fail(500, { message: "An error occurred" });
    }

    throw redirect(303, "/admin/education");
  },
  uploadImage: async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file || file.size === 0) {
      return fail(400, { message: 'No image provided' });
    }

    try {
      const result = await uploadFile(file, 'education');

      if (result.status === "error") {
        return fail(400, { message: result.message || 'Failed to upload image' });
      }

      return { file: result.data };
    } catch (error: any) {
      console.error('[UploadAction] Error:', error);
      return fail(500, {
        message: error.message || 'Internal Server Error during upload'
      });
    }
  },
};
