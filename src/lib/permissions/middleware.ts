import { permissionManager } from "./manager";
import type { RoleId } from "./types";

export interface AuthenticatedRequest {
  userId?: string;
  userRole?: RoleId;
}

export class PermissionMiddleware {
  static requireAuth(
    userRole: RoleId | null,
    fallback?: () => void
  ): boolean {
    if (!userRole) {
      fallback?.();
      return false;
    }
    return true;
  }

  static requireAdminAccess(
    userRole: RoleId | null,
    fallback?: () => void
  ): boolean {
    if (!permissionManager.isAdmin(userRole)) {
      fallback?.();
      return false;
    }
    return true;
  }

  static requireSuperAdminAccess(
    userRole: RoleId | null,
    fallback?: () => void
  ): boolean {
    if (!permissionManager.isSuperAdmin(userRole)) {
      fallback?.();
      return false;
    }
    return true;
  }

  static requirePrivileges(
    requiredPrivileges: RoleId[],
    userRole: RoleId | null,
    fallback?: () => void
  ): boolean {
    if (!permissionManager.canAccessRoute(requiredPrivileges, userRole)) {
      fallback?.();
      return false;
    }
    return true;
  }
}
