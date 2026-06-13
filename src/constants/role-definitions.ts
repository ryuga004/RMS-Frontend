/**
 * Role definitions and constants
 * Maps role IDs to role names for the application
 */

export const ROLE_ID = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  TENANT: 3,
} as const;

export const ROLE_NAME = {
  1: "SUPER_ADMIN",
  2: "ADMIN",
  3: "TENANT",
} as const;

export type RoleId = typeof ROLE_ID[keyof typeof ROLE_ID];
export type RoleName = typeof ROLE_NAME[keyof typeof ROLE_NAME];

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS: Record<RoleId, string> = {
  [ROLE_ID.SUPER_ADMIN]: "Full system access",
  [ROLE_ID.ADMIN]: "Dashboard and management access",
  [ROLE_ID.TENANT]: "Limited tenant access",
};
