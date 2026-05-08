import { db } from "./drizzle" // Your drizzle database instance
import { user } from "./schema" // Your drizzle schema
import { eq, desc, or, ilike, count, isNull, and } from "drizzle-orm"
import type { iFetchMeta, iResult } from "$lib/interface"
import { emptyMetalist, MAX_ITEMS_PER_PAGE } from "$lib/constants"
import { onError, onSuccess } from "$lib/fxns"

export const getMe = async (email: string) => {
  try {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
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

export const getUser = async (userId: string) => {
  try {
    const result = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
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

export const addUser = async (data: any) => {
  try {
    const newUser = await db.insert(user).values(data).returning()
    return newUser[0]
  } catch (error: any) {
    console.log("Internal Error", error.message)
    return null
  }
}

export const deleteUser = async (id: string) => {
  try {
    const deletedUser = await db
      .delete(user)
      .where(eq(user.id, id))
      .returning()

    if (deletedUser.length === 0) {
      return onError("User not found")
    }

    return onSuccess(deletedUser[0])
  } catch (error: any) {
    console.log("deleteUser()", error.message)
    return onError(error.message)
  }
}

export const updateUser = async (id: string, data: any) => {
  try {
    const updatedUser = await db
      .update(user)
      .set(data)
      .where(eq(user.id, id))
      .returning()

    if (updatedUser.length === 0) {
      return onError("User not found")
    }

    return onSuccess(updatedUser[0])
  } catch (error: any) {
    console.log("updateUser()", error.message)
    return onError(error.message)
  }
}

export const getUsers = async () => {
  try {
    const users = await db
      .select()
      .from(user)
      .orderBy(desc(user.updatedAt))
      .limit(200)

    return onSuccess(users)
  } catch (error: any) {
    console.log("getUsers()", error.message)
    return onError(error.message)
  }
}

export const getUsersBySearch = async (searchUser: string, offset: number) => {
  try {
    // Build search conditions across user fields
    // Note: firstName and lastName are not in your current schema, 
    // but I've included them as comments in case you add them later
    const searchCondition = or(
      ilike(user.name, `%${searchUser}%`),
      ilike(user.email, `%${searchUser}%`),
      ilike(user.role, `%${searchUser}%`)
      // ilike(user.firstName, `%${searchUser}%`), // Add if you have these fields
      // ilike(user.lastName, `%${searchUser}%`)   // Add if you have these fields
    )

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(user)
      .where(searchCondition)

    const total = totalResult[0].count

    // Get paginated results
    const users = await db
      .select()
      .from(user)
      .where(searchCondition)
      .orderBy(desc(user.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    if (!users || users.length === 0) {
      throw new Error('No matching users')
    }

    // Calculate pagination meta
    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total
    const hasPreviousPage = offset > 0
    const totalPages = Math.ceil(total / MAX_ITEMS_PER_PAGE)
    const currentPage = Math.floor(offset / MAX_ITEMS_PER_PAGE) + 1

    const usersMeta: iFetchMeta = {
      total,
      meta: {
        cursor: users.length > 0 ? users[users.length - 1].id : '',
        more: hasNextPage,
        size: users.length
      },
      data: users
    }

    return onSuccess(usersMeta)
  } catch (error: any) {
    console.log("getUsersBySearch()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}

// Additional helper functions that might be useful

export const getUsersByRole = async (role: string) => {
  try {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.role, role))
      .orderBy(user.name)

    return onSuccess(users)
  } catch (error: any) {
    console.log("getUsersByRole()", error.message)
    return onError(error.message)
  }
}

export const getActiveUsers = async () => {
  try {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.banned, false))
      .orderBy(desc(user.updatedAt))

    return onSuccess(users)
  } catch (error: any) {
    console.log("getActiveUsers()", error.message)
    return onError(error.message)
  }
}

export const getBannedUsers = async () => {
  try {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.banned, true))
      .orderBy(desc(user.banExpires))

    return onSuccess(users)
  } catch (error: any) {
    console.log("getBannedUsers()", error.message)
    return onError(error.message)
  }
}

export const getUsersWithoutRole = async () => {
  try {
    const users = await db
      .select()
      .from(user)
      .where(isNull(user.role))
      .orderBy(desc(user.createdAt))

    return onSuccess(users)
  } catch (error: any) {
    console.log("getUsersWithoutRole()", error.message)
    return onError(error.message)
  }
}

export const searchUsersByEmail = async (emailPattern: string) => {
  try {
    const users = await db
      .select()
      .from(user)
      .where(ilike(user.email, `%${emailPattern}%`))
      .orderBy(user.email)

    return onSuccess(users)
  } catch (error: any) {
    console.log("searchUsersByEmail()", error.message)
    return onError(error.message)
  }
}

// Helper function for user statistics
export const getUserStats = async () => {
  try {
    const totalUsers = await db
      .select({ count: count() })
      .from(user)

    const activeUsers = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.banned, false))

    const bannedUsers = await db
      .select({ count: count() })
      .from(user)
      .where(eq(user.banned, true))

    const stats = {
      total: totalUsers[0].count,
      active: activeUsers[0].count,
      banned: bannedUsers[0].count
    }

    return onSuccess(stats)
  } catch (error: any) {
    console.log("getUserStats()", error.message)
    return onError(error.message)
  }
}

export const getUsersBySearchFilter = async (params: Record<string, string>) => {
  try {
    // Destructure params
    const { 
      search: searchTerm = "", 
      offset: offsetStr = "0",
      name,
      email,
      role,
      banned,
      emailVerified
    } = params

    const offset = parseInt(offsetStr, 10) || 0
    const cleanSearchTerm = searchTerm?.trim() || ""

    // Build base conditions array
    const conditions = []

    // Add search condition if search term exists
    if (cleanSearchTerm.length > 0) {
      conditions.push(
        or(
          ilike(user.name, `%${cleanSearchTerm}%`),
          ilike(user.email, `%${cleanSearchTerm}%`),
          ilike(user.role, `%${cleanSearchTerm}%`),
          ilike(user.banReason, `%${cleanSearchTerm}%`)
        )
      )
    }

    // Add specific field filters
    if (name) conditions.push(ilike(user.name, `%${name}%`))
    if (email) conditions.push(ilike(user.email, `%${email}%`))
    if (role) conditions.push(eq(user.role, role))
    if (banned) {
      const isBanned = banned.toLowerCase() === 'true'
      conditions.push(eq(user.banned, isBanned))
    }
    if (emailVerified) {
      const isVerified = emailVerified.toLowerCase() === 'true'
      conditions.push(eq(user.emailVerified, isVerified))
    }

    // Combine all conditions with AND
    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined

    // Get total count for pagination
    const totalResult = await db
      .select({ count: count() })
      .from(user)
      .where(whereCondition)

    const total = totalResult[0].count

    // Get paginated results
    const users = await db
      .select()
      .from(user)
      .where(whereCondition)
      .orderBy(desc(user.createdAt))
      .limit(MAX_ITEMS_PER_PAGE)
      .offset(offset)

    // Calculate pagination meta
    const hasNextPage = offset + MAX_ITEMS_PER_PAGE < total
    const hasPreviousPage = offset > 0
    const totalPages = Math.ceil(total / MAX_ITEMS_PER_PAGE)
    const currentPage = Math.floor(offset / MAX_ITEMS_PER_PAGE) + 1

    const usersMeta: iFetchMeta = {
      total,
      meta: {
        cursor: users.length > 0 ? users[users.length - 1].id : '',
        more: hasNextPage,
        size: users.length
      },
      data: users
    }

    return onSuccess(usersMeta)
  } catch (error: any) {
    console.log("getUsersBySearchFilter()", error.message)
    return {
      status: "error",
      message: error.message,
      data: emptyMetalist
    } satisfies iResult
  }
}