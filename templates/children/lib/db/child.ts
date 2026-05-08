import { db } from "./drizzle"
import { child, parent, parentChild, childFile, file } from "./schema"
import { eq, desc, or, ilike, count, and, getTableColumns, sql, isNotNull, isNull, gte, lte } from "drizzle-orm"
import type { iFetchMeta } from "$lib/interface"
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants"
import { onError, onSuccess } from "$lib/fxns"
import type { iResult } from "$lib/interface"
import { logActivity } from "./log"
import { calculateAgeGroup } from "$lib/utils"

// Helper function to convert age group to date of birth range for database filtering
function getDateRangeForAgeGroup(ageGroup: string): { minDate: Date; maxDate: Date } | null {
  const today = new Date();
  const ageGroupMapping: Record<string, { min: number; max: number }> = {
    "Nursery": { min: 0, max: 2 },
    "Toddlers": { min: 3, max: 4 },
    "Beginners": { min: 5, max: 6 },
    "Primary": { min: 7, max: 9 },
    "Juniors": { min: 10, max: 12 },
    "Teenagers": { min: 13, max: 17 },
    "Young Adults": { min: 18, max: 24 },
    "Adults": { min: 25, max: 200 },
  };

  const range = ageGroupMapping[ageGroup];
  if (!range) return null;

  // Calculate date range from age range
  // Someone aged X was born between (today - max age - 1 year + 1 day) and (today - min age)
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() - range.min);

  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - range.max - 1);
  minDate.setDate(minDate.getDate() + 1);

  return { minDate, maxDate };
}

// Helper function to get file details for select
const getFileDetails = () => ({
  id: file.id,
  remoteId: file.remoteId,
  url: file.url,
  size: file.size,
  type: file.type,
  name: file.name,
  createdAt: file.createdAt,
  updatedAt: file.updatedAt
})

// Helper function to get parent details for select
const getParentDetails = () => ({
  id: parent.id,
  name: parent.name,
  phone: parent.phone,
  email: parent.email,
  parentType: parent.parentType,
  createdAt: parent.createdAt,
  updatedAt: parent.updatedAt
})

export const getChild = async (childId: string) => {
  try {
    const result = await db
      .select({
        // Child fields
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        allergies: child.allergies,
        emergencyContact: child.emergencyContact,
        notes: child.notes,
        active: child.active,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        // Avatar/Image file (leftJoin will return null if no image)
        image: {
          id: file.id,
          remoteId: file.remoteId,
          url: file.url,
          size: file.size,
          type: file.type,
          name: file.name,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      })
      .from(child)
      .leftJoin(file, eq(child.image, file.id))
      .where(eq(child.id, childId))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    const childData = result[0]

    // Get all parent relationships for this child
    const parentRelationships = await db
      .select({
        parent: getParentDetails(),
        isPrimary: parentChild.isPrimary
      })
      .from(parentChild)
      .innerJoin(parent, eq(parentChild.parentId, parent.id))
      .where(eq(parentChild.childId, childId))

    // Get all additional media files for this child
    const filesResult = await db
      .select({
        file: getFileDetails()
      })
      .from(childFile)
      .innerJoin(file, eq(childFile.fileId, file.id))
      .where(eq(childFile.childId, childId))

    const files = filesResult.map(r => r.file)

    // Return child with all related data and computed age group
    return {
      ...childData,
      ageGroup: calculateAgeGroup(childData.dateOfBirth),
      parents: parentRelationships.map(rel => rel.parent),
      files
    }
  } catch (error: any) {
    console.log("getChild() Error", error.message)
    return null
  }
}

export const addChild = async (data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      active: typeof data.active === 'string' ? data.active === 'true' : data.active
    }
    // Remove id and ageGroup from data (ageGroup is computed, not stored)
    delete sanitizedData.id;
    delete sanitizedData.ageGroup;

    const newChild = await db.insert(child).values(sanitizedData).returning()

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "Child",
      entityId: newChild[0].id,
      details: { name: newChild[0].name }
    })

    return newChild[0]
  } catch (error: any) {
    console.log("Internal Error", error.message)
    return null
  }
}

export const deleteChild = async (id: string, user?: any) => {
  try {
    const deletedChild = await db
      .delete(child)
      .where(eq(child.id, id))
      .returning()

    if (deletedChild.length === 0) {
      return onError("Child not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "Child",
      entityId: id,
      details: { name: deletedChild[0].name }
    })

    return onSuccess(deletedChild[0])
  } catch (error: any) {
    console.log("deleteChild()", error.message)
    return onError(error.message)
  }
}

export const updateChild = async (id: string, data: any, user?: any) => {
  try {
    const sanitizedData = {
      ...data,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      active: typeof data.active === 'string' ? data.active === 'true' : data.active
    }

    // Remove id and ageGroup from data (ageGroup is computed, not stored)
    delete sanitizedData.id;
    delete sanitizedData.ageGroup;

    // Remove undefined values to avoid overwriting with null/undefined if not intended
    Object.keys(sanitizedData).forEach(key => sanitizedData[key] === undefined && delete sanitizedData[key]);

    const updatedChild = await db
      .update(child)
      .set(sanitizedData)
      .where(eq(child.id, id))
      .returning()

    if (updatedChild.length === 0) {
      return onError("Child not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "UPDATE",
      entity: "Child",
      entityId: id,
      details: { name: updatedChild[0].name, changes: Object.keys(sanitizedData) }
    })

    return onSuccess(updatedChild[0])
  } catch (error: any) {
    console.log("updateChild()", error.message)
    return onError(error.message)
  }
}

export const getChildren = async () => {
  try {
    const children = await db
      .select({
        // Child fields
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        allergies: child.allergies,
        emergencyContact: child.emergencyContact,
        notes: child.notes,
        active: child.active,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        // Avatar/Image file
        image: {
          id: file.id,
          remoteId: file.remoteId,
          url: file.url,
          size: file.size,
          type: file.type,
          name: file.name,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      })
      .from(child)
      .leftJoin(file, eq(child.image, file.id))
      .orderBy(desc(child.updatedAt))
      .limit(200)

    // For each child, get parents and additional files
    const enrichedChildren = await Promise.all(
      children.map(async (c) => {
        // Get parents
        const parentRelationships = await db
          .select({
            parent: getParentDetails(),
            isPrimary: parentChild.isPrimary
          })
          .from(parentChild)
          .innerJoin(parent, eq(parentChild.parentId, parent.id))
          .where(eq(parentChild.childId, c.id))

        // Get additional media files
        const filesResult = await db
          .select({
            file: getFileDetails()
          })
          .from(childFile)
          .innerJoin(file, eq(childFile.fileId, file.id))
          .where(eq(childFile.childId, c.id))

        return {
          ...c,
          ageGroup: calculateAgeGroup(c.dateOfBirth),
          parents: parentRelationships.map(rel => rel.parent),
          files: filesResult.map(r => r.file)
        }
      })
    )

    return onSuccess(enrichedChildren)
  } catch (error: any) {
    console.log("getChildren()", error.message)
    return onError(error.message)
  }
}

export const getChildrenBySearchFilter = async (params: Record<string, string>) => {
  try {
    const {
      search: searchTerm = "",
      offset: offsetStr = "0",
    } = params

    const offset = parseInt(offsetStr, 10) || 0
    const cleanSearchTerm = searchTerm?.trim() || ""

    // Build base conditions array
    const conditions = []

    // Dynamic filtering based on schema columns
    const childColumns = getTableColumns(child);
    const excludedParams = ['search', 'offset', 'limit', 'ageGroup', 'host', 'field', 'sortBy', 'month']; // Exclude non-column params

    // Month-based search
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const shortMonths = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const searchMonthIndex = months.indexOf(cleanSearchTerm.toLowerCase()) + 1 || shortMonths.indexOf(cleanSearchTerm.toLowerCase()) + 1;

    if (searchMonthIndex > 0) {
      conditions.push(sql`EXTRACT(MONTH FROM ${child.dateOfBirth}) = ${searchMonthIndex}`);
    } else if (cleanSearchTerm.length > 0) {
      // Add search condition if search term exists and is not a month
      conditions.push(
        or(
          ilike(child.name, `%${cleanSearchTerm}%`),
          ilike(child.allergies, `%${cleanSearchTerm}%`),
          ilike(child.notes, `%${cleanSearchTerm}%`),
          ilike(child.emergencyContact, `%${cleanSearchTerm}%`),
          ilike(child.gender, `%${cleanSearchTerm}%`),
          // Cast date to text for searching
          sql`${child.dateOfBirth}::text ilike ${`%${cleanSearchTerm}%`}`
        )
      )
    }

    // Handle ageGroup filter by converting to date of birth range
    const ageGroupFilter = params.ageGroup;
    if (ageGroupFilter) {
      const dateRange = getDateRangeForAgeGroup(ageGroupFilter);
      if (dateRange) {
        conditions.push(gte(child.dateOfBirth, dateRange.minDate));
        conditions.push(lte(child.dateOfBirth, dateRange.maxDate));
      }
    }

    // Explicit month filter
    const monthFilter = params.month;
    if (monthFilter) {
      const monthIdx = parseInt(monthFilter, 10);
      if (!isNaN(monthIdx) && monthIdx >= 1 && monthIdx <= 12) {
        conditions.push(sql`EXTRACT(MONTH FROM ${child.dateOfBirth}) = ${monthIdx}`);
      }
    }

    Object.keys(params).forEach((key) => {
      if (excludedParams.includes(key)) return;

      // Special handling for hasImage
      if (key === 'hasImage') {
        const value = params[key];
        if (value === 'true') {
          conditions.push(isNotNull(child.image));
        } else if (value === 'false') {
          conditions.push(isNull(child.image));
        }
        return;
      }

      // Check if key exists in child table columns
      if (key in childColumns) {
        const value = params[key];
        const column = childColumns[key as keyof typeof childColumns];

        // Handle different column types
        if (column.dataType === 'string') {
          // Case-insensitive search for strings
          conditions.push(ilike(column as any, value));
        } else if (column.dataType === 'boolean') {
          conditions.push(eq(column as any, value === 'true'));
        } else {
          // Default equality for other types (number, date, etc.)
          // Note: Date filtering from string might need specific handling if required later
          conditions.push(eq(column as any, value));
        }
      }
    });

    // Combine all conditions with AND
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // Determine ordering
    let orderBy: any[] = [desc(child.updatedAt)];

    if (params.sortBy === 'birthday') {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      orderBy = [
        // Upcoming birthdays this year first, then birthdays that already passed (next year)
        sql`CASE 
          WHEN (EXTRACT(MONTH FROM ${child.dateOfBirth}) > ${currentMonth}) 
            OR (EXTRACT(MONTH FROM ${child.dateOfBirth}) = ${currentMonth} AND EXTRACT(DAY FROM ${child.dateOfBirth}) >= ${currentDay}) 
          THEN 0 
          ELSE 1 
        END`,
        sql`EXTRACT(MONTH FROM ${child.dateOfBirth})`,
        sql`EXTRACT(DAY FROM ${child.dateOfBirth})`
      ];
    }

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(child)
      .where(whereCondition)

    const total = totalResult[0].count

    // Get all children to calculate distribution by age group
    const allChildren = await db
      .select({
        dateOfBirth: child.dateOfBirth,
      })
      .from(child)
      .where(whereCondition)

    // Calculate distribution by computed age group
    const distribution = allChildren.reduce((acc, curr) => {
      const ageGroup = calculateAgeGroup(curr.dateOfBirth);
      const key = ageGroup || "Unknown"
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get paginated results with avatar
    const children = await db
      .select({
        // Child fields
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        allergies: child.allergies,
        emergencyContact: child.emergencyContact,
        notes: child.notes,
        active: child.active,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        // Avatar/Image file
        image: {
          id: file.id,
          remoteId: file.remoteId,
          url: file.url,
          size: file.size,
          type: file.type,
          name: file.name,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      })
      .from(child)
      .leftJoin(file, eq(child.image, file.id))
      .where(whereCondition)
      .orderBy(...orderBy)
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    // Age group filtering now happens at database level via date range
    const filteredChildren = children;

    // For each child, get parents and additional files
    const enrichedChildren = await Promise.all(
      filteredChildren.map(async (c) => {
        // Get parents
        const parentRelationships = await db
          .select({
            parent: getParentDetails(),
            isPrimary: parentChild.isPrimary
          })
          .from(parentChild)
          .innerJoin(parent, eq(parentChild.parentId, parent.id))
          .where(eq(parentChild.childId, c.id))

        // Get additional media files
        const filesResult = await db
          .select({
            file: getFileDetails()
          })
          .from(childFile)
          .innerJoin(file, eq(childFile.fileId, file.id))
          .where(eq(childFile.childId, c.id))

        return {
          ...c,
          ageGroup: calculateAgeGroup(c.dateOfBirth),
          parents: parentRelationships.map(rel => rel.parent),
          files: filesResult.map(r => r.file)
        }
      })
    )

    // Calculate pagination meta
    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total
    const hasPreviousPage = offset > 0
    const totalPages = Math.ceil(total / MAX_ITEMS_PER_PAGE)
    const currentPage = Math.floor(offset / MAX_ITEMS_PER_PAGE) + 1

    const childrenMeta: iFetchMeta = {
      total,
      meta: {
        cursor: enrichedChildren.length > 0 ? enrichedChildren[enrichedChildren.length - 1].id : '',
        more: hasNextPage,
        size: enrichedChildren.length
      },
      data: enrichedChildren as any
    }

    return onSuccess(childrenMeta)
  } catch (error: any) {
    console.log("getChildrenBySearchFilter()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

export const getChildrenByAgeGroup = async (ageGroup: string) => {
  try {
    // Get all children first, then filter by computed age group
    const children = await db
      .select({
        // Child fields
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        allergies: child.allergies,
        emergencyContact: child.emergencyContact,
        notes: child.notes,
        active: child.active,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        // Avatar/Image file
        image: {
          id: file.id,
          remoteId: file.remoteId,
          url: file.url,
          size: file.size,
          type: file.type,
          name: file.name,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      })
      .from(child)
      .leftJoin(file, eq(child.image, file.id))
      .orderBy(desc(child.updatedAt))

    // Filter by computed age group
    const filteredChildren = children.filter(c => calculateAgeGroup(c.dateOfBirth) === ageGroup);

    // For each child, get parents and additional files
    const enrichedChildren = await Promise.all(
      filteredChildren.map(async (c) => {
        // Get parents
        const parentRelationships = await db
          .select({
            parent: getParentDetails(),
            isPrimary: parentChild.isPrimary
          })
          .from(parentChild)
          .innerJoin(parent, eq(parentChild.parentId, parent.id))
          .where(eq(parentChild.childId, c.id))

        // Get additional media files
        const filesResult = await db
          .select({
            file: getFileDetails()
          })
          .from(childFile)
          .innerJoin(file, eq(childFile.fileId, file.id))
          .where(eq(childFile.childId, c.id))

        return {
          ...c,
          ageGroup: calculateAgeGroup(c.dateOfBirth),
          parents: parentRelationships.map(rel => rel.parent),
          files: filesResult.map(r => r.file)
        }
      })
    )

    return onSuccess(enrichedChildren)
  } catch (error: any) {
    console.log("getChildrenByAgeGroup()", error.message)
    return onError(error.message)
  }
}

export const getActiveChildren = async () => {
  try {
    const children = await db
      .select({
        // Child fields
        id: child.id,
        name: child.name,
        dateOfBirth: child.dateOfBirth,
        gender: child.gender,
        allergies: child.allergies,
        emergencyContact: child.emergencyContact,
        notes: child.notes,
        active: child.active,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        // Avatar/Image file
        image: {
          id: file.id,
          remoteId: file.remoteId,
          url: file.url,
          size: file.size,
          type: file.type,
          name: file.name,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      })
      .from(child)
      .leftJoin(file, eq(child.image, file.id))
      .where(eq(child.active, true))
      .orderBy(desc(child.updatedAt))

    // For each child, get parents and additional files
    const enrichedChildren = await Promise.all(
      children.map(async (c) => {
        // Get parents
        const parentRelationships = await db
          .select({
            parent: getParentDetails(),
            isPrimary: parentChild.isPrimary
          })
          .from(parentChild)
          .innerJoin(parent, eq(parentChild.parentId, parent.id))
          .where(eq(parentChild.childId, c.id))

        // Get additional media files
        const filesResult = await db
          .select({
            file: getFileDetails()
          })
          .from(childFile)
          .innerJoin(file, eq(childFile.fileId, file.id))
          .where(eq(childFile.childId, c.id))

        return {
          ...c,
          ageGroup: calculateAgeGroup(c.dateOfBirth),
          parents: parentRelationships.map(rel => rel.parent),
          files: filesResult.map(r => r.file)
        }
      })
    )

    return onSuccess(enrichedChildren)
  } catch (error: any) {
    console.log("getActiveChildren()", error.message)
    return onError(error.message)
  }
}

export const getChildStatistics = async () => {
  try {
    const allChildren = await db
      .select({
        dateOfBirth: child.dateOfBirth,
      })
      .from(child)
      .where(eq(child.active, true))

    const ageGroups = [
      "Nursery", "Toddlers", "Beginners", "Primary", "Juniors", "Teenagers", "Young Adults", "Adults"
    ];

    // Initialize counts for all age groups
    const stats: Record<string, number> = {};
    ageGroups.forEach(g => stats[g] = 0);

    allChildren.forEach(curr => {
      const ageGroup = calculateAgeGroup(curr.dateOfBirth);
      if (ageGroup && ageGroup in stats) {
        stats[ageGroup]++;
      }
    });

    return onSuccess(stats)
  } catch (error: any) {
    console.log("getChildStatistics()", error.message)
    return onError(error.message)
  }
}

export const getBirthdayStatistics = async () => {
  try {
    const allChildren = await db
      .select({
        dateOfBirth: child.dateOfBirth,
      })
      .from(child)
      .where(eq(child.active, true))

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Initialize counts for all 12 months
    const stats: Record<string, number> = {};
    months.forEach(m => stats[m] = 0);

    allChildren.forEach(curr => {
      if (curr.dateOfBirth) {
        const monthIndex = new Date(curr.dateOfBirth).getMonth();
        stats[months[monthIndex]]++;
      }
    });

    return onSuccess(stats)
  } catch (error: any) {
    console.log("getBirthdayStatistics()", error.message)
    return onError(error.message)
  }
}
