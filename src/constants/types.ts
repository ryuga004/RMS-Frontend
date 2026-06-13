/**
 * Type definitions for constants
 */

import type { ROLE_ID } from "./role-definitions";

export type RoutePrivilege = typeof ROLE_ID[keyof typeof ROLE_ID];

export interface RouteConfig {
  path: string;
  label: string;
  privileges: RoutePrivilege[];
  icon?: string;
  description?: string;
  visible?: boolean;
}
