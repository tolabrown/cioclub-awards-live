import { db } from '$lib/db/drizzle';
import { labTestOrder, labResult } from '$lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { handleFileUpload, deleteFileById } from '$lib/server/minio';
import { env } from '$env/dynamic/private';

import { getAvailableLabTests } from '$lib/db/lab';

export const load = (async ({ locals, fetch }) => {
  const user = locals.user;
  if (!user) return { results: [], availableTests: [] };

  const results = await db.query.labTestOrder.findMany({
    where: eq(labTestOrder.userId, user.id),
    orderBy: [desc(labTestOrder.createdAt)],
    with: {
      result: true
    }
  });

  // Fetch available tests from our API (which handles seeding)
  const testsRes = await fetch('/api/lab-tests');
  const testsData = await testsRes.json();

  return {
    results,
    availableTests: testsData.data || []
  };
}) satisfies PageServerLoad;

export const actions = {
  analyzeReport: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;

    if (!orderId) return fail(400, { message: 'Missing order ID' });

    try {
      // 1. Check for existing analysis
      const existing = await db.query.labResult.findFirst({
        where: eq(labResult.orderId, orderId)
      });

      if (existing) {
        return { success: true, result: existing };
      }

      // 2. Get order details for PDF URL
      const order = await db.query.labTestOrder.findFirst({
        where: and(eq(labTestOrder.id, orderId), eq(labTestOrder.userId, user.id))
      });

      if (!order || !order.pdfUrl) {
        return fail(404, { message: 'Report file not found' });
      }

      // 3. Call n8n webhook
      // Use process.env.LAB_ANALYSIS if env.LAB_ANALYSIS is not available via dynamic/private
      const webhookUrl = env.LAB_ANALYSIS || process.env.LAB_ANALYSIS;

      if (!webhookUrl) {
        return fail(500, { message: 'Analysis service not configured' });
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfUrl: order.pdfUrl,
          testType: order.testType,
          userId: user.id,
          orderId: order.id
        })
      });

      if (!response.ok) {
        throw new Error('Analysis service failed');
      }

      const analysisRaw = await response.json();

      // Handle cases where n8n returns an array or nested object
      const analysisData = Array.isArray(analysisRaw) ? analysisRaw[0] : (analysisRaw.data || analysisRaw);

      // Extract raw markdown output if present
      const rawAnalysis = analysisData.output || analysisData.analysis || (typeof analysisData === 'string' ? analysisData : null);

      // Fallback scoring logic based on keywords in raw output if no score is provided
      let finalScore = analysisData.overallScore ?? analysisData.score;
      if (finalScore === undefined && rawAnalysis) {
        const lowerRaw = rawAnalysis.toLowerCase();
        if (lowerRaw.includes('excellent')) finalScore = 95;
        else if (lowerRaw.includes('robust and healthy')) finalScore = 90;
        else if (lowerRaw.includes('good')) finalScore = 75;
        else if (lowerRaw.includes('normal')) finalScore = 80;
        else if (lowerRaw.includes('warning') || lowerRaw.includes('risk')) finalScore = 45;
        else if (lowerRaw.includes('critical')) finalScore = 20;
        else finalScore = 70; // Default average
      }

      // 4. Store in database
      const [newResult] = await db.insert(labResult).values({
        orderId: order.id,
        overallScore: finalScore ?? 0,
        metrics: typeof analysisData.metrics === 'object' ? JSON.stringify(analysisData.metrics) : (analysisData.metrics || '[]'),
        recommendations: typeof analysisData.recommendations === 'object' ? JSON.stringify(analysisData.recommendations) : (analysisData.recommendations || '[]'),
        rawAnalysis: rawAnalysis
      }).returning();

      return { success: true, resultId: newResult.id };
    } catch (error: any) {
      console.error('Analysis error:', error);
      return fail(500, { message: error.message || 'Failed to analyze report' });
    }
  },
  uploadResult: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const testName = formData.get('testName') as string;
    const labName = formData.get('labName') as string;
    const file = formData.get('file') as File;

    if (!file || file.size === 0) {
      return fail(400, { message: 'No file uploaded' });
    }

    try {
      // 1. Upload to MinIO
      const uploadResult = await handleFileUpload(file, 'lab-results');

      // 2. Create Lab Test Order record
      const [order] = await db.insert(labTestOrder).values({
        userId: user.id,
        testType: testName,
        status: 'results_ready',
        pdfUrl: uploadResult.directUrl, // Use directUrl as requested
        paid: true
      }).returning();

      return { success: true, order };
    } catch (error: any) {
      console.error('Upload error:', error);
      return fail(500, { message: error.message || 'Failed to process file' });
    }
  },

  addCustomTest: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const customName = formData.get('customName') as string;
    const reason = formData.get('reason') as string;

    // In a real app, this might create a support ticket or a special lab order
    const [order] = await db.insert(labTestOrder).values({
      userId: user.id,
      testType: `CUSTOM: ${customName}`,
      status: 'order_placed',
      paid: false
    }).returning();

    return { success: true, order };
  },

  deleteHistoryItem: async ({ locals, request }) => {
    const user = locals.user;
    if (!user) return fail(401);

    const formData = await request.formData();
    const id = formData.get('id') as string;

    if (!id) return fail(400);

    try {
      // 1. Get the record to find the pdfUrl
      const record = await db.query.labTestOrder.findFirst({
        where: and(
          eq(labTestOrder.id, id),
          eq(labTestOrder.userId, user.id)
        )
      });

      if (record?.pdfUrl) {
        // 2. Derive object name from URL
        // Example URL: https://endPoint/bucket/objectName
        const urlObj = new URL(record.pdfUrl);
        const pathParts = urlObj.pathname.split('/');
        const objectName = pathParts[pathParts.length - 1];
        const bucketName = pathParts[pathParts.length - 2] || env.MINIO_BUCKET;

        console.log(`Deleting from MinIO: ${bucketName}/${objectName}`);
        try {
          await deleteFileById(bucketName, objectName);
        } catch (minioErr) {
          console.error('MinIO deletion failed (continuing with DB):', minioErr);
        }
      }

      // 3. Delete from DB
      await db.delete(labTestOrder).where(
        and(
          eq(labTestOrder.id, id),
          eq(labTestOrder.userId, user.id)
        )
      );

      return { success: true };
    } catch (e: any) {
      console.error('Delete error:', e);
      return fail(500, { message: 'Failed to delete record' });
    }
  }
} satisfies Actions;
