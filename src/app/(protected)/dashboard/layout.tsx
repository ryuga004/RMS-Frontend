"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/redux/store";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  CreditCard,
  Settings,
  ChevronRight,
  ChevronDown,
  Compass,
  Bell,
  Inbox,
  Send,
  Shield,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { isAdmin, ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT } from "@/types";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/redux/slices/authSlice";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  requiredRoles?: number[];
};

type NavGroup = {
  label?: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requiredRoles: [ROLE_ID_ADMIN, ROLE_ID_TENANT] },
      { href: "/browse", label: "Explore", icon: Compass, requiredRoles: [ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT] },
    ],
  },
  {
    label: "Management",
    items: [
      { href: "/dashboard/assets", label: "Listings", icon: FolderOpen, requiredRoles: [ROLE_ID_ADMIN] },
      { href: "/dashboard/tenants", label: "Tenants", icon: Users, requiredRoles: [ROLE_ID_ADMIN] },

      { href: "/dashboard/rentals", label: "Rentals", icon: FolderOpen, requiredRoles: [ROLE_ID_TENANT] },
    ],
  },
  {
    label: "Activity",
    items: [
      { href: "/dashboard/requests", label: "Requests", icon: Inbox, requiredRoles: [ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT] },
      { href: "/dashboard/invitations", label: "Invitations", icon: Bell, requiredRoles: [ROLE_ID_TENANT] },
      { href: "/dashboard/messages", label: "Messages", icon: Send, requiredRoles: [ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT] },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell, requiredRoles: [ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT] },
    ],
  },
  {
    label: "Payments",
    items: [
      { href: "/dashboard/transactions", label: "Transactions", icon: CreditCard, requiredRoles: [ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT] },
      { href: "/dashboard/pay", label: "Make a Payment", icon: CreditCard, requiredRoles: [ROLE_ID_TENANT] },
      { href: "/dashboard/payment-plans", label: "Payment Plans", icon: Settings, requiredRoles: [ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN] },
    ],
  },
  {
    label: "Auditing",
    items: [
      { href: "/dashboard/audit-log", label: "Audit Log", icon: Shield, requiredRoles: [ROLE_ID_ADMIN] },
    ],
  },
];

interface NavGroupState {
  [key: number]: boolean;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  // Filter nav items based on user's role
  const filteredNavGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.requiredRoles || item.requiredRoles.includes(user?.roleId || ROLE_ID_TENANT)
    ),
  })).filter((group) => group.items.length > 0); // Remove empty groups

  const [expandedGroups, setExpandedGroups] = useState<NavGroupState>(
    filteredNavGroups.reduce((acc, _, idx) => ({ ...acc, [idx]: true }), {})
  );

  const toggleGroup = (idx: number) => {
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const isItemActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    dispatch(logoutAction());
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden w-64 h-[calc(100vh-4rem)] border-r border-secondary bg-background/50 md:flex md:flex-col md:overflow-hidden md:flex-shrink-0">
          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {filteredNavGroups.map((group, groupIdx) => (
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

          <div className="border-t border-secondary space-y-4 p-4 bg-destructive/10">
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 rounded-md px-3 py-1 text-sm font-medium transition-all",
                "text-destructive hover:bg-destructive/20 hover:text-destructive font-semibold"
              )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span>Logout</span>
            </button>
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
