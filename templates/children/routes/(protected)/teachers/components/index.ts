import type { User } from "$lib/auth";
import { adminRoles, Role } from "$lib/constants";
import type { iTeacher, iUser } from "$lib/interface";

export const authorizedStates = (user: User, teacher: iTeacher) => {
  const iAmTheTeacher = user.id === (teacher?.user as iUser)?.id;
  const isAdmin = adminRoles.includes(user.role as Role);
  const isAuthorized = isAdmin || iAmTheTeacher;
  return { iAmTheTeacher, isAdmin, isAuthorized }
}