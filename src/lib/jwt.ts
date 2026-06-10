import type { User } from "@/types";
import { ROLE_ID_ADMIN, ROLE_ID_TENANT } from "@/types";

/** Decode JWT payload without verification (client-side; token from trusted source). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const ROLE_MAP: Record<number, User["role"]> = {
  1: "SUPER_ADMIN",
  2: "ADMIN",
  3: "TENANT",
};

/**
 * Extract user for Redux from JWT payload (e.g. when backend returns accessToken in login response).
 * Expects payload to have sub or userId (number), and optionally email, name, roleId.
 */
export function userFromJwt(accessToken: string): User | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;
  const userId = (payload.sub ?? payload.userId) as number | string | undefined;
  if (userId == null) return null;
  const roleId = (payload.roleId ?? payload.role) as number | undefined;
  const numRoleId = typeof roleId === "number" ? roleId : ROLE_ID_TENANT;
  return {
    id: String(userId),
    name: (payload.name as string) ?? "User",
    email: (payload.email as string) ?? "",
    roleId: numRoleId,
    role: ROLE_MAP[numRoleId] ?? (numRoleId === ROLE_ID_ADMIN ? "ADMIN" : "TENANT"),
  };
}
