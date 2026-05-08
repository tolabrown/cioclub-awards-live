import { json, type RequestHandler } from '@sveltejs/kit';
import { handleFileUpload, deleteFileById, updateFile } from '$lib/server/minio';
import { env } from '$env/dynamic/private';
import { FileCRUD } from '$lib/db/file';

const BUCKET_NAME = env.MINIO_BUCKET || 'uploads';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '24');
		const category = url.searchParams.get('category') || undefined;
		const mimeType = url.searchParams.get('mimeType') || undefined;

		const result = await FileCRUD.getFiltered(
			{ category, mimeType },
			page,
			limit
		);

		if (!result.success) {
			return json({ error: result.error }, { status: 500 });
		}

		return json({
			success: true,
			files: result.data,
			meta: result.meta
		});
	} catch (error) {
		return json({ error: 'Failed to list files' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	if (!file) return json({ error: 'No file uploaded' }, { status: 400 });
	try { const result = await handleFileUpload(file, BUCKET_NAME); return json({ success: true, ...result }); }
	catch (error) { return json({ error: 'Upload failed' }, { status: 500 }); }
};

export const PUT: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const objectId = formData.get('id') as string | null;
	if (!file || !objectId) return json({ error: 'File and ID required' }, { status: 400 });
	try { const result = await updateFile(BUCKET_NAME, objectId, file); return json({ success: true, ...result }); }
	catch (error) { return json({ error: 'Update failed' }, { status: 500 }); }
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { id } = await request.json();
	if (!id) return json({ error: 'ID required' }, { status: 400 });
	try { await deleteFileById(BUCKET_NAME, id); return json({ success: true, message: 'File deleted successfully' }); }
	catch (error) { return json({ error: 'Delete failed' }, { status: 500 }); }
};
