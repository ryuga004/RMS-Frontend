"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import {
  LayoutDashboard,
  ShoppingBag,
  ListOrdered,
  User,
  PlusCircle,
  ClipboardList,
  ChevronRight,
  MessageSquare,
  Mail,
  Inbox,
  Users,
  Bell,
  CreditCard,
  Receipt,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import { isAdmin } from "@/types";

type NavItem = { href: string; label: string; icon: React.ElementType };

const COMMON_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/requests", label: "Requests", icon: Inbox },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const TENANT_NAV: NavItem[] = [
  ...COMMON_NAV,
  { href: "/dashboard/rentals", label: "My Rentals", icon: ShoppingBag },
  { href: "/dashboard/invitations", label: "Invitations", icon: Mail },
  { href: "/dashboard/payments", label: "Make Payment", icon: CreditCard },
  { href: "/dashboard/payment-history", label: "Payment History", icon: Receipt },
];

const ADMIN_NAV: NavItem[] = [
  ...COMMON_NAV,
  { href: "/dashboard/listings", label: "Manage Listings", icon: ListOrdered },
  { href: "/dashboard/tenants", label: "Manage Tenants", icon: Users },
  { href: "/dashboard/payment-options", label: "Payment Options", icon: Wallet },
  { href: "/dashboard/payment-history", label: "Payment History", icon: Receipt },
  { href: "/dashboard/audits", label: "Audit Logs", icon: ClipboardList },
  { href: "/list-item", label: "List New Item", icon: PlusCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const admin = user ? isAdmin(user.roleId) : false;

  const navigation = admin ? ADMIN_NAV : TENANT_NAV;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/20">
      <Navbar />
      <div className="container flex-1 items-start py-8 md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-20 z-30 hidden h-[calc(100vh-8rem)] w-full shrink-0 overflow-y-auto border-r border-border md:sticky md:block">
          <div className="space-y-4 py-4 pr-6">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Dashboard
              </h2>
              <div className="space-y-0.5">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center justify-between rounded px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
                      pathname === item.href
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {pathname === item.href && (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {admin && (
              <div className="mx-3 rounded border border-primary/20 bg-primary/5 px-4 py-3">
                <p className="text-xs font-semibold text-primary">Admin Control</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  Elevated access to manage assets and system logs.
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="flex w-full flex-col overflow-hidden px-4 md:px-0">
          {children}
        </main>
      </div>
    </div>
  );
}
