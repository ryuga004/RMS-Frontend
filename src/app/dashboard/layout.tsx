"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronDown,
  LogIn,
  Compass,
  Bell,
  Inbox,
  Send,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { isAdmin } from "@/types";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label?: string; items: NavItem[]; collapsed?: boolean; isAdmin?: boolean };

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/", label: "Get Started", icon: LogIn },
      { href: "/browse", label: "Explore", icon: Compass },
    ],
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/listings", label: "Listings", icon: FolderOpen },
      { href: "/dashboard/tenants", label: "Tenants", icon: Users },
      { href: "/dashboard/payment-history", label: "Transactions", icon: CreditCard },
    ],
  },
  {
    label: "Notifications",
    items: [
      { href: "/dashboard/requests", label: "Requests", icon: Inbox },
      { href: "/dashboard/audits", label: "Activity Log", icon: Bell },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/dashboard/payment-options", label: "Payment Settings", icon: Settings },
    ],
    isAdmin: true,
  },
];

const TENANT_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/", label: "Get Started", icon: LogIn },
      { href: "/browse", label: "Explore", icon: Compass },
    ],
  },
  {
    label: "My Activity",
    items: [
      { href: "/dashboard/rentals", label: "Active Rentals", icon: FolderOpen },
      { href: "/dashboard/payment-history", label: "Payment History", icon: CreditCard },
    ],
  },
  {
    label: "Notifications",
    items: [
      { href: "/dashboard/invitations", label: "Invitations", icon: Bell },
      { href: "/dashboard/messages", label: "Messages", icon: Send },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/dashboard/payment-options", label: "Payment Settings", icon: Settings },
    ],
  },
];

interface NavGroupState {
  [key: number]: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const admin = user ? isAdmin(user.roleId) : false;
  const navGroups = admin ? ADMIN_NAV_GROUPS : TENANT_NAV_GROUPS;

  const [expandedGroups, setExpandedGroups] = useState<NavGroupState>(
    navGroups.reduce((acc, _, idx) => ({ ...acc, [idx]: true }), {})
  );

  const toggleGroup = (idx: number) => {
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isItemActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 h-[calc(100vh-4rem)] border-r border-secondary bg-background/50 md:flex md:flex-col md:overflow-hidden md:flex-shrink-0">
          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              {navGroups
                .filter((group) => !group.isAdmin || group.label !== "Administration")
                .map((group, groupIdx) => (
                  <div key={groupIdx} className="space-y-3">
                    {/* Group Header */}
                    {group.label && (
                      <div
                        className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors group/header"
                        onClick={() => toggleGroup(groupIdx)}
                      >
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 group-hover/header:text-foreground transition-colors">
                          {group.label}
                        </h3>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-foreground/40 transition-transform group-hover/header:text-foreground/60",
                            expandedGroups[groupIdx] ? "rotate-0" : "-rotate-90"
                          )}
                        />
                      </div>
                    )}

                    {/* Group Items */}
                    {expandedGroups[groupIdx] && (
                      <div className="space-y-1 px-1">
                        {group.items.map((item) => {
                          const active = isItemActive(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                                active
                                  ? "bg-primary/10 text-primary"
                                  : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                              )}
                            >
                              <item.icon className="h-4 w-4 flex-shrink-0" />
                              <span className="flex-1">{item.label}</span>
                              {active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </nav>

          {/* Administration Section (Bottom) */}
          <div className="border-t border-secondary space-y-6 p-4">
            {/* Administration Group */}
            {navGroups
              .filter((group) => group.label === "Administration")
              .map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-3">
                  {/* Group Header */}
                  {group.label && (
                    <div
                      className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-secondary/50 rounded-md transition-colors group/header"
                      onClick={() => toggleGroup(navGroups.indexOf(group))}
                    >
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground/60 group-hover/header:text-foreground transition-colors">
                        {group.label}
                      </h3>
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 text-foreground/40 transition-transform group-hover/header:text-foreground/60",
                          expandedGroups[navGroups.indexOf(group)] ? "rotate-0" : "-rotate-90"
                        )}
                      />
                    </div>
                  )}

                  {/* Group Items */}
                  {expandedGroups[navGroups.indexOf(group)] && (
                    <div className="space-y-1 px-1">
                      {group.items.map((item) => {
                        const active = isItemActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all",
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-foreground/70 hover:bg-secondary/50 hover:text-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="flex-1">{item.label}</span>
                            {active && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

            {/* User Info */}
            <div className="pt-2 border-t border-secondary/50">
              <div className="space-y-2 px-3 py-2">
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                  {admin ? "👤 Administrator" : "👤 Renter"}
                </p>
                <p className="text-sm font-medium text-foreground">{user?.name || "User"}</p>
                <p className="text-xs text-foreground/50">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 pb-12">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
