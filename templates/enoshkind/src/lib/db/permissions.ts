import { Role } from '$lib/constants'
import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

const statements = {
  ...defaultStatements,
  // User & role management
  users: ['create', 'read', 'update', 'delete', 'manage', 'change-role', 'invite', 'ban', 'unban'],
  roles: ['assign', 'revoke', 'elevate', 'demote'],

  // Analytics & reporting
  analytics: ['view-dashboard', 'export-reports'],
  reports: ['create', 'read', 'schedule', 'export'],

  // Settings
  settings: ['read', 'update', 'update:general', 'update:notifications', 'update:security'],

  // System operations
  system: ['configure', 'backup', 'restore', 'audit', 'monitor', 'maintenance']
} as const

export const ac = createAccessControl(statements)

export const roles = {
  [Role.ADMIN]: ac.newRole({
    // Admin has full control over the entire system
    ...adminAc.statements,
    users: ['create', 'read', 'update', 'delete', 'manage', 'change-role', 'invite', 'ban', 'unban'],
    roles: ['assign', 'revoke', 'elevate', 'demote'],
    analytics: ['view-dashboard', 'export-reports'],
    reports: ['create', 'read', 'schedule', 'export'],
    settings: ['read', 'update', 'update:general', 'update:notifications', 'update:security'],
    system: ['configure', 'backup', 'restore', 'audit', 'monitor', 'maintenance']
  }),

  [Role.USER]: ac.newRole({
    // Regular user - limited access
    users: ['read'],
    roles: [],
    analytics: ['view-dashboard'],
    reports: ['read'],
    settings: ['read'],
    system: []
  })
}

// Enhanced permission checking with better error handling
export const checkPermission = (
  userRole: Role,
  resource: keyof typeof statements,
  action: string
): boolean => {
  try {
    const role = roles[userRole]
    if (!role) return false

    // @ts-ignore
    const resourcePermissions = role.statements[resource]
    return Array.isArray(resourcePermissions) && resourcePermissions.includes(action as any)
  } catch (error) {
    console.error('Permission check failed:', error)
    return false
  }
}

// Role hierarchy
export const roleHierarchy = {
  [Role.ADMIN]: 2,
  [Role.USER]: 1
} as const

export const hasHigherRole = (userRole: Role, targetRole: Role): boolean => {
  return roleHierarchy[userRole] > roleHierarchy[targetRole]
}

// Security helpers
export const isAdmin = (role: Role): boolean => role === Role.ADMIN

// Role utility functions
export const getRoleDisplayName = (role: Role): string => {
  const displayNames = {
    [Role.ADMIN]: 'Administrator',
    [Role.USER]: 'User'
  }
  return displayNames[role] || 'Unknown Role'
}

export const getRoleDescription = (role: Role): string => {
  const descriptions = {
    [Role.ADMIN]: 'Full access to all system operations, settings, and management',
    [Role.USER]: 'Basic access with limited dashboard viewing'
  }
  return descriptions[role] || 'No description available'
}

export const getAllowedRolesForAssignment = (actorRole: Role): Role[] => {
  if (actorRole === Role.ADMIN) {
    return [Role.USER]
  }
  return []
}

export default {
  roles,
  checkPermission,
  roleHierarchy,
  hasHigherRole,
  getRoleDisplayName,
  getRoleDescription,
  getAllowedRolesForAssignment,
}
