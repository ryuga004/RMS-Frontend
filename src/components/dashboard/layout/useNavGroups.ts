"use client";

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import { isAdmin, ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT } from "@/types";
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

const DASHBOARD_GROUP: NavGroupDef[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, privilages: [ROLE_ID_ADMIN,ROLE_ID_TENANT]},
      { href: "/browse", label: "Explore", icon: Compass, privilages: [ROLE_ID_ADMIN,ROLE_ID_TENANT]},
    ],
    privilages: [ROLE_ID_ADMIN, ROLE_ID_TENANT]
  },
  {
    label: "Manage",
    items: [
      { href: "/dashboard/listings", label: "Listings", icon: FolderOpen, privilages: [ROLE_ID_ADMIN, ROLE_ID_TENANT]},
      { href: "/dashboard/tenants", label: "Tenants", icon: Users,privilages: [ROLE_ID_ADMIN]},
      { href: "/dashboard/payment-history", label: "Transactions", icon: CreditCard, privilages: [ROLE_ID_ADMIN, ROLE_ID_TENANT] },
    ],
    privilages: [ROLE_ID_ADMIN]
  },
  {
    label: "My Activity",
    items: [
      { href: "/dashboard/rentals", label: "Active Rentals", icon: FolderOpen, privilages: [ROLE_ID_TENANT] },
      { href: "/dashboard/payment-history", label: "Payment History", icon: CreditCard, privilages: [ROLE_ID_TENANT] },
    ],
    privilages: [ROLE_ID_TENANT]
  },
  {
    label: "Notifications",
    items: [
      { href: "/dashboard/requests", label: "Requests", icon: Inbox, privilages: [ROLE_ID_ADMIN, ROLE_ID_TENANT] },
      { href: "/dashboard/invitations", label: "Invitations", icon: Bell, privilages: [ROLE_ID_TENANT] },
      { href: "/dashboard/messages", label: "Messages", icon: Send, privilages: [ROLE_ID_ADMIN, ROLE_ID_TENANT]},
    ],
    privilages: [ROLE_ID_ADMIN, ROLE_ID_TENANT]
  },
  {
    label: "Administration",
    items: [
      { href: "/dashboard/payment-options", label: "Payment Settings", icon: Settings, privilages: [ROLE_ID_ADMIN] },
      { href: "/dashboard/audits", label: "Activity Log", icon: Bell, privilages: [ROLE_ID_SUPER_ADMIN] },
    ],
    privilages: [ROLE_ID_ADMIN],
  },
];

export function useNavGroups() {
  const { user } = useSelector((state: RootState) => state.auth);
  
  const groups = useMemo(() => {
    const roleId = user?.roleId;

    if (roleId == null) return [];

    return DASHBOARD_GROUP
      .filter((g) => g.privilages?.includes(roleId))
      .map((g) => ({
        ...g,
        items: g.items.filter((i) => i.privilages.includes(roleId)),
      }));
  }, [user]);

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    () => Object.fromEntries(groups.map((_, i) => [i, true]))
  );

  const toggleGroup = (idx: number) => setExpandedGroups((prev) => ({ ...prev, [idx]: !prev[idx] }));

  return { groups, expandedGroups, toggleGroup, user };
}
