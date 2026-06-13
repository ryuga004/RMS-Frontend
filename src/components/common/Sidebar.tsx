"use client";

import { usePermissions, RouteFilter } from "@/lib/permissions";
import { DASHBOARD_ROUTES } from "@/constants";
import { NavLink } from "@/components/NavLink";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
}

export function Sidebar({
  className = "w-64 border-r bg-muted/40 p-4",
  itemClassName = "block px-4 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted",
  activeItemClassName = "bg-primary text-primary-foreground",
}: SidebarProps) {
  const { userRole } = usePermissions();
  const pathname = usePathname();

  // Get only routes accessible to the current user
  const accessibleRoutes = RouteFilter.getAccessibleDashboardRoutes(userRole);

  if (!accessibleRoutes.length) {
    return (
      <aside className={className}>
        <div className="text-sm text-muted-foreground text-center py-8">
          No accessible routes for your role
        </div>
      </aside>
    );
  }

  return (
    <aside className={className}>
      <nav className="space-y-1">
        {accessibleRoutes.map((route) => {
          const isActive = pathname === route.path;

          return (
            <NavLink
              key={route.path}
              href={route.path}
              className={cn(itemClassName)}
              activeClassName={activeItemClassName}
            >
              {route.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
