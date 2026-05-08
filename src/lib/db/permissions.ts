import { Role } from '$lib/constants';
import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

const statements = {
  ...defaultStatements,
  files: ['create', 'read', 'update', 'delete', 'upload', 'download'],
  users: ['create', 'read', 'update', 'delete', 'manage', 'change-role', 'invite', 'ban', 'unban'],
  roles: ['assign', 'revoke', 'elevate', 'demote'],
  analytics: ['view-dashboard', 'export-reports'],
  reports: ['create', 'read', 'schedule', 'export'],
  settings: ['read', 'update', 'update:general', 'update:notifications', 'update:security'],
  system: ['configure', 'backup', 'restore', 'audit', 'monitor', 'maintenance']
} as const;

export const ac = createAccessControl(statements);

export const roles = {
  [Role.ADMIN]: ac.newRole({
    ...adminAc.statements,
    files: ['create', 'read', 'update', 'delete', 'upload', 'download'],
    users: ['create', 'read', 'update', 'delete', 'manage', 'change-role', 'invite', 'ban', 'unban'],
    roles: ['assign', 'revoke', 'elevate', 'demote'],
    analytics: ['view-dashboard', 'export-reports'],
    reports: ['create', 'read', 'schedule', 'export'],
    settings: ['read', 'update', 'update:general', 'update:notifications', 'update:security'],
    system: ['configure', 'backup', 'restore', 'audit', 'monitor', 'maintenance']
  }),
  [Role.EDITOR]: ac.newRole({
    files: ['create', 'read', 'update', 'delete', 'upload', 'download'],
    users: ['read'],
    roles: [],
    analytics: ['view-dashboard', 'export-reports'],
    reports: ['read', 'export'],
    settings: ['read'],
    system: ['audit']
  }),
  [Role.EXECUTIVE]: ac.newRole({
    files: ['read', 'upload', 'download'],
    users: ['read'],
    analytics: ['view-dashboard'],
    reports: ['read', 'export'],
    settings: ['read'],
    system: []
  }),
  [Role.PARTNER]: ac.newRole({
    files: ['read', 'upload', 'download'],
    users: ['read'],
    analytics: ['view-dashboard'],
    reports: ['read', 'export'],
    settings: ['read'],
    system: []
  }),
  [Role.SPONSOR]: ac.newRole({
    files: ['read', 'upload', 'download'],
    users: ['read'],
    analytics: ['view-dashboard'],
    reports: ['read', 'export'],
    settings: ['read'],
    system: []
  }),
  [Role.MEMBER_CORPORATE]: ac.newRole({
    files: ['read'],
    users: ['read'],
    analytics: ['view-dashboard'],
    reports: ['read'],
    settings: ['read'],
    system: []
  }),
  [Role.MEMBER_INDIVIDUAL]: ac.newRole({
    files: ['read'],
    users: ['read'],
    analytics: ['view-dashboard'],
    reports: ['read'],
    settings: ['read'],
    system: []
  }),
  [Role.MEMBER_FREE]: ac.newRole({
    files: ['read'],
    users: ['read'],
    analytics: ['view-dashboard'],
    reports: ['read'],
    settings: ['read'],
    system: []
  }),
  [Role.USER]: ac.newRole({
    files: ['read'],
    users: ['read'],
    roles: [],
    analytics: ['view-dashboard'],
    reports: ['read'],
    settings: ['read'],
    system: []
  })
};

export const roleHierarchy = {
  [Role.ADMIN]: 10,
  [Role.EDITOR]: 8,
  [Role.EXECUTIVE]: 6,
  [Role.PARTNER]: 6,
  [Role.SPONSOR]: 6,
  [Role.MEMBER_CORPORATE]: 4,
  [Role.MEMBER_INDIVIDUAL]: 3,
  [Role.MEMBER_FREE]: 2,
  [Role.USER]: 1
} as const;
export const hasHigherRole = (userRole: Role, targetRole: Role): boolean => roleHierarchy[userRole] > roleHierarchy[targetRole];
export const isAdmin = (role: Role): boolean => role === Role.ADMIN;
export const isEditor = (role: Role): boolean => role === Role.EDITOR;
export const isStaff = (role: Role): boolean => [Role.ADMIN, Role.EDITOR].includes(role);
export const getRoleDisplayName = (role: Role): string => ({
  [Role.ADMIN]: 'Administrator',
  [Role.EDITOR]: 'Editor',
  [Role.USER]: 'User',
  [Role.MEMBER_FREE]: 'Free Member',
  [Role.MEMBER_INDIVIDUAL]: 'Individual Member',
  [Role.MEMBER_CORPORATE]: 'Corporate Member',
  [Role.EXECUTIVE]: 'Executive Member',
  [Role.SPONSOR]: 'Sponsor',
  [Role.PARTNER]: 'Partner'
})[role] || 'Unknown';
