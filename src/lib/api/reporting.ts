import { apiClient } from "./client";
import type {
  AuditSearchResponse,
  ChatSearchResponse,
  NotificationSearchResponse,
} from "@/types";

const PREFIX = "/api/reporting";

export interface AuditSearchParams {
  eventId?: string;
  type?: string;
  userId?: number;
  method?: string;
  path?: string;
  resourceId?: string;
  action?: string;
  status?: number;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export async function getAuditEvents(params: AuditSearchParams): Promise<AuditSearchResponse> {
  const { data } = await apiClient.get<AuditSearchResponse>(`${PREFIX}/audit`, { params });
  return data;
}

export interface ChatSearchParams {
  messageId?: string;
  roomId?: string;
  senderId?: number;
  recipientId?: number;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export async function getChatMessages(params: ChatSearchParams): Promise<ChatSearchResponse> {
  const { data } = await apiClient.get<ChatSearchResponse>(`${PREFIX}/chat/messages`, { params });
  return data;
}

export interface NotificationSearchParams {
  notificationId?: string;
  userId?: number;
  type?: string;
  broadcast?: boolean;
  isRead?: boolean;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export async function getNotifications(params: NotificationSearchParams): Promise<NotificationSearchResponse> {
  const { data } = await apiClient.get<NotificationSearchResponse>(`${PREFIX}/notifications`, { params });
  return data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiClient.put(`${PREFIX}/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(userId?: number): Promise<void> {
  await apiClient.put(`${PREFIX}/notifications/read-all`, null, {
    params: userId != null ? { userId } : undefined,
  });
}
