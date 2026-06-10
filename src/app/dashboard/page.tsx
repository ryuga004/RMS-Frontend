"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import Link from "next/link";
import {
    Home,
    Users,
    Inbox,
    Mail,
    ShoppingBag,
    SendHorizontal,
    ArrowRight,
    Bell,
    PlusCircle,
    ListOrdered,
    ClipboardList,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isAdmin } from "@/types";
import { getMyAssets } from "@/lib/api/assets";
import { getMyRentals } from "@/lib/api/assets";
import { getTenants, getIncomingRequests, getSentRequests, getMyInvitations } from "@/lib/api/tenancy";
import { useNotificationsContext } from "@/lib/notifications/context";
import { NotificationTypeRegistry } from "@/lib/notifications/registry";

type DashboardStats = {
    myAssets: number | null;
    myTenants: number | null;
    pendingRequests: number | null;
    pendingInvitations: number | null;
    myRentals: number | null;
    sentRequests: number | null;
};

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState<DashboardStats>({
        myAssets: null,
        myTenants: null,
        pendingRequests: null,
        pendingInvitations: null,
        myRentals: null,
        sentRequests: null,
    });
    const { user } = useSelector((state: RootState) => state.auth);
    const admin = user ? isAdmin(user.roleId) : false;
    const { notifications } = useNotificationsContext();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !user) return;

        if (admin) {
            // Owner: fetch assets, tenants, incoming requests
            Promise.allSettled([
                getMyAssets({ pageNumber: 0, pageSize: 1 }),
                getTenants({ page: 0, limit: 1 }),
                getIncomingRequests(),
            ]).then(([assetsRes, tenantsRes, requestsRes]) => {
                setStats((prev) => ({
                    ...prev,
                    myAssets: assetsRes.status === "fulfilled" ? assetsRes.value.totalCount : 0,
                    myTenants: tenantsRes.status === "fulfilled" ? tenantsRes.value.totalCount : 0,
                    pendingRequests: requestsRes.status === "fulfilled" ? requestsRes.value.length : 0,
                }));
            });
        } else {
            // Tenant: fetch rentals, sent requests, invitations
            Promise.allSettled([
                getMyRentals(),
                getSentRequests(),
                getMyInvitations(),
            ]).then(([rentalsRes, sentRes, invitationsRes]) => {
                setStats((prev) => ({
                    ...prev,
                    myRentals: rentalsRes.status === "fulfilled" ? rentalsRes.value.length : 0,
                    sentRequests: sentRes.status === "fulfilled" ? sentRes.value.length : 0,
                    pendingInvitations: invitationsRes.status === "fulfilled" ? invitationsRes.value.length : 0,
                }));
            });
        }
    }, [mounted, user, admin]);

    if (!mounted) {
        return <div className="h-96 w-full animate-pulse bg-secondary/10 rounded-2xl" />;
    }

    const recentNotifications = notifications.slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Welcome back, {user?.name || "User"}
                </h1>
                <p className="text-muted-foreground">
                    {admin
                        ? "Here's what's happening with your properties."
                        : "Here's an overview of your rental activity."}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {admin ? (
                    <>
                        <StatsCard
                            title="My Assets"
                            value={stats.myAssets}
                            icon={Home}
                            href="/dashboard/listings"
                        />
                        <StatsCard
                            title="My Tenants"
                            value={stats.myTenants}
                            icon={Users}
                            href="/dashboard/tenants"
                        />
                        <StatsCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                            icon={Inbox}
                            href="/dashboard/requests"
                            highlight={stats.pendingRequests != null && stats.pendingRequests > 0}
                        />
                        <StatsCard
                            title="Notifications"
                            value={notifications.filter(n => n.unread).length}
                            icon={Bell}
                            href="/dashboard/notifications"
                            highlight={notifications.filter(n => n.unread).length > 0}
                        />
                    </>
                ) : (
                    <>
                        <StatsCard
                            title="My Rentals"
                            value={stats.myRentals}
                            icon={ShoppingBag}
                            href="/dashboard/rentals"
                        />
                        <StatsCard
                            title="Sent Requests"
                            value={stats.sentRequests}
                            icon={SendHorizontal}
                            href="/dashboard/requests"
                        />
                        <StatsCard
                            title="Invitations"
                            value={stats.pendingInvitations}
                            icon={Mail}
                            href="/dashboard/invitations"
                            highlight={stats.pendingInvitations != null && stats.pendingInvitations > 0}
                        />
                        <StatsCard
                            title="Notifications"
                            value={notifications.filter(n => n.unread).length}
                            icon={Bell}
                            href="/dashboard/notifications"
                            highlight={notifications.filter(n => n.unread).length > 0}
                        />
                    </>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Quick Actions */}
                <Card className="col-span-full lg:col-span-3 shadow-card">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            {admin ? "Manage your properties and tenants." : "Navigate to key areas."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {admin ? (
                            <>
                                <QuickAction href="/list-item" icon={PlusCircle} label="List New Property" />
                                <QuickAction href="/dashboard/listings" icon={ListOrdered} label="Manage Listings" />
                                <QuickAction href="/dashboard/requests" icon={Inbox} label="View Requests" />
                                <QuickAction href="/dashboard/tenants" icon={Users} label="Manage Tenants" />
                                <QuickAction href="/dashboard/audits" icon={ClipboardList} label="Audit Logs" />
                            </>
                        ) : (
                            <>
                                <QuickAction href="/browse" icon={Home} label="Browse Properties" />
                                <QuickAction href="/dashboard/rentals" icon={ShoppingBag} label="My Rentals" />
                                <QuickAction href="/dashboard/invitations" icon={Mail} label="Check Invitations" />
                                <QuickAction href="/dashboard/requests" icon={SendHorizontal} label="My Requests" />
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-full lg:col-span-4 shadow-card">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                Your latest notifications.
                            </CardDescription>
                        </div>
                        {recentNotifications.length > 0 && (
                            <Link href="/dashboard/notifications">
                                <Button variant="ghost" size="sm" className="text-xs">
                                    View all <ArrowRight className="ml-1 h-3 w-3" />
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {recentNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
                                <p className="text-sm font-medium text-foreground/50">No recent activity</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {admin
                                        ? "Activity will appear here when tenants interact with your properties."
                                        : "Activity will appear here when you receive updates."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentNotifications.map((noti) => {
                                    const config = NotificationTypeRegistry.resolve(noti.rawType);
                                    const Icon = config.icon;
                                    return (
                                        <div key={noti.id} className="flex items-start gap-3">
                                            <div className={cn(
                                                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                                                config.colorClass
                                            )}>
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-sm font-medium leading-none truncate",
                                                        noti.unread && "font-bold"
                                                    )}>
                                                        {noti.title}
                                                    </p>
                                                    {noti.unread && (
                                                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {noti.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/60">
                                                    {noti.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({
    title,
    value,
    icon: Icon,
    href,
    highlight,
}: {
    title: string;
    value: number | null;
    icon: React.ElementType;
    href: string;
    highlight?: boolean;
}) {
    return (
        <Link href={href}>
            <Card className={cn(
                "shadow-card overflow-hidden transition-colors hover:bg-secondary/30 cursor-pointer",
                highlight && "ring-1 ring-primary/30"
            )}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className={cn("h-4 w-4", highlight ? "text-primary" : "text-muted-foreground")} />
                </CardHeader>
                <CardContent>
                    {value === null ? (
                        <div className="h-8 w-16 animate-pulse bg-secondary/30 rounded" />
                    ) : (
                        <div className={cn("text-2xl font-bold", highlight && "text-primary")}>
                            {value}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}

function QuickAction({
    href,
    icon: Icon,
    label,
}: {
    href: string;
    icon: React.ElementType;
    label: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground group"
        >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}
