"use client";

import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import { RootState } from "@/lib/redux/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, MoreVertical, Info, Paperclip, Smile, RefreshCw, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import * as userApi from "@/lib/api/users";
import { getChatMessages } from "@/lib/api/reporting";

type ChatUser = {
    id: number;
    name: string;
    avatar: string | undefined;
    status: string;
    role: string;
};

type ChatListItem = {
    id: string;
    user: ChatUser;
    lastMessage: string;
    time: string;
    unread: number;
};

type ChatViewMessage = {
    id: string;
    senderId: number;
    content: string;
    sentAt: string;
    status?: "sending" | "failed" | "sent";
};

function MessagesContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("userId");
    const { user } = useSelector((state: RootState) => state.auth);

    const [chats, setChats] = useState<ChatListItem[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatListItem | null>(null);
    const [mounted, setMounted] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<ChatViewMessage[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [connected, setConnected] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [isUserListLoading, setIsUserListLoading] = useState(false);
    const [userListError, setUserListError] = useState<string | null>(null);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<StompSubscription | null>(null);

    const currentUserId = Number(user?.id ?? 0) || 1;
    const selectedUserId = selectedChat?.user?.id ?? null;
    const roomId = selectedUserId
        ? `direct-${[currentUserId, selectedUserId].sort((a, b) => a - b).join("-")}`
        : "direct-unknown";
    const wsUrl = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL ?? "http://localhost:8085/ws";

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        let cancelled = false;

        setIsUserListLoading(true);
        setUserListError(null);

        userApi.listUsers(0, 50)
            .then((response) => {
                if (cancelled) return;
                const items = response.result.filter((u) => String(u.id) !== String(currentUserId));
                if (items.length === 0) return;
                const mapped = items.map((u) => ({
                    id: String(u.id),
                    user: {
                        id: u.id,
                        name: u.name ?? `User ${u.id}`,
                        avatar: undefined,
                        status: "online",
                        role: "User"
                    },
                    lastMessage: "Start a conversation",
                    time: "Just now",
                    unread: 0
                }));
                setChats(mapped);
                setSelectedChat((prev) => {
                    const existing = mapped.find((c) => c.user.id === prev?.user.id);
                    return existing ?? mapped[0];
                });
            })
            .catch(() => {
                if (!cancelled) {
                    setUserListError("Unable to load users.");
                }
            })
            .finally(() => {
                if (!cancelled) setIsUserListLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [mounted, currentUserId]);

    useEffect(() => {
        if (!mounted || !selectedUserId) {
            setMessages([]);
            return;
        }

        let cancelled = false;
        setIsHistoryLoading(true);
        setHistoryError(null);

        Promise.all([
            getChatMessages({
                senderId: currentUserId,
                recipientId: selectedUserId,
                page: 0,
                size: 200,
                sortBy: "sentAt",
                sortDir: "asc"
            }),
            getChatMessages({
                senderId: selectedUserId,
                recipientId: currentUserId,
                page: 0,
                size: 200,
                sortBy: "sentAt",
                sortDir: "asc"
            })
        ])
            .then(([outbound, inbound]) => {
                if (cancelled) return;
                const merged = [...outbound.items, ...inbound.items]
                    .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())
                    .map((item) => ({
                        id: item.messageId ?? item.id,
                        senderId: item.senderId,
                        content: item.content ?? "",
                        sentAt: item.sentAt,
                        status: "sent" as const
                    }));
                setMessages(merged);
            })
            .catch(() => {
                if (!cancelled) {
                    setHistoryError("Unable to load message history.");
                    setMessages([]);
                }
            })
            .finally(() => {
                if (!cancelled) setIsHistoryLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [mounted, selectedUserId, currentUserId]);

    useEffect(() => {
        if (!mounted) return;

        const client = new Client({
            webSocketFactory: () => new SockJS(wsUrl),
            reconnectDelay: 5000,
            onConnect: () => {
                setConnected(true);
                setConnectionError(null);
            },
            onStompError: (frame) => {
                setConnectionError(frame.headers["message"] ?? "STOMP error");
            },
            onWebSocketClose: () => {
                setConnected(false);
            },
            onWebSocketError: () => {
                setConnected(false);
                setConnectionError("WebSocket error");
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
            clientRef.current?.deactivate();
            clientRef.current = null;
        };
    }, [mounted, wsUrl]);

    useEffect(() => {
        if (!connected || !clientRef.current) return;
        if (!roomId || roomId === "direct-unknown") return;

        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = clientRef.current.subscribe(`/topic/chat.${roomId}`, (frame) => {
            try {
                const payload = JSON.parse(frame.body);
                if (payload.senderId === currentUserId) {
                    return;
                }
                const incoming: ChatViewMessage = {
                    id: payload.messageId ?? Date.now().toString(),
                    senderId: payload.senderId ?? 0,
                    content: payload.content ?? "",
                    sentAt: payload.sentAt ?? new Date().toISOString(),
                    status: "sent"
                };
                setMessages((prev) => [...prev, incoming]);
            } catch (err) {
                console.error("Failed to parse chat message", err);
            }
        });

        return () => {
            subscriptionRef.current?.unsubscribe();
            subscriptionRef.current = null;
        };
    }, [connected, roomId, currentUserId]);

    const filteredChats = useMemo(() => {
        return chats.filter(c => c.user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [chats, searchQuery]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        if (!selectedUserId) return;

        const trimmed = message.trim();
        const optimisticId = `local-${Date.now()}`;
        const sentAt = new Date().toISOString();

        const optimistic: ChatViewMessage = {
            id: optimisticId,
            senderId: currentUserId,
            content: trimmed,
            sentAt,
            status: connected ? "sending" : "failed"
        };

        setMessages((prev) => [...prev, optimistic]);
        setMessage("");

        if (clientRef.current && connected) {
            clientRef.current.publish({
                destination: "/app/chat.send",
                body: JSON.stringify({
                    roomId,
                    senderId: currentUserId,
                    recipientId: selectedUserId,
                    content: trimmed,
                    sentAt
                })
            });
            setMessages((prev) =>
                prev.map((msg) => (msg.id === optimisticId ? { ...msg, status: "sent" } : msg))
            );
        } else {
            setConnectionError("Not connected to chat server.");
        }

        // Update last message in chat list
        if (selectedChat) {
            setChats(prev => prev.map(c =>
                c.id === selectedChat.id
                    ? { ...c, lastMessage: trimmed, time: "Just now" }
                    : c
            ));
        }
    };

    if (!mounted) return null;

    return (
        <div className="h-[calc(100vh-12rem)] min-h-[600px] flex items-stretch overflow-hidden rounded-2xl border border-border bg-card shadow-card animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Sidebar: Chat List */}
            <div className="w-80 md:w-96 flex flex-col border-r border-border bg-muted/20">
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold tracking-tight">Messages</h1>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-9 h-10 bg-background/50 border-none ring-1 ring-border/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    {isUserListLoading && (
                        <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Loading users...
                        </div>
                    )}
                    {userListError && (
                        <div className="text-xs text-rose-500">{userListError}</div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredChats.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={cn(
                                "flex items-start gap-4 p-4 cursor-pointer transition-all hover:bg-secondary/40 border-b border-border/30",
                                selectedChat?.id === chat.id ? "bg-secondary text-foreground" : "text-muted-foreground"
                            )}
                        >
                            <div className="relative">
                                <Avatar className="h-12 w-12 border border-border/50">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                        {chat.user.name[0]}
                                    </AvatarFallback>
                                </Avatar>
                                {chat.user.status === "online" && (
                                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-card" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="text-sm font-bold text-foreground truncate">{chat.user.name}</h3>
                                    <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs truncate font-medium">{chat.lastMessage}</p>
                                    {chat.unread > 0 && (
                                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground font-bold">
                                            {chat.unread}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredChats.length === 0 && (
                        <div className="p-6 text-sm text-muted-foreground">No users found.</div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-card/50">
                {!selectedChat ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                            <p className="text-lg font-medium text-foreground/50">Select a conversation</p>
                            <p className="text-sm text-muted-foreground">Choose a user from the list to start messaging.</p>
                        </div>
                    </div>
                ) : (
                <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between bg-card/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/50">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {selectedChat.user.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-sm font-bold leading-none mb-1">{selectedChat.user.name}</h3>
                            <div className="text-[10px] text-muted-foreground">
                                {connected ? "Connected" : "Disconnected"}{connectionError ? ` - ${connectionError}` : ""}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><Info className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground"><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-card/30">
                    <div className="flex justify-center">
                        <Badge variant="secondary" className="bg-secondary/40 text-muted-foreground text-[10px] uppercase font-bold px-3">Today</Badge>
                    </div>
                    {isHistoryLoading && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Loading chat history...
                        </div>
                    )}
                    {historyError && (
                        <div className="text-xs text-rose-500">{historyError}</div>
                    )}
                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUserId;
                        const timeLabel = msg.sentAt
                            ? new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : "";
                        return (
                        <div key={msg.id} className={cn(
                            "flex flex-col max-w-[70%] group",
                            isMe ? "ml-auto items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words relative",
                                isMe
                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                    : "bg-secondary/60 text-foreground rounded-tl-none border border-border/30"
                            )}>
                                {msg.content}
                            </div>
                            <span className="text-[9px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {timeLabel}
                                {isMe && msg.status && msg.status !== "sent" ? ` - ${msg.status}` : ""}
                            </span>
                        </div>
                        );
                    })}
                    {messages.length === 0 && !isHistoryLoading && (
                        <div className="text-sm text-muted-foreground">No messages yet. Start the conversation.</div>
                    )}
                </div>

                {/* Message Input */}
                <div className="p-4 bg-card/80 backdrop-blur-md border-t border-border">
                    <form
                        className="flex items-center gap-2"
                        onSubmit={handleSendMessage}
                    >
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Paperclip className="h-4 w-4" /></Button>
                        <Input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 h-11 bg-background/50 border-none ring-1 ring-border/50 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Smile className="h-4 w-4" /></Button>
                        <Button type="submit" size="icon" className="h-11 w-11 rounded-full shadow-lg transition-transform active:scale-95">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
                </>
                )}
            </div>
        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <MessagesContent />
        </Suspense>
    );
}



