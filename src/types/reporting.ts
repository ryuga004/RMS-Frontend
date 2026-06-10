export type AuditType =
  | "USER"
  | "ASSET"
  | "TENANCY_INVITATION"
  | "TENANCY_REQUEST"
  | "CATEGORY"
  | "UNKNOWN";

export type AuditAction = "CREATE" | "UPDATE" | "DELETE";

export interface AuditEvent {
  id: string;
  eventId: string;
  type: AuditType;
  userId: number;
  method: string;
  path: string;
  resourceId: string;
  action: AuditAction;
  status: number;
  timestamp: string;
  receivedAt: string;
}

export interface AuditSearchResponse {
  items: AuditEvent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ChatMessage {
  id: string;
  messageId: string;
  roomId?: string;
  senderId: number;
  recipientId?: number;
  content: string;
  metadata?: Record<string, unknown>;
  sentAt: string;
  receivedAt: string;
}

export interface ChatSearchResponse {
  items: ChatMessage[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface NotificationEvent {
  id: string;
  notificationId: string;
  userId?: number;
  title: string;
  body: string;
  type: string;
  broadcast: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  receivedAt: string;
  isRead: boolean;
}

export interface NotificationSearchResponse {
  items: NotificationEvent[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
