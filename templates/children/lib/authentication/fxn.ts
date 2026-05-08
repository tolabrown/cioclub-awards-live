import { Role } from "$lib/constants";

export const roles = [
  { value: Role.ADMIN, label: 'Admin', color: 'destructive' },
  { value: Role.EDITOR, label: 'Editor', color: 'default' },
  { value: Role.LEADER, label: 'Leader', color: 'purple' },
  { value: Role.PARENT, label: 'Parent', color: 'orange' },
  { value: Role.TEACHER, label: 'Teacher', color: 'blue' },
  { value: Role.USER, label: 'User', color: 'secondary' }
];

export const getRoleBadgeVariant = (role: string) => {
  const roleConfig = roles.find((r) => r.value.toLowerCase() === role.toLowerCase());
  return (roleConfig?.color as any) || 'secondary';
};