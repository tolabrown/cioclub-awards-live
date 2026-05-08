import { Role } from "$lib/constants";

export const roles = [
  { value: Role.ADMIN, label: 'Admin', color: 'gsred' },
  { value: Role.EDITOR, label: 'Editor', color: 'default' },
  { value: Role.USER, label: 'User', color: 'secondary' },
  { value: Role.MEMBER_FREE, label: 'Free Member', color: 'default' },
  { value: Role.MEMBER_INDIVIDUAL, label: 'Individual Member', color: 'gsblue' },
  { value: Role.MEMBER_CORPORATE, label: 'Corporate Member', color: 'gsprimary' },
  { value: Role.EXECUTIVE, label: 'Executive Member', color: 'gsorange' },
  { value: Role.SPONSOR, label: 'Sponsor', color: 'gssecondary' },
  { value: Role.PARTNER, label: 'Partner', color: 'gspurple' }
];

export const getRoleBadgeVariant = (role: string) => {
  const roleConfig = roles.find((r) => r.value.toLowerCase() === role.toLowerCase());
  return (roleConfig?.color as any) || 'secondary';
};
