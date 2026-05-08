import { fail, redirect } from "@sveltejs/kit";
import { EducationCRUD } from "$lib/db/education";
import { addFile, updateFile as updateFileDb, uploadFile } from "$lib/db/file";
import { handleFileUpload } from "$lib/server/minio";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const article = await EducationCRUD.getById(params.id);
  if (!article) {
    throw redirect(303, "/admin/education");
  }

  return { article };
};

export const actions: Actions = {
  update: async ({ request, locals, params }) => {
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
    const imageId = formData.get("banner") as string;

    try {
      const updateData: any = {
        title,
        category,
        duration,
        type,
        premium,
        content,
        videoUrl,
        image: imageId || null
      };

      const updatedArticle = await EducationCRUD.update(params.id, updateData);

      if (!updatedArticle) {
        return fail(500, { message: "Failed to update article" });
      }
    } catch (error: any) {
      console.error("Article update error:", error.message);
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
