import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getObjectStream } from '$lib/server/minio';
import { db } from '$lib/db';
import { file as fileTable } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

const BUCKET_NAME = env.MINIO_BUCKET || 'uploads';

export const GET: RequestHandler = async ({ params }) => {
	const { id } = params;

	if (!id) {
		throw error(400, 'File ID is required');
	}

	// 1. Find the file in the database to get the remoteId (object name)
	const fileRecord = await db.query.file.findFirst({
		where: eq(fileTable.id, id)
	});

	if (!fileRecord) {
		throw error(404, 'File not found');
	}

	try {
		// 2. Get the stream from MinIO
		const stream = await getObjectStream(BUCKET_NAME, fileRecord.remoteId);

		// 3. Return the stream with appropriate headers
		// We deliberately omit X-Frame-Options to allow framing
		return new Response(stream as any, {
			headers: {
				'Content-Type': fileRecord.type || 'application/octet-stream',
				'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(fileRecord.name || 'file')}`,
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (err) {
		console.error('Error proxying file from MinIO:', err);
		throw error(500, 'Error retrieving file from storage');
	}
};
