"use client";

import { useSelector } from "react-redux";
import { permissionManager } from "./manager";
import { ROLE_ID } from "@/constants";
import type { RoleId } from "./types";
import type { RootState } from "@/lib/redux/store";

function isValidRoleId(roleId: unknown): roleId is RoleId {
  return typeof roleId === "number" && Object.values(ROLE_ID).includes(roleId as RoleId);
}

export function usePermissions() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.roleId && isValidRoleId(user.roleId) ? user.roleId : null;

  return {
    userRole,
    user,
    isAdmin: permissionManager.isAdmin(userRole),
    isSuperAdmin: permissionManager.isSuperAdmin(userRole),
    isTenant: permissionManager.isTenant(userRole),
    canCreate: permissionManager.canCreate(userRole),
    canEdit: permissionManager.canEdit(userRole),
    canDelete: permissionManager.canDelete(userRole),
    checkAccess: (privileges: RoleId[]) => permissionManager.checkRouteAccess(privileges, userRole),
    canAccessRoute: (privileges: RoleId[]) => permissionManager.canAccessRoute(privileges, userRole),
  };
}
