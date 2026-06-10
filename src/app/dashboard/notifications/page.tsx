"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Trash2, Archive, ArrowRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useNotificationsContext } from "@/lib/notifications/context";
import { NotificationTypeRegistry } from "@/lib/notifications/registry";

export default function NotificationsPage() {
    const {
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        markRead,
        markAllRead,
        dismiss,
        clearAll,
    } = useNotificationsContext();

    const [filter, setFilter] = useState<"all" | "unread">("unread");

    const filteredNotifications = useMemo(() => {
        if (filter === "unread") return notifications.filter((n) => n.unread);
        return notifications;
    }, [filter, notifications]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                    <p className="text-muted-foreground">Keep up with updates, bookings, and performance alerts.</p>
                    <div className="text-[11px] text-muted-foreground">
                        {isConnected ? "Connected" : "Disconnected"}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={markAllRead}
                    >
                        Mark all as read
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-muted-foreground"
                        onClick={clearAll}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Clear All
                    </Button>
                </div>
            </div>

            <Card className="shadow-card border-none bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-2 border-b border-border/50">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant={filter === "all" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("all")}
                            className="h-8 rounded-full"
                        >
                            All ({notifications.length})
                        </Button>
                        <Button
                            variant={filter === "unread" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setFilter("unread")}
                            className="h-8 rounded-full"
                        >
                            Unread ({unreadCount})
                        </Button>
                        {isLoading && (
                            <span className="text-xs text-muted-foreground flex items-center gap-2">
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                Syncing...
                            </span>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-border/30">
                        {filteredNotifications.map((noti) => {
                            const config = NotificationTypeRegistry.resolve(noti.rawType);
                            const Icon = config.icon;
                            return (
                                <div
                                    key={noti.id}
                                    className={cn(
                                        "p-4 md:p-6 transition-all hover:bg-secondary/20 flex gap-4 group relative cursor-pointer",
                                        noti.unread && "bg-primary/5"
                                    )}
                                    onClick={() => markRead(noti.id)}
                                >
                                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", config.colorClass)}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1 pr-12">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className={cn("text-sm font-bold", noti.unread ? "text-foreground" : "text-foreground/80")}>
                                                {noti.title}
                                            </h3>
                                            {noti.isNew && (
                                                <Badge variant="default" className="text-[10px] h-4 px-1.5">New</Badge>
                                            )}
                                            {noti.unread && (
                                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{noti.message}</p>
                                        <div className="flex items-center gap-3 pt-2">
                                            <span className="text-[11px] font-medium text-muted-foreground">{noti.time}</span>
                                            {noti.link && (
                                                <Link
                                                    href={noti.link}
                                                    className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View details <ArrowRight className="h-3 w-3" />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dismiss(noti.id);
                                            }}
                                        >
                                            <Archive className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dismiss(noti.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredNotifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-muted/20">
                                <Bell className="h-12 w-12 text-muted-foreground/30 mb-4" />
                                <p className="text-lg font-medium text-foreground/50">All caught up!</p>
                                <p className="text-sm text-muted-foreground">You have no new notifications.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
