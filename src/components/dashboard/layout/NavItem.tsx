"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItemDef = {
  href: string;
  label: string;
  icon: React.ElementType;
  privilages: Array<number>
};

type NavItemProps = {
  item: NavItemDef;
  isActive: boolean;
};

export function NavItem({ item, isActive }: NavItemProps) {
  const { href, label, icon: Icon } = item;
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
    </Link>
  );
}

// Exact match for the dashboard root; prefix match for all other routes.
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}
