/**
 * Dashboard routes configuration
 * Defines all dashboard routes with their privilege requirements
 */

import { ROLE_ID } from "./role-definitions";
import type { RouteConfig, RoutePrivilege } from "./types";

export const DASHBOARD_ROUTES_CONFIG: Record<string, RouteConfig> = {
  PAYMENTS: {
    path: "/dashboard/payments",
    label: "Payments",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage and make payments",
  },
  PAYMENT_OPTIONS: {
    path: "/dashboard/payment-options",
    label: "Payment Options",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Configure payment methods",
  },
  PAYMENT_HISTORY: {
    path: "/dashboard/payment-history",
    label: "Payment History",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "View payment transaction history",
  },
  PROFILE: {
    path: "/dashboard/profile",
    label: "Profile",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage your profile",
  },
  LISTINGS: {
    path: "/dashboard/listings",
    label: "Listings",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage your listings",
  },
  REQUESTS: {
    path: "/dashboard/requests",
    label: "Requests",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "View rental requests",
  },
  MESSAGES: {
    path: "/dashboard/messages",
    label: "Messages",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Communicate with users",
  },
  NOTIFICATIONS: {
    path: "/dashboard/notifications",
    label: "Notifications",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "View your notifications",
  },
  INVITATIONS: {
    path: "/dashboard/invitations",
    label: "Invitations",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage invitations",
  },
  RENTALS: {
    path: "/dashboard/rentals",
    label: "Rentals",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage your rentals",
  },
  TENANTS: {
    path: "/dashboard/tenants",
    label: "Tenants",
    privileges: [ROLE_ID.ADMIN, ROLE_ID.SUPER_ADMIN],
    description: "Manage tenants",
  },
  AUDITS: {
    path: "/dashboard/audits",
    label: "Audits",
    privileges: [ROLE_ID.SUPER_ADMIN],
    description: "View audit logs",
  },
};

export const DASHBOARD_ROUTES_ARRAY = Object.values(DASHBOARD_ROUTES_CONFIG);
