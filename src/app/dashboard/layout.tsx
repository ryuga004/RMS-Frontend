"use client";

import { useState, useEffect } from "react";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user } = useSelector((state: RootState) => state.auth);
  const admin = user ? isAdmin(user.roleId) : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  const commonNav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/requests", label: "Requests", icon: Inbox },
    { href: "/dashboard/profile", label: "Profile", icon: User },
  ];

  const tenantNav = [
    ...commonNav,
    { href: "/dashboard/rentals", label: "My Rentals", icon: ShoppingBag },
    { href: "/dashboard/invitations", label: "Invitations", icon: Mail },
    { href: "/dashboard/payments", label: "Make Payment", icon: CreditCard },
    { href: "/dashboard/payment-history", label: "Payment History", icon: Receipt },
  ];

  const adminNav = [
    ...commonNav,
    { href: "/dashboard/listings", label: "Manage Listings", icon: ListOrdered },
    { href: "/dashboard/tenants", label: "Manage Tenants", icon: Users },
    { href: "/dashboard/payment-options", label: "Payment Options", icon: Wallet },
    { href: "/dashboard/payment-history", label: "Payment History", icon: Receipt },
    { href: "/dashboard/audits", label: "Audit Logs", icon: ClipboardList },
    { href: "/list-item", label: "List New Item", icon: PlusCircle },
  ];

  const navigation = admin ? adminNav : tenantNav;

    return (
        <div className="flex min-h-screen flex-col bg-secondary/20">
            <Navbar />
            <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 py-8">
                <aside className="fixed top-20 z-30 hidden h-[calc(100vh-8rem)] w-full shrink-0 overflow-y-auto border-r border-border md:sticky md:block">
                    <div className="space-y-4 py-4 pr-6">
                        <div className="px-3 py-2">
                            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                Dashboard
                            </h2>
                            <div className="space-y-1">
                                {mounted && navigation.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "group flex items-center justify-between rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
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
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        {mounted && admin && (
                            <div className="px-7 py-5 mt-8 rounded-3xl bg-primary/5 border border-primary/10 backdrop-blur-sm">
                                <p className="text-sm font-semibold text-primary">Admin Control</p>
                                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                                    You have full elevated access to manage assets and system logs.
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
