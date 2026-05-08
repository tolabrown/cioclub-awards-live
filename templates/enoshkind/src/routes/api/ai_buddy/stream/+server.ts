// src/routes/api/ai_buddy/stream/+server.ts
import { env } from "$env/dynamic/private";
import type { RequestHandler } from "./$types";

interface StreamChunk {
  type: 'stream_started' | 'n8n_chunk' | 'complete' | 'error';
  data?: string;
  message?: string;
}

function sendChunk(controller: ReadableStreamDefaultController, chunk: StreamChunk) {
  const encoder = new TextEncoder();
  const data = JSON.stringify(chunk) + '\n';
  controller.enqueue(encoder.encode(data));
}

async function* processN8nStream(response: Response) {
  if (!response.body) throw new Error('No response body from N8N');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        if (buffer.trim()) {
          try { JSON.parse(buffer); yield buffer; } catch { /* ignore */ }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try { JSON.parse(line); yield line; } catch { /* ignore */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, email } = await request.json();
    const webhookUrl = env.N8N_AI_BUDDY_WEBHOOK_URL;

    if (!webhookUrl) {
      return new Response("AI Buddy configuration missing", { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          sendChunk(controller, { type: 'stream_started' });

          const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "text/event-stream"
            },
            body: JSON.stringify({ message, email, stream: true })
          });

          if (!response.ok) {
            const errorText = await response.text();
            sendChunk(controller, { type: 'error', message: `N8N failed: ${response.status} - ${errorText}` });
            controller.close();
            return;
          }

          for await (const line of processN8nStream(response)) {
            sendChunk(controller, { type: 'n8n_chunk', data: line });
          }

          sendChunk(controller, { type: 'complete' });
        } catch (error: any) {
          sendChunk(controller, { type: 'error', message: error.message || 'Stream error' });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
      }
    });
  } catch (err: any) {
    return new Response(`Fatal error: ${err.message}`, { status: 500 });
  }
};
