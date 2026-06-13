import { ROLE_ID } from "./role-definitions";
import type { RoleId } from "./role-definitions";

export interface ProtectedRouteConfig {
  pattern: string | RegExp;
  requiredPrivileges: RoleId[];
  redirectTo?: string;
}

export const PROTECTED_ROUTES: ProtectedRouteConfig[] = [
  {
    pattern: "/dashboard",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
  },
  {
    pattern: "/dashboard/assets",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
  },
  {
    pattern: "/dashboard/assets/new",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
  },
  {
    pattern: /^\/dashboard\/assets\/[^/]+\/edit$/,
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
  },
  {
    pattern: "/dashboard/tenants",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
  },
  {
    pattern: "/dashboard/requests",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
  },
  {
    pattern: "/dashboard/invitations",
    requiredPrivileges: [ROLE_ID.TENANT],
    redirectTo: "/dashboard",
  },
  {
    pattern: "/dashboard/rentals",
    requiredPrivileges: [ROLE_ID.TENANT],
    redirectTo: "/dashboard",
  },
  {
    pattern: "/dashboard/messages",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
  },
  {
    pattern: "/dashboard/notifications",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
  },
  {
    pattern: "/dashboard/transactions",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
  },
  {
    pattern: "/dashboard/payment-plans",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
  },
  {
    pattern: "/dashboard/pay",
    requiredPrivileges: [ROLE_ID.TENANT],
    redirectTo: "/dashboard",
  },
  {
    pattern: "/dashboard/profile",
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
  },
  {
    pattern: /^\/dashboard\/profile\/[^/]+$/,
    requiredPrivileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
  },
  {
    pattern: "/dashboard/audit-log",
    requiredPrivileges: [ROLE_ID.SUPER_ADMIN],
    redirectTo: "/dashboard",
  },
];

export function matchProtectedRoute(pathname: string): ProtectedRouteConfig | undefined {
  return PROTECTED_ROUTES.find((r) =>
    typeof r.pattern === "string" ? r.pattern === pathname : r.pattern.test(pathname)
  );
}
