import { json, type RequestHandler } from '@sveltejs/kit';
import { handleFileUpload, deleteFileById, updateFile, listObjects, getDirectObjectUrl } from '$lib/server/minio';
import { env } from '$env/dynamic/private';
import { db } from '$lib/db/drizzle';
import { file as fileTable } from '$lib/db/schema';
import { eq, or, and } from 'drizzle-orm';

const BUCKET_NAME = env.MINIO_BUCKET || 'uploads';

export const GET: RequestHandler = async () => {
	try {
		const files = await db.select().from(fileTable).orderBy(fileTable.createdAt);
		return json({ success: true, files });
	} catch (error) { return json({ error: 'Failed to list files' }, { status: 500 }); }
};

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	if (!file) return json({ error: 'No file uploaded' }, { status: 400 });
	try {
		const result = await handleFileUpload(file, BUCKET_NAME);

		// Save to database
		const [dbFile] = await db.insert(fileTable).values({
			remoteId: result.id,
			url: result.url,
			size: result.size,
			type: result.contentType,
			name: result.filename
		}).returning();

		return json({
			success: true,
			...result,
			id: dbFile.id, // Use database UUID as the primary ID
			remoteId: result.id // Keep MinIO object name as remoteId
		});
	}
	catch (error) {
		console.error('Upload error:', error);
		return json({ error: 'Upload failed' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File | null;
	const id = formData.get('id') as string | null; // This could be UUID or remoteId
	if (!file || !id) return json({ error: 'File and ID required' }, { status: 400 });
	try {
		// Find existing record to get remoteId
		const existing = await db.select().from(fileTable)
			.where(or(eq(fileTable.id, id), eq(fileTable.remoteId, id)))
			.limit(1);

		const remoteId = existing[0]?.remoteId || id;
		const result = await updateFile(BUCKET_NAME, remoteId, file);

		if (existing[0]) {
			await db.update(fileTable).set({
				size: result.size,
				type: result.contentType,
				name: result.filename,
				updatedAt: new Date()
			}).where(eq(fileTable.id, existing[0].id));
		}

		return json({ success: true, ...result, id: existing[0]?.id || id });
	}
	catch (error) { return json({ error: 'Update failed' }, { status: 500 }); }
};

export const DELETE: RequestHandler = async ({ request }) => {
	const { id } = await request.json();
	if (!id) return json({ error: 'ID required' }, { status: 400 });
	try {
		// Find existing record
		const existing = await db.select().from(fileTable)
			.where(or(eq(fileTable.id, id), eq(fileTable.remoteId, id)))
			.limit(1);

		const remoteId = existing[0]?.remoteId || id;

		// Delete from storage
		await deleteFileById(BUCKET_NAME, remoteId);

		// Delete from database
		if (existing[0]) {
			await db.delete(fileTable).where(eq(fileTable.id, existing[0].id));
		}

		return json({ success: true, message: 'File deleted successfully' });
	}
	catch (error) {
		console.error('Delete error:', error);
		return json({ error: 'Delete failed' }, { status: 500 });
	}
};
