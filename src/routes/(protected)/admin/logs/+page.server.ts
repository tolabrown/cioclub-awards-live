import { db } from "$lib/db";
import { activityLog } from "$lib/db/schema";
import { count, desc, eq, ilike, or, and } from "drizzle-orm";
import type { PageServerLoad, Actions } from "./$types";
import { authGuard } from "$lib/server";

export const load: PageServerLoad = async ({ locals, url }) => {
  // 1. Guard check
  const guard = await authGuard(locals);
  if (!guard.authorized) return guard;

  const search = url.searchParams.get("search") || "";
  const op = url.searchParams.get("op") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = and(
    search 
      ? or(
          ilike(activityLog.action, `%${search}%`),
          ilike(activityLog.operation, `%${search}%`),
          ilike(activityLog.entityType, `%${search}%`)
        ) 
      : undefined,
    op && op !== "ALL" ? eq(activityLog.operation, op) : undefined
  );

  // 2. Fetch logs with user relation
  const [logs, [{ total }]] = await Promise.all([
    db.query.activityLog.findMany({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
      },
      where,
      orderBy: [desc(activityLog.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(activityLog).where(where)
  ]);

  return {
    logs,
    search,
    op,
    page,
    limit,
    totalCount: total,
    hasMore: total > page * limit
  };
};

export const actions: Actions = {
  export: async ({ locals }) => {
    const guard = await authGuard(locals);
    if (!guard.authorized) return { error: "Unauthorized" };

    // Fetch ALL logs for export
    const allLogs = await db.query.activityLog.findMany({
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [desc(activityLog.createdAt)],
    });

    return {
      allLogs: allLogs.map(log => ({
        createdAt: log.createdAt,
        user: log.user ? { name: log.user.name, email: log.user.email } : null,
        operation: log.operation,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata
      }))
    };
  }
};
