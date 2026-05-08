import { Role } from "$lib/constants";

export const roles = [
  { value: Role.ADMIN, label: 'Admin', color: 'destructive' },
  { value: Role.USER, label: 'User', color: 'purple' }
];

export const getRoleBadgeVariant = (role: string) => {
  const roleConfig = roles.find((r) => r.value.toLowerCase() === role.toLowerCase());
  return (roleConfig?.color as any) || 'secondary';
};
