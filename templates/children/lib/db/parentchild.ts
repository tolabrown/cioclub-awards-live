import { db } from "./drizzle"
import { parentChild, parent, child } from "./schema"
import { eq, and, desc } from "drizzle-orm"
import type { iResult } from "$lib/interface"
import { onError, onSuccess } from "$lib/fxns"
import { logActivity } from "./log"

export const getParentChild = async (id: string) => {
  try {
    const result = await db
      .select()
      .from(parentChild)
      .where(eq(parentChild.id, id))
      .limit(1)

    if (!result || result.length === 0) {
      return null
    }

    return result[0]
  } catch (error: any) {
    console.log("Internal Error", error.message)
    return null
  }
}

export const addParentChild = async (data: any, user?: any) => {
  try {
    // Remove id if present to let DB generate it
    const { id, ...relationData } = data;
    const newRelation = await db.insert(parentChild).values(relationData).returning()

    // Log the activity
    await logActivity({
      user,
      action: "CREATE",
      entity: "ParentChild",
      entityId: newRelation[0].id,
      details: { parentId: newRelation[0].parentId, childId: newRelation[0].childId, isPrimary: newRelation[0].isPrimary }
    })

    return newRelation[0]
  } catch (error: any) {
    console.log("Internal Error", error.message)
    return null
  }
}

export const deleteParentChild = async (id: string, user?: any) => {
  try {
    const deleted = await db
      .delete(parentChild)
      .where(eq(parentChild.id, id))
      .returning()

    if (deleted.length === 0) {
      return onError("Relationship not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "DELETE",
      entity: "ParentChild",
      entityId: id,
      details: { parentId: deleted[0].parentId, childId: deleted[0].childId }
    })

    return onSuccess(deleted[0])
  } catch (error: any) {
    console.log("deleteParentChild()", error.message)
    return onError(error.message)
  }
}

export const updateParentChild = async (id: string, data: any, user?: any) => {
  try {
    const updated = await db
      .update(parentChild)
      .set(data)
      .where(eq(parentChild.id, id))
      .returning()

    if (updated.length === 0) {
      return onError("Relationship not found")
    }

    // Log the activity
    await logActivity({
      user,
      action: "UPDATE",
      entity: "ParentChild",
      entityId: id,
      details: { changes: Object.keys(data) }
    })

    return onSuccess(updated[0])
  } catch (error: any) {
    console.log("updateParentChild()", error.message)
    return onError(error.message)
  }
}

// Get all parents for a specific child
export const getParentsByChildId = async (childId: string) => {
  try {
    const results = await db
      .select({
        parentChild: parentChild,
        parent: parent
      })
      .from(parentChild)
      .innerJoin(parent, eq(parentChild.parentId, parent.id))
      .where(eq(parentChild.childId, childId))
      .orderBy(desc(parentChild.isPrimary))

    return onSuccess(results)
  } catch (error: any) {
    console.log("getParentsByChildId()", error.message)
    return onError(error.message)
  }
}

// Get all children for a specific parent
export const getChildrenByParentId = async (parentId: string) => {
  try {
    const results = await db
      .select({
        parentChild: parentChild,
        child: child
      })
      .from(parentChild)
      .innerJoin(child, eq(parentChild.childId, child.id))
      .where(eq(parentChild.parentId, parentId))
      .orderBy(desc(child.createdAt))

    return onSuccess(results)
  } catch (error: any) {
    console.log("getChildrenByParentId()", error.message)
    return onError(error.message)
  }
}

// Check if a parent-child relationship exists
export const parentChildExists = async (parentId: string, childId: string) => {
  try {
    const result = await db
      .select()
      .from(parentChild)
      .where(
        and(
          eq(parentChild.parentId, parentId),
          eq(parentChild.childId, childId)
        )
      )
      .limit(1)

    return result.length > 0
  } catch (error: any) {
    console.log("parentChildExists()", error.message)
    return false
  }
}

// Delete all relationships for a child
export const deleteParentChildByChildId = async (childId: string, user?: any) => {
  try {
    const deleted = await db
      .delete(parentChild)
      .where(eq(parentChild.childId, childId))
      .returning()

    // Log the activity
    if (deleted.length > 0) {
      await logActivity({
        user,
        action: "DELETE",
        entity: "ParentChild",
        entityId: childId, // Using childId as entityId for bulk delete context
        details: { description: `Deleted ${deleted.length} parent relationships for child ${childId}` }
      })
    }

    return onSuccess(deleted)
  } catch (error: any) {
    console.log("deleteParentChildByChildId()", error.message)
    return onError(error.message)
  }
}

// Delete all relationships for a parent
export const deleteParentChildByParentId = async (parentId: string, user?: any) => {
  try {
    const deleted = await db
      .delete(parentChild)
      .where(eq(parentChild.parentId, parentId))
      .returning()

    // Log the activity
    if (deleted.length > 0) {
      await logActivity({
        user,
        action: "DELETE",
        entity: "ParentChild",
        entityId: parentId, // Using parentId as entityId for bulk delete context
        details: { description: `Deleted ${deleted.length} child relationships for parent ${parentId}` }
      })
    }

    return onSuccess(deleted)
  } catch (error: any) {
    console.log("deleteParentChildByParentId()", error.message)
    return onError(error.message)
  }
}
