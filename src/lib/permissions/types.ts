import { ROLE_ID } from "@/constants";

export type RoleId = typeof ROLE_ID[keyof typeof ROLE_ID];

export interface PermissionCheck {
  hasAccess: boolean;
  requiredPrivileges: RoleId[];
  userRole: RoleId | null;
}

export interface PermissionContext {
  userRole: RoleId | null;
  userId?: string;
}
