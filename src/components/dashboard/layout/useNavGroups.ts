"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { isAdmin } from "@/types";
import {
  LayoutDashboard,
  FolderOpen,
  Users,
  CreditCard,
  Settings,
  LogIn,
  Compass,
  Bell,
  Inbox,
  Send,
} from "lucide-react";
import type { NavGroupDef } from "./NavGroup";

const ADMIN_NAV_GROUPS: NavGroupDef[] = [
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
    pinned: true,
  },
];

const TENANT_NAV_GROUPS: NavGroupDef[] = [
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
];

export function useNavGroups() {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdminUser = user ? isAdmin(user.roleId) : false;
  const groups = isAdminUser ? ADMIN_NAV_GROUPS : TENANT_NAV_GROUPS;

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    () => Object.fromEntries(groups.map((_, i) => [i, true]))
  );

  const toggleGroup = (idx: number) =>
    setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return { groups, expandedGroups, toggleGroup, user, isAdminUser };
}
