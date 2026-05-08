import { Role } from '$lib/constants'
import { createAccessControl } from 'better-auth/plugins/access'
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access'

const statements = {
  ...defaultStatements,
  // Children management
  children: ['create', 'read', 'update', 'delete', 'export', 'view-analytics'],

  // Parent management
  parents: ['create', 'read', 'update', 'delete', 'link-child', 'unlink-child'],

  // File management
  files: ['create', 'read', 'update', 'delete', 'upload', 'download'],

  // User & role management
  users: ['create', 'read', 'update', 'delete', 'manage', 'change-role', 'invite', 'ban', 'unban'],
  roles: ['assign', 'revoke', 'elevate', 'demote'],

  // Analytics & reporting
  analytics: ['view-dashboard', 'view-children', 'view-parents', 'export-reports'],
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
    children: ['create', 'read', 'update', 'delete', 'export', 'view-analytics'],
    parents: ['create', 'read', 'update', 'delete', 'link-child', 'unlink-child'],
    files: ['create', 'read', 'update', 'delete', 'upload', 'download'],
    users: ['create', 'read', 'update', 'delete', 'manage', 'change-role', 'invite', 'ban', 'unban'],
    roles: ['assign', 'revoke', 'elevate', 'demote'],
    analytics: ['view-dashboard', 'view-children', 'view-parents', 'export-reports'],
    reports: ['create', 'read', 'schedule', 'export'],
    settings: ['read', 'update', 'update:general', 'update:notifications', 'update:security'],
    system: ['configure', 'backup', 'restore', 'audit', 'monitor', 'maintenance']
  }),

  [Role.EDITOR]: ac.newRole({
    // Editor can manage children, parents, and files but has limited system access
    children: ['create', 'read', 'update', 'delete', 'export', 'view-analytics'],
    parents: ['create', 'read', 'update', 'delete', 'link-child', 'unlink-child'],
    files: ['create', 'read', 'update', 'delete', 'upload', 'download'],
    users: ['read'],
    roles: [],
    analytics: ['view-dashboard', 'view-children', 'view-parents', 'export-reports'],
    reports: ['read', 'export'],
    settings: ['read'], // View only
    system: ['audit'] // Can view audit logs only
  }),

  [Role.PARENT]: ac.newRole({
    // Parent can only view and manage their own children
    children: ['read', 'update'], // Can read and update their own children only
    parents: ['read', 'update'], // Can read and update their own profile
    files: ['read', 'upload', 'download'], // Can manage files for their own children
    users: [],
    roles: [],
    analytics: [], // No analytics access
    reports: [],
    settings: ['read'], // Can view settings
    system: []
  }),

  [Role.USER]: ac.newRole({
    // Staff user - limited operational access
    children: ['read'],
    parents: ['read'],
    files: ['read'],
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
  [Role.ADMIN]: 4,
  [Role.EDITOR]: 3,
  [Role.PARENT]: 2,
  [Role.USER]: 1
} as const

export const hasHigherRole = (userRole: Role, targetRole: Role): boolean => {
  return roleHierarchy[userRole] > roleHierarchy[targetRole]
}

// Role change permissions - core business logic
export const canChangeUserRole = (
  actorRole: Role,
  targetCurrentRole: Role,
  targetNewRole: Role
): { allowed: boolean; reason?: string } => {
  const actorLevel = roleHierarchy[actorRole]
  const targetCurrentLevel = roleHierarchy[targetCurrentRole]
  const targetNewLevel = roleHierarchy[targetNewRole]

  // Only Admin can change roles
  if (actorRole !== Role.ADMIN) {
    return { allowed: false, reason: 'Only administrators can change user roles' }
  }

  // Admin can change any role below them
  if (targetCurrentRole === Role.ADMIN && targetCurrentLevel >= actorLevel) {
    return { allowed: false, reason: 'Cannot modify other administrator roles' }
  }

  // Admin cannot be demoted by another admin (requires system action)
  if (targetNewLevel >= actorLevel && targetCurrentRole === Role.ADMIN) {
    return { allowed: false, reason: 'Administrator demotion requires system-level action' }
  }

  return { allowed: true }
}

// Bulk role validation
export const validateRoleTransitions = (
  actorRole: Role,
  transitions: Array<{ userId: string; currentRole: Role; newRole: Role }>
): Array<{ userId: string; allowed: boolean; reason?: string }> => {
  return transitions.map(({ userId, currentRole, newRole }) => ({
    userId,
    ...canChangeUserRole(actorRole, currentRole, newRole)
  }))
}

// Resource-specific permission helpers
export const canManageChildren = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR].includes(role)

export const canViewChildren = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR, Role.PARENT, Role.USER].includes(role)

export const canManageParents = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR].includes(role)

export const canViewParents = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR, Role.PARENT, Role.USER].includes(role)

export const canManageFiles = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR].includes(role)

export const canUploadFiles = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR, Role.PARENT].includes(role)

export const canViewAnalytics = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR, Role.USER].includes(role)

export const canExportReports = (role: Role): boolean =>
  [Role.ADMIN, Role.EDITOR].includes(role)

export const canManageSettings = (role: Role): boolean =>
  role === Role.ADMIN

export const canManageUsers = (role: Role): boolean =>
  role === Role.ADMIN

export const canAccessSystem = (role: Role): boolean =>
  role === Role.ADMIN

// Parent-child ownership validation
export const canAccessChild = (
  userRole: Role,
  userId: string,
  childOwnerId: string | null
): boolean => {
  // Admin and Editor can access all children
  if ([Role.ADMIN, Role.EDITOR].includes(userRole)) return true

  // Parents can only access their own children
  if (userRole === Role.PARENT && childOwnerId) {
    return userId === childOwnerId
  }

  // Users have read-only access to all children
  if (userRole === Role.USER) return true

  return false
}

// Ownership validation for resource access
export const canAccessResource = (
  userRole: Role,
  userId: string,
  resourceOwnerId: string,
  resource: keyof typeof statements,
  action: string
): boolean => {
  // Admin and Editor bypass ownership checks
  if ([Role.ADMIN, Role.EDITOR].includes(userRole)) return true

  // For PARENT and USER roles, check if they own the resource
  return userId === resourceOwnerId && checkPermission(userRole, resource, action)
}

// Security helpers
export const isAdmin = (role: Role): boolean => role === Role.ADMIN
export const isEditor = (role: Role): boolean => role === Role.EDITOR
export const isParent = (role: Role): boolean => role === Role.PARENT
export const isStaff = (role: Role): boolean => [Role.ADMIN, Role.EDITOR, Role.USER].includes(role)

// Role utility functions
export const getRoleDisplayName = (role: Role): string => {
  const displayNames = {
    [Role.ADMIN]: 'Administrator',
    [Role.EDITOR]: 'Editor',
    [Role.PARENT]: 'Parent',
    [Role.USER]: 'Staff User'
  }
  return displayNames[role] || 'Unknown Role'
}

export const getRoleDescription = (role: Role): string => {
  const descriptions = {
    [Role.ADMIN]: 'Full access to all system operations, settings, and management',
    [Role.EDITOR]: 'Manage children, parents, and files with limited system access',
    [Role.PARENT]: 'View and manage own children with limited file upload access',
    [Role.USER]: 'Read-only access to children and parents with basic dashboard access'
  }
  return descriptions[role] || 'No description available'
}

export const getAllowedRolesForAssignment = (actorRole: Role): Role[] => {
  if (actorRole === Role.ADMIN) {
    return [Role.EDITOR, Role.PARENT, Role.USER]
  }
  return []
}

// Audit helpers for tracking role and permission changes
export interface RoleChangeAudit {
  actorId: string
  actorRole: Role
  targetUserId: string
  previousRole: Role
  newRole: Role
  timestamp: Date
  reason?: string
  ipAddress?: string
  userAgent?: string
}

export interface PermissionAudit {
  userId: string
  userRole: Role
  resource: string
  action: string
  allowed: boolean
  timestamp: Date
  ipAddress?: string
  metadata?: Record<string, any>
}

export const createRoleChangeAuditLog = (
  actorId: string,
  actorRole: Role,
  targetUserId: string,
  previousRole: Role,
  newRole: Role,
  reason?: string,
  ipAddress?: string,
  userAgent?: string
): RoleChangeAudit => ({
  actorId,
  actorRole,
  targetUserId,
  previousRole,
  newRole,
  timestamp: new Date(),
  reason,
  ipAddress,
  userAgent
})

export const createPermissionAuditLog = (
  userId: string,
  userRole: Role,
  resource: string,
  action: string,
  allowed: boolean,
  ipAddress?: string,
  metadata?: Record<string, any>
): PermissionAudit => ({
  userId,
  userRole,
  resource,
  action,
  allowed,
  timestamp: new Date(),
  ipAddress,
  metadata
})

// Permission validation for sensitive operations
export const validateSensitiveOperation = (
  userRole: Role,
  operation: 'delete-child' | 'delete-parent' | 'delete-file' | 'delete-user' | 'change-role' | 'ban-user'
): { allowed: boolean; requiresConfirmation: boolean; reason?: string } => {
  const sensitiveOps = {
    'delete-child': Role.ADMIN,
    'delete-parent': Role.ADMIN,
    'delete-file': Role.ADMIN,
    'delete-user': Role.ADMIN,
    'change-role': Role.ADMIN,
    'ban-user': Role.ADMIN
  }

  const requiredRole = sensitiveOps[operation]
  const allowed = roleHierarchy[userRole] >= roleHierarchy[requiredRole]

  return {
    allowed,
    requiresConfirmation: allowed, // All sensitive operations require confirmation
    reason: allowed ? undefined : `Requires ${getRoleDisplayName(requiredRole)} role or higher`
  }
}

// Batch permission checking for UI rendering optimization
export const checkMultiplePermissions = (
  userRole: Role,
  checks: Array<{ resource: keyof typeof statements; action: string }>
): Record<string, boolean> => {
  const results: Record<string, boolean> = {}

  checks.forEach(({ resource, action }) => {
    const key = `${resource}:${action}`
    results[key] = checkPermission(userRole, resource, action)
  })

  return results
}

// Feature flag integration (for gradual rollout of permissions)
export const checkFeatureAccess = (
  userRole: Role,
  feature: string,
  enabledRoles: Role[] = [Role.ADMIN]
): boolean => {
  return enabledRoles.includes(userRole)
}

export default {
  roles,
  checkPermission,
  canChangeUserRole,
  validateRoleTransitions,
  roleHierarchy,
  hasHigherRole,
  getRoleDisplayName,
  getRoleDescription,
  getAllowedRolesForAssignment,
  createRoleChangeAuditLog,
  createPermissionAuditLog,
  validateSensitiveOperation,
  checkMultiplePermissions,
  canAccessResource,
  canAccessChild
}