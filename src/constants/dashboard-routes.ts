/**
 * Dashboard routes configuration
 * Defines all dashboard routes with their privilege requirements
 */

import { ROLE_ID } from "./role-definitions";
import type { RouteConfig, RoutePrivilege } from "./types";

export const DASHBOARD_ROUTES_CONFIG: Record<string, RouteConfig> = {
  ASSETS: {
    path: "/dashboard/assets",
    label: "My Listings",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage your listings",
  },
  PAY: {
    path: "/dashboard/pay",
    label: "Make a Payment",
    privileges: [ROLE_ID.TENANT],
    description: "Manage and make payments",
  },
  PAYMENT_PLANS: {
    path: "/dashboard/payment-plans",
    label: "Payment Plans",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Configure payment methods",
  },
  TRANSACTIONS: {
    path: "/dashboard/transactions",
    label: "Transactions",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
    description: "View payment transaction history",
  },
  PROFILE: {
    path: "/dashboard/profile",
    label: "Profile",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
    description: "Manage your profile",
  },
  REQUESTS: {
    path: "/dashboard/requests",
    label: "Requests",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
    description: "View rental requests",
  },
  MESSAGES: {
    path: "/dashboard/messages",
    label: "Messages",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
    description: "Communicate with users",
  },
  NOTIFICATIONS: {
    path: "/dashboard/notifications",
    label: "Notifications",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN, ROLE_ID.TENANT],
    description: "View your notifications",
  },
  INVITATIONS: {
    path: "/dashboard/invitations",
    label: "Invitations",
    privileges: [ROLE_ID.TENANT],
    description: "Manage invitations",
  },
  RENTALS: {
    path: "/dashboard/rentals",
    label: "My Rentals",
    privileges: [ROLE_ID.TENANT],
    description: "Manage your rentals",
  },
  TENANTS: {
    path: "/dashboard/tenants",
    label: "Tenants",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage tenants",
  },
  AUDIT_LOG: {
    path: "/dashboard/audit-log",
    label: "Audit Log",
    privileges: [ROLE_ID.SUPER_ADMIN],
    description: "View audit logs",
  },
};

export const DASHBOARD_ROUTES_ARRAY = Object.values(DASHBOARD_ROUTES_CONFIG);
