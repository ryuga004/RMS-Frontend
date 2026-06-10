"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/lib/redux/store";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/api/reporting";
import { NotificationTypeRegistry, type VisualCategory } from "./registry";
import { Client, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  rawType: string;
  type: VisualCategory;
  unread: boolean;
  isNew: boolean;
  link?: string;
  createdAt?: string;
}

export interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function formatTimestamp(value?: string): string {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Just now";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Context ─────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotificationsContext(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotificationsContext must be used inside NotificationProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = Number(user?.id ?? 0) || null;

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const clientRef = useRef<Client | null>(null);
  const userSubRef = useRef<StompSubscription | null>(null);
  const broadcastSubRef = useRef<StompSubscription | null>(null);

  const wsUrl =
    process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL ?? "http://localhost:8085/ws";

  // ── REST fetch on mount ───────────────────────────────────────────────────

  useEffect(() => {
    if (userId == null) return;
    let cancelled = false;
    setIsLoading(true);

    Promise.all([
      getNotifications({ userId, page: 0, size: 50, sortBy: "createdAt", sortDir: "desc" }),
      getNotifications({ broadcast: true, page: 0, size: 50, sortBy: "createdAt", sortDir: "desc" }),
    ])
      .then(([direct, broadcast]) => {
        if (cancelled) return;
        const seen = new Set<string>();
        const merged = [...direct.items, ...broadcast.items]
          .filter((e) => {
            const key = e.notificationId ?? e.id;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((e): NotificationItem => {
            const config = NotificationTypeRegistry.resolve(e.type);
            return {
              id: e.notificationId ?? e.id,
              title: e.title ?? "Notification",
              message: e.body ?? "",
              time: formatTimestamp(e.createdAt),
              rawType: e.type ?? "",
              type: config.category,
              unread: !e.isRead,
              isNew: false,
              link:
                config.getActionLink?.(e.metadata ?? {}) ??
                (e.metadata as { link?: string } | undefined)?.link,
              createdAt: e.createdAt,
            };
          });
        setNotifications(merged);
      })
      .catch(() => {
        // silently fail — context is best-effort
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  // ── STOMP WebSocket ───────────────────────────────────────────────────────

  useEffect(() => {
    if (userId == null) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => setIsConnected(true),
      onStompError: () => setIsConnected(false),
      onWebSocketClose: () => setIsConnected(false),
      onWebSocketError: () => setIsConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      userSubRef.current?.unsubscribe();
      broadcastSubRef.current?.unsubscribe();
      userSubRef.current = null;
      broadcastSubRef.current = null;
      clientRef.current?.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [userId, wsUrl]);

  useEffect(() => {
    if (!isConnected || !clientRef.current) return;

    const handleIncoming = (body: string) => {
      try {
        const payload = JSON.parse(body);
        const config = NotificationTypeRegistry.resolve(payload.type);
        const item: NotificationItem = {
          id: payload.notificationId ?? payload.id ?? `n-${Date.now()}`,
          title: payload.title ?? "Notification",
          message: payload.body ?? "",
          time: formatTimestamp(payload.createdAt),
          rawType: payload.type ?? "",
          type: config.category,
          unread: true,
          isNew: true,
          link:
            config.getActionLink?.(payload.metadata ?? {}) ??
            payload?.metadata?.link,
          createdAt: payload.createdAt,
        };
        setNotifications((prev) => [item, ...prev]);
        toast(item.title, { description: item.message });
      } catch {
        // ignore malformed frames
      }
    };

    userSubRef.current?.unsubscribe();
    broadcastSubRef.current?.unsubscribe();

    userSubRef.current = clientRef.current.subscribe(
      `/topic/users.${userId}.notifications`,
      (frame) => handleIncoming(frame.body)
    );
    broadcastSubRef.current = clientRef.current.subscribe(
      `/topic/notifications`,
      (frame) => handleIncoming(frame.body)
    );

    return () => {
      userSubRef.current?.unsubscribe();
      broadcastSubRef.current?.unsubscribe();
      userSubRef.current = null;
      broadcastSubRef.current = null;
    };
  }, [isConnected, userId]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const markRead = useCallback(
    (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      markNotificationRead(id).catch(() => {/* best-effort */});
    },
    []
  );

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    markAllNotificationsRead(userId ?? undefined).catch(() => {/* best-effort */});
  }, [userId]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        isLoading,
        markRead,
        markAllRead,
        dismiss,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
