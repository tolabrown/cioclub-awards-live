import { db } from "$lib/db";
import { activityLog } from "$lib/db/schema";

interface LogParams {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  operation: "CREATE" | "READ" | "UPDATE" | "DELETE" | "AUTH";
  metadata?: any;
}

/**
 * Logs a user activity to the database.
 * @param locals - The SvelteKit locals containing auth user info (optional).
 * @param params - The activity details to log.
 */
export async function logActivity(locals: { user?: { id: string } } | null, params: LogParams) {
  const userId = params.userId || locals?.user?.id;
  if (!userId) return;

  try {
    const logData = {
      userId,
      action: params.action,
      entityType: params.entityType || null,
      entityId: params.entityId || null,
      operation: params.operation,
      metadata: params.metadata ? (typeof params.metadata === "string" ? params.metadata : JSON.stringify(params.metadata)) : null,
    };
    await db.insert(activityLog).values(logData);
  } catch (error) {
    console.error("[Activity Log] Failed to record activity:", error);
  }
}
