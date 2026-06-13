"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/lib/permissions";
import type { RoleId } from "@/lib/permissions/types";

interface ConditionalRenderProps {
  children: ReactNode;
  show?: boolean;
  condition?: (permissions: ReturnType<typeof usePermissions>) => boolean;
  requiredPrivileges?: RoleId[];
  fallback?: ReactNode;
}

export function ConditionalRender({
  children,
  show = true,
  condition,
  requiredPrivileges,
  fallback,
}: ConditionalRenderProps) {
  const permissions = usePermissions();

  let shouldRender = show;

  if (condition) {
    shouldRender = condition(permissions);
  } else if (requiredPrivileges) {
    shouldRender = permissions.canAccessRoute(requiredPrivileges);
  }

  if (!shouldRender) {
    return fallback || null;
  }

  return children;
}
