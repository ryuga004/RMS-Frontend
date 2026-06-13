"use client";

import { usePermissions } from "@/lib/permissions";
import type { RoleId } from "@/lib/permissions/types";

export function useCanRender() {
  const {
    isAdmin,
    isSuperAdmin,
    isTenant,
    canCreate,
    canEdit,
    canDelete,
    canAccessRoute,
  } = usePermissions();

  return {
    canShowAdminFeatures: isAdmin,
    canShowSuperAdminFeatures: isSuperAdmin,
    canShowTenantFeatures: isTenant,
    canShowCreateButton: canCreate,
    canShowEditButton: canEdit,
    canShowDeleteButton: canDelete,
    canShowFeature: (privileges: RoleId[]) => canAccessRoute(privileges),
  };
}
