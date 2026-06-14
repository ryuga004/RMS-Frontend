"use client";

import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { NavLink } from "@/components/NavLink";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

function canAccess(privileges: readonly number[], roleId: number | null): boolean {
  return privileges.length === 0 || (roleId !== null && privileges.includes(roleId));
}

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
  const user = useSelector((state: RootState) => state.auth?.user ?? null);
  const roleId = typeof user?.roleId === "number" ? user.roleId : null;
  const pathname = usePathname();

  const accessibleRoutes = ROUTES.filter(
    (r) => r.path.startsWith("/dashboard") && canAccess(r.privileges, roleId)
  );

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
        {accessibleRoutes.map((route) => (
          <NavLink
            key={route.path}
            href={route.path}
            className={cn(itemClassName)}
            activeClassName={activeItemClassName}
          >
            {route.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
