/**
 * User as stored in Redux (from JWT decode or login/me response).
 * roleId: 1 = SUPER_ADMIN, 2 = ADMIN, 3 = TENANT.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  roleId: number;
  role?: "ADMIN" | "TENANT" | "SUPER_ADMIN";
}

export const ROLE_ID_ADMIN = 2;
export const ROLE_ID_TENANT = 3;
export const ROLE_ID_SUPER_ADMIN = 1;

export function isAdmin(roleId: number): boolean {
  return roleId === ROLE_ID_ADMIN || roleId === ROLE_ID_SUPER_ADMIN;
}

export function isTenant(roleId: number): boolean {
  return roleId === ROLE_ID_TENANT;
}
