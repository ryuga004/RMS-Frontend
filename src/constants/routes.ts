/**
 * Routes configuration (Main index file)
 * Combines all route definitions for easy access
 */

import { ROLE_ID } from "./role-definitions";
import { DASHBOARD_ROUTES_CONFIG, DASHBOARD_ROUTES_ARRAY } from "./dashboard-routes";
import { PUBLIC_ROUTES_CONFIG, PAYMENT_ROUTES_CONFIG, PUBLIC_ROUTES_ARRAY } from "./public-routes";
import type { RouteConfig } from "./types";

/**
 * All routes organized by category
 * Use these for accessing specific route definitions
 */
export const ROUTES = {
  BROWSE: PUBLIC_ROUTES_CONFIG.BROWSE,
  DASHBOARD: {
    ROOT: { path: "/dashboard", label: "Dashboard", privileges: [ROLE_ID.ADMIN] },
    ...DASHBOARD_ROUTES_CONFIG,
  },
  LIST_ITEM: PUBLIC_ROUTES_CONFIG.LIST_ITEM,
  EDIT_ITEM: PUBLIC_ROUTES_CONFIG.EDIT_ITEM,
  ITEM: PUBLIC_ROUTES_CONFIG.ITEM_DETAIL,
  PAYMENT_SUCCESS: PAYMENT_ROUTES_CONFIG.SUCCESS,
  PAYMENT_CANCEL: PAYMENT_ROUTES_CONFIG.CANCEL,
} as const;

/**
 * Dashboard routes as array (for iteration)
 * Use for filtering routes by privileges
 */
export const DASHBOARD_ROUTES = DASHBOARD_ROUTES_ARRAY;

/**
 * Public routes as array
 */
export const PUBLIC_ROUTES = PUBLIC_ROUTES_ARRAY;

/**
 * Get all routes
 */
export const getAllRoutes = (): RouteConfig[] => {
  return [
    ...PUBLIC_ROUTES_ARRAY,
    ROUTES.DASHBOARD.ROOT,
    ...DASHBOARD_ROUTES_ARRAY,
  ];
};

export type { RouteConfig } from "./types";
