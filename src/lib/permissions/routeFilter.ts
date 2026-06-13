import { DASHBOARD_ROUTES, type RouteConfig } from "@/constants";
import { permissionManager } from "./manager";
import type { RoleId } from "./types";

export class RouteFilter {
  static filterAccessibleRoutes(
    routes: readonly RouteConfig[],
    userRole: RoleId | null
  ): RouteConfig[] {
    return routes.filter((route) =>
      permissionManager.canAccessRoute(route.privileges, userRole)
    );
  }

  static getAccessibleDashboardRoutes(userRole: RoleId | null): RouteConfig[] {
    return this.filterAccessibleRoutes(DASHBOARD_ROUTES, userRole);
  }

  static canAccessRoute(route: RouteConfig, userRole: RoleId | null): boolean {
    return permissionManager.canAccessRoute(route.privileges, userRole);
  }
}
