import { db } from "$lib/db/drizzle";
import { score, child } from "$lib/db/schema";
import { eq, and, ilike, or } from "drizzle-orm";
import type { iScore, iFetchMeta } from "$lib/interface";
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants";
import { logActivity } from "./log";

export const getScoresBySearchFilter = async (
  params: any,
): Promise<iFetchMeta> => {
  const { search, scoreType, cursor, limit, childId } = params;
  const pageSize = limit ? parseInt(limit) : MAX_ITEMS_PER_PAGE;

  const data = await db.query.score.findMany({
    where: (score, { and, eq, or, ilike, lt, exists }) => {
      const conditions = [];

      if (search) {
        conditions.push(
          or(
            ilike(score.notes, `%${search}%`),
            exists(
              db
                .select()
                .from(child)
                .where(
                  and(
                    eq(child.id, score.child),
                    ilike(child.name, `%${search}%`)
                  )
                )
            )
          )
        );
      }

      if (scoreType) {
        conditions.push(eq(score.scoreType, scoreType));
      }

      if (cursor) {
        conditions.push(lt(score.createdAt, new Date(cursor)));
      }

      if (childId) {
        conditions.push(eq(score.child, childId));
      }

      return and(...conditions);
    },
    with: {
      child: {
        with: {
          image: true,
        },
      },
    },
    orderBy: (score, { desc }) => [desc(score.createdAt)],
    limit: pageSize + 1,
  });

  const hasMore = data.length > pageSize;
  const results = hasMore ? data.slice(0, pageSize) : data;

  const lastItem = results[results.length - 1];
  const nextCursor = lastItem ? lastItem.createdAt.toISOString() : "";

  return {
    data: results,
    total: 0,
    meta: {
      cursor: nextCursor,
      more: hasMore,
      size: results.length,
    },
  };
};

export const getScore = async (id: string): Promise<iScore | null> => {
  const result = await db.query.score.findFirst({
    where: (score, { eq }) => eq(score.id, id),
    with: {
      child: {
        with: {
          image: true,
        },
      },
    },
  });

  return (result as unknown as iScore) || null;
};

export const addScore = async (data: Partial<iScore>, user?: any) => {
  // Round age to 1 decimal place before calculating normalized score
  const roundedAge = data.ageAtSubmission ? Math.round(data.ageAtSubmission * 10) / 10 : 0;

  // Calculate normalized score: points / age (with age at 1 decimal place)
  const normalizedScore = data.points && roundedAge
    ? data.points / roundedAge
    : 0;

  // Parse submissionDate if it's a string
  const submissionDate = data.submissionDate
    ? new Date(data.submissionDate)
    : new Date();

  const [newScore] = await db
    .insert(score)
    .values({
      ...data,
      ageAtSubmission: roundedAge, // Use rounded age
      submissionDate,
      normalizedScore,
      updatedAt: new Date(),
    } as any)
    .returning();

  // Fetch child details for logging
  const childDetails = await db.query.child.findFirst({
    where: (child, { eq }) => eq(child.id, newScore.child),
    columns: { name: true }
  });

  // Log the activity
  await logActivity({
    user,
    action: "CREATE",
    entity: "Score",
    entityId: newScore.id,
    details: {
      scoreType: newScore.scoreType,
      points: newScore.points,
      child: childDetails?.name
    }
  });

  return newScore;
};

export const updateScore = async (id: string, data: Partial<iScore>, user?: any) => {
  let updateData: any = { ...data, updatedAt: new Date() };

  // Parse submissionDate if it's a string
  if (data.submissionDate) {
    updateData.submissionDate = new Date(data.submissionDate);
  }

  // Recalculate normalized score if points or age changed
  if (data.points !== undefined || data.ageAtSubmission !== undefined) {
    // We might need to fetch existing data if only one is provided, 
    // but for simplicity assuming the UI sends both or we handle it in the UI/API.
    // Ideally, we should fetch the current record if one is missing to calculate correctly.
    // For now, let's assume the API handles providing both if one changes, or we do a quick fetch.

    // Better approach: fetch current if needed.
    if (data.points === undefined || data.ageAtSubmission === undefined) {
      const current = await db.select().from(score).where(eq(score.id, id)).limit(1);
      if (current.length > 0) {
        const points = data.points !== undefined ? data.points : current[0].points;
        const age = data.ageAtSubmission !== undefined ? data.ageAtSubmission : current[0].ageAtSubmission;
        // Round age to 1 decimal place
        const roundedAge = Math.round(age * 10) / 10;
        updateData.normalizedScore = points / roundedAge;
        // Ensure we save the rounded age if we're updating it
        if (data.ageAtSubmission !== undefined) {
          updateData.ageAtSubmission = roundedAge;
        }
      }
    } else {
      // Round age to 1 decimal place
      const roundedAge = Math.round(data.ageAtSubmission * 10) / 10;
      updateData.normalizedScore = data.points / roundedAge;
      updateData.ageAtSubmission = roundedAge;
    }
  }

  const [updatedScore] = await db
    .update(score)
    .set(updateData)
    .where(eq(score.id, id))
    .returning();

  // Fetch child details for logging
  const childDetails = await db.query.child.findFirst({
    where: (child, { eq }) => eq(child.id, updatedScore.child),
    columns: { name: true }
  });

  // Log the activity
  await logActivity({
    user,
    action: "UPDATE",
    entity: "Score",
    entityId: id,
    details: {
      scoreType: updatedScore.scoreType,
      child: childDetails?.name,
      changes: Object.keys(updateData)
    }
  });

  return updatedScore;
};

export const deleteScore = async (id: string, user?: any) => {
  const [deletedScore] = await db.delete(score).where(eq(score.id, id)).returning();

  // Log the activity
  if (deletedScore) {
    // Fetch child details for logging
    const childDetails = await db.query.child.findFirst({
      where: (child, { eq }) => eq(child.id, deletedScore.child),
      columns: { name: true }
    });

    await logActivity({
      user,
      action: "DELETE",
      entity: "Score",
      entityId: id,
      details: {
        scoreType: deletedScore.scoreType,
        child: childDetails?.name
      }
    });
  }

  return true;
};

export const getScoreStatistics = async () => {
  try {
    const { count } = await import("drizzle-orm");
    const { onSuccess, onError } = await import("$lib/fxns");

    const distributionResult = await db
      .select({
        group: score.scoreType,
        count: count()
      })
      .from(score)
      .groupBy(score.scoreType)

    const distribution = distributionResult.reduce((acc, curr) => {
      const key = curr.group || "Unknown"
      acc[key] = curr.count
      return acc
    }, {} as Record<string, number>)

    return onSuccess(distribution)
  } catch (error: any) {
    console.log("getScoreStatistics()", error.message)
    const { onError } = await import("$lib/fxns");
    return onError(error.message)
  }
}

export const getLeaderboard = async (scoreType?: string, ageGroup?: string, year?: string, limit: number = 50, offset: number = 0) => {
  try {
    const { sum, desc, eq, sql, and } = await import("drizzle-orm");
    const { child, file } = await import("$lib/db/schema");
    const { onSuccess, onError } = await import("$lib/fxns");

    // Calculate age group from date of birth
    const ageGroupSql = sql`
      CASE
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) BETWEEN 0 AND 2 THEN 'Nursery'
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) BETWEEN 3 AND 4 THEN 'Toddlers'
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) BETWEEN 5 AND 6 THEN 'Beginners'
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) BETWEEN 7 AND 9 THEN 'Primary'
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) BETWEEN 10 AND 12 THEN 'Juniors'
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) BETWEEN 13 AND 17 THEN 'Teenagers'
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) BETWEEN 18 AND 24 THEN 'Young Adults'
        WHEN EXTRACT(YEAR FROM AGE(${child.dateOfBirth})) >= 25 THEN 'Adults'
        ELSE 'Unknown'
      END
    `;

    let query = db
      .select({
        childId: child.id,
        childName: child.name,
        childAgeGroup: ageGroupSql,
        childImage: file.url,
        totalScore: sql<number>`sum(${score.normalizedScore})`.mapWith(Number),
        scoreCount: sql<number>`count(${score.id})`.mapWith(Number)
      })
      .from(score)
      .innerJoin(child, eq(score.child, child.id))
      .leftJoin(file, eq(child.image, file.id))
      .groupBy(child.id, child.name, child.dateOfBirth, file.url);

    const conditions = [];

    if (scoreType && scoreType !== 'all') {
      conditions.push(eq(score.scoreType, scoreType));
    }

    if (ageGroup && ageGroup !== 'all') {
      // Filter by calculated age group
      conditions.push(sql`${ageGroupSql} = ${ageGroup}`);
    }

    if (year && year !== 'all') {
      conditions.push(sql`EXTRACT(YEAR FROM ${score.submissionDate}) = ${year}`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const leaderboard = await query
      .orderBy(desc(sql`sum(${score.normalizedScore})`))
      .limit(limit + 1)
      .offset(offset);

    const hasMore = leaderboard.length > limit;
    const results = hasMore ? leaderboard.slice(0, limit) : leaderboard;

    return onSuccess({
      data: results,
      meta: {
        hasMore,
        nextOffset: hasMore ? offset + limit : null
      }
    });
  } catch (error: any) {
    console.log("getLeaderboard()", error.message);
    const { onError } = await import("$lib/fxns");
    return onError(error.message);
  }
};
