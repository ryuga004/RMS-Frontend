"use client";

import { ReactNode } from "react";
import { usePermissions } from "@/lib/permissions";
import type { RoleId } from "@/lib/permissions/types";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPrivileges: RoleId[];
  fallback?: ReactNode;
}

/**
 * Frontend route protection component
 *
 * ⚠️ SECURITY NOTE: This component provides UI-level protection only.
 * Backend must validate user permissions before serving protected data.
 * Never rely on frontend checks alone for security-sensitive operations.
 *
 * This component:
 * ✓ Filters navigation and UI based on user role
 * ✓ Provides better UX by preventing access to unauthorized pages
 *
 * This component does NOT:
 * ✗ Prevent direct URL navigation
 * ✗ Protect API endpoints (backend validation required)
 * ✗ Encrypt or secure sensitive data
 *
 * Always validate user permissions on the server before:
 * - Returning protected data
 * - Executing sensitive operations
 * - Writing to databases
 */
export function ProtectedRoute({
  children,
  requiredPrivileges,
  fallback,
}: ProtectedRouteProps) {
  const { canAccessRoute, userRole } = usePermissions();

  if (!canAccessRoute(requiredPrivileges)) {
    return (
      fallback || (
        <div className="space-y-4 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page. Required role:{" "}
              {requiredPrivileges.join(", ")}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            Your current role: {userRole}
          </p>
        </div>
      )
    );
  }

  return children;
}
