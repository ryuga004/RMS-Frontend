import { ROLE_ID } from "@/constants";
import type { RoleId, PermissionCheck, PermissionContext } from "./types";

class PermissionManager {
  checkRouteAccess(
    requiredPrivileges: RoleId[],
    userRole: RoleId | null
  ): PermissionCheck {
    if (!requiredPrivileges.length) {
      return {
        hasAccess: true,
        requiredPrivileges,
        userRole,
      };
    }

    const hasAccess = userRole !== null && requiredPrivileges.includes(userRole);

    return {
      hasAccess,
      requiredPrivileges,
      userRole,
    };
  }

  canAccessRoute(requiredPrivileges: RoleId[], userRole: RoleId | null): boolean {
    return this.checkRouteAccess(requiredPrivileges, userRole).hasAccess;
  }

  isAdmin(userRole: RoleId | null): boolean {
    return userRole === ROLE_ID.ADMIN || userRole === ROLE_ID.SUPER_ADMIN;
  }

  isSuperAdmin(userRole: RoleId | null): boolean {
    return userRole === ROLE_ID.SUPER_ADMIN;
  }

  isTenant(userRole: RoleId | null): boolean {
    return userRole === ROLE_ID.TENANT;
  }

  canEdit(userRole: RoleId | null): boolean {
    return this.isAdmin(userRole);
  }

  canDelete(userRole: RoleId | null): boolean {
    return this.isAdmin(userRole);
  }

  canCreate(userRole: RoleId | null): boolean {
    return this.isAdmin(userRole);
  }
}

export const permissionManager = new PermissionManager();
