"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem, isNavItemActive, type NavItemDef } from "./NavItem";

export type NavGroupDef = {
  label?: string;
  items: NavItemDef[];
  pinned?: boolean;
  privilages?: Array<number>
};

type NavGroupProps = {
  group: NavGroupDef;
  isExpanded: boolean;
  onToggle: () => void;
  activePath: string;
};

export function NavGroup({ group, isExpanded, onToggle, activePath }: NavGroupProps) {
  return (
    <div className="space-y-3">
      {group.label && (
        <div
          className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors group/header"
          onClick={onToggle}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 group-hover/header:text-foreground transition-colors">
            {group.label}
          </h3>
          <ChevronDown
            className={cn(
              "h-3.5 w-3.5 text-foreground/40 transition-transform group-hover/header:text-foreground/60",
              isExpanded ? "rotate-0" : "-rotate-90"
            )}
          />
        </div>
      )}
      {isExpanded && (
        <div className="space-y-1 px-1">
          {group.items.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              isActive={isNavItemActive(item.href, activePath)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
