"use client";

import { usePathname } from "next/navigation";
import { NavGroup } from "./NavGroup";
import { useNavGroups } from "./useNavGroups";
import { ROLE_ID_ADMIN } from "@/types";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { groups, expandedGroups, toggleGroup, user } = useNavGroups();

  const indexedGroups = groups.map((g, idx) => ({ ...g, idx }));
  const mainGroups = indexedGroups.filter((g) => !g.pinned);
  const pinnedGroups = indexedGroups.filter((g) => g.pinned);

  return (
    <aside className="hidden w-64 h-[calc(100vh-4rem)] border-r border-secondary bg-background/50 md:flex md:flex-col md:overflow-hidden md:flex-shrink-0">
      <nav className="flex-1 overflow-y-auto no-scrollbar p-4">
        <div className="space-y-4">
          {mainGroups.map((group) => (
            <NavGroup
              key={group.idx}
              group={group}
              isExpanded={expandedGroups[group.idx] ?? true}
              onToggle={() => toggleGroup(group.idx)}
              activePath={pathname}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-secondary space-y-6 p-4">
        {pinnedGroups.map((group) => (
          <NavGroup
            key={group.idx}
            group={group}
            isExpanded={expandedGroups[group.idx] ?? true}
            onToggle={() => toggleGroup(group.idx)}
            activePath={pathname}
          />
        ))}

        <div className="pt-2 border-t border-secondary/50">
          <div className="space-y-2 px-3 py-2">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
              {user?.roleId===ROLE_ID_ADMIN ? "Admin" : "Renter"}
            </p>
            <p className="text-sm font-medium text-foreground">{user?.name ?? "User"}</p>
            <p className="text-xs text-foreground/50">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
