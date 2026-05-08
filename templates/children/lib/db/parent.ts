import { db } from "./drizzle"
import { parent } from "./schema"
import { eq, desc, or, ilike, count, and, getTableColumns } from "drizzle-orm"
import type { iFetchMeta, iResult } from "$lib/interface"
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants"
import { onError, onSuccess } from "$lib/fxns"
import { logActivity } from "./log"
import { calculateAgeGroup } from "$lib/utils"

export const getParent = async (parentId: string) => {
  try {
    const result = await db
      .select()
      .from(parent)
      .where(eq(parent.id, parentId))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    const parentData = result[0]

    // Get children for this parent
    const { child, parentChild, file } = await import('./schema')
    const childrenResult = await db
      .select({
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        active: child.active,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        image: {
          id: file.id,
          url: file.url,
          name: file.name,
          type: file.type
        }
      })
      .from(parentChild)
      .innerJoin(child, eq(parentChild.childId, child.id))
      .leftJoin(file, eq(child.image, file.id))
      .where(eq(parentChild.parentId, parentId))

    return {
      ...parentData,
      children: childrenResult.map(c => ({
        ...c,
        ageGroup: calculateAgeGroup(c.dateOfBirth)
      }))
    }
  } catch (error: any) {
    console.log("Internal Error", error.message)
    return null
  }
}

export const addParent = async (data: any, user?: any) => {
  try {
    // Remove id if present to let DB generate it
    const { id, ...parentData } = data;
    const newParent = await db.insert(parent).values(parentData).returning()

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "Parent",
      entityId: newParent[0].id,
      details: { name: newParent[0].name, phone: newParent[0].phone }
    })

    return newParent[0]
  } catch (error: any) {
    console.log("Internal Error", error.message)
    return null
  }
}

export const deleteParent = async (id: string, user?: any) => {
  try {
    const deletedParent = await db
      .delete(parent)
      .where(eq(parent.id, id))
      .returning()

    if (deletedParent.length === 0) {
      return onError("Parent not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "Parent",
      entityId: id,
      details: { name: deletedParent[0].name }
    })

    return onSuccess(deletedParent[0])
  } catch (error: any) {
    console.log("deleteParent()", error.message)
    return onError(error.message)
  }
}

export const updateParent = async (id: string, data: any, user?: any) => {
  try {
    const updatedParent = await db
      .update(parent)
      .set(data)
      .where(eq(parent.id, id))
      .returning()

    if (updatedParent.length === 0) {
      return onError("Parent not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "UPDATE",
      entity: "Parent",
      entityId: id,
      details: { name: updatedParent[0].name, changes: Object.keys(data) }
    })

    return onSuccess(updatedParent[0])
  } catch (error: any) {
    console.log("updateParent()", error.message)
    return onError(error.message)
  }
}

export const getParents = async () => {
  try {
    const parents = await db
      .select()
      .from(parent)
      .orderBy(desc(parent.updatedAt))
      .limit(200)

    return onSuccess(parents)
  } catch (error: any) {
    console.log("getParents()", error.message)
    return onError(error.message)
  }
}

export const getParentsBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
    } = params

    const offset = parseInt(offsetStr, 10) || 0
    const cleanSearchTerm = searchTerm?.trim() || ""

    // Build base conditions array
    const conditions = []

    // Add search condition if search term exists
    if (cleanSearchTerm.length > 0) {
      conditions.push(
        or(
          ilike(parent.name, `%${cleanSearchTerm}%`),
          ilike(parent.phone, `%${cleanSearchTerm}%`),
          ilike(parent.email, `%${cleanSearchTerm}%`)
        )
      )
    }

    // Dynamic filtering based on schema columns
    const parentColumns = getTableColumns(parent);
    const excludedParams = ['search', 'offset', 'limit'];

    Object.keys(params).forEach((key) => {
      if (excludedParams.includes(key)) return;

      // Check if key exists in parent table columns
      if (key in parentColumns) {
        const value = params[key];
        const column = parentColumns[key as keyof typeof parentColumns];
        const columnType = column.dataType; // Store in variable to avoid type narrowing issues

        // Handle different column types
        if (columnType === 'string') {
          // Case-insensitive search for strings
          conditions.push(ilike(column as any, value));
          // @ts-ignore
        } else if (columnType === 'boolean') {
          conditions.push(eq(column as any, value === 'true'));
        } else if (columnType === 'date') {
          // Handle date comparisons
          conditions.push(eq(column as any, new Date(value)));
        } else if (columnType === 'number') {
          // Handle numeric comparisons
          conditions.push(eq(column as any, Number(value)));
        } else {
          // Default equality for other types
          conditions.push(eq(column as any, value));
        }
      }
    });

    // Combine all conditions with AND
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(parent)
      .where(whereCondition)

    const total = totalResult[0].count

    // Get paginated results
    const parents = await db
      .select()
      .from(parent)
      .where(whereCondition)
      .orderBy(desc(parent.updatedAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    // For each parent, get their children
    const { child, parentChild, file } = await import('./schema')
    const enrichedParents = await Promise.all(
      parents.map(async (p) => {
        // Get children for this parent
        const childrenResult = await db
          .select({
            id: child.id,
            name: child.name,
            dateOfBirth: child.dateOfBirth,
            gender: child.gender,
            active: child.active,
            image: {
              id: file.id,
              url: file.url,
              name: file.name,
              type: file.type
            }
          })
          .from(parentChild)
          .innerJoin(child, eq(parentChild.childId, child.id))
          .leftJoin(file, eq(child.image, file.id))
          .where(eq(parentChild.parentId, p.id))

        return {
          ...p,
          children: childrenResult.map(c => ({
            ...c,
            ageGroup: calculateAgeGroup(c.dateOfBirth)
          }))
        }
      })
    )

    // Calculate pagination meta
    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total

    const parentsMeta: iFetchMeta = {
      total,
      meta: {
        cursor: enrichedParents.length > 0 ? enrichedParents[enrichedParents.length - 1].id : '',
        more: hasNextPage,
        size: enrichedParents.length
      },
      data: enrichedParents as any
    }

    return onSuccess(parentsMeta)
  } catch (error: any) {
    console.log("getParentsBySearchFilter()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

export const getParentByPhone = async (phone: string) => {
  try {
    const result = await db
      .select()
      .from(parent)
      .where(eq(parent.phone, phone))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error: any) {
    console.log("getParentByPhone()", error.message)
    return null
  }
}

export const getParentStatistics = async () => {
  try {
    const distributionResult = await db
      .select({
        group: parent.parentType,
        count: count()
      })
      .from(parent)
      .groupBy(parent.parentType)

    const distribution = distributionResult.reduce((acc, curr) => {
      const key = curr.group || "Unknown"
      acc[key] = curr.count
      return acc
    }, {} as Record<string, number>)

    return onSuccess(distribution)
  } catch (error: any) {
    console.log("getParentStatistics()", error.message)
    return onError(error.message)
  }
}
