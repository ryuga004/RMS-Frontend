import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Info,
  UserPlus,
  UserCheck,
  UserX,
  UserMinus,
  XCircle,
  Mail,
  MailCheck,
  MailX,
  Clock,
  Home,
  Trash2,
  MessageSquare,
  Megaphone,
  CreditCard,
  DollarSign,
} from "lucide-react";

export type VisualCategory = "success" | "alert" | "info" | "stats" | "default";

export interface NotificationTypeConfig {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  category: VisualCategory;
  getActionLink?: (metadata: Record<string, unknown>) => string | undefined;
}

const FALLBACK_DEFAULT: NotificationTypeConfig = {
  label: "Notification",
  icon: Bell,
  colorClass: "bg-muted/60 text-muted-foreground",
  category: "default",
};

const FALLBACK_SUCCESS: NotificationTypeConfig = {
  label: "Success",
  icon: CheckCircle2,
  colorClass: "bg-emerald-500/10 text-emerald-600",
  category: "success",
};

const FALLBACK_ALERT: NotificationTypeConfig = {
  label: "Alert",
  icon: AlertCircle,
  colorClass: "bg-rose-500/10 text-rose-600",
  category: "alert",
};

const FALLBACK_INFO: NotificationTypeConfig = {
  label: "Info",
  icon: Info,
  colorClass: "bg-blue-500/10 text-blue-600",
  category: "info",
};

const FALLBACK_STATS: NotificationTypeConfig = {
  label: "Stats",
  icon: TrendingUp,
  colorClass: "bg-primary/10 text-primary",
  category: "stats",
};

class NotificationTypeRegistryClass {
  private readonly exact = new Map<string, NotificationTypeConfig>();

  register(type: string, config: NotificationTypeConfig): void {
    this.exact.set(type.toUpperCase(), config);
  }

  resolve(rawType?: string): NotificationTypeConfig {
    if (!rawType) return FALLBACK_DEFAULT;
    const upper = rawType.toUpperCase();
    if (this.exact.has(upper)) return this.exact.get(upper)!;
    // Pattern fallback — mirrors resolveType() in the original notifications page
    const lower = rawType.toLowerCase();
    if (
      lower.includes("alert") ||
      lower.includes("error") ||
      lower.includes("fail") ||
      lower.includes("reject")
    )
      return FALLBACK_ALERT;
    if (lower.includes("stat") || lower.includes("metric")) return FALLBACK_STATS;
    if (lower.includes("info")) return FALLBACK_INFO;
    if (
      lower.includes("success") ||
      lower.includes("confirm") ||
      lower.includes("ok") ||
      lower.includes("approv")
    )
      return FALLBACK_SUCCESS;
    return FALLBACK_DEFAULT;
  }
}

export const NotificationTypeRegistry = new NotificationTypeRegistryClass();

// Pre-register all domain notification types
NotificationTypeRegistry.register("TENANCY_REQUEST_RECEIVED", {
  label: "New Rental Request",
  icon: UserPlus,
  colorClass: "bg-blue-500/10 text-blue-600",
  category: "info",
  getActionLink: () => "/dashboard/requests",
});

NotificationTypeRegistry.register("TENANCY_REQUEST_APPROVED", {
  label: "Request Approved",
  icon: UserCheck,
  colorClass: "bg-emerald-500/10 text-emerald-600",
  category: "success",
  getActionLink: () => "/dashboard/rentals",
});

NotificationTypeRegistry.register("TENANCY_REQUEST_REJECTED", {
  label: "Request Rejected",
  icon: UserX,
  colorClass: "bg-rose-500/10 text-rose-600",
  category: "alert",
  getActionLink: () => "/dashboard/requests",
});

NotificationTypeRegistry.register("TENANCY_REQUEST_CANCELLED", {
  label: "Request Cancelled",
  icon: XCircle,
  colorClass: "bg-blue-500/10 text-blue-600",
  category: "info",
  getActionLink: () => "/dashboard/requests",
});

NotificationTypeRegistry.register("INVITATION_RECEIVED", {
  label: "Rental Invitation",
  icon: Mail,
  colorClass: "bg-blue-500/10 text-blue-600",
  category: "info",
  getActionLink: () => "/dashboard/invitations",
});

NotificationTypeRegistry.register("INVITATION_ACCEPTED", {
  label: "Invitation Accepted",
  icon: MailCheck,
  colorClass: "bg-emerald-500/10 text-emerald-600",
  category: "success",
  getActionLink: () => "/dashboard/tenants",
});

NotificationTypeRegistry.register("INVITATION_REJECTED", {
  label: "Invitation Declined",
  icon: MailX,
  colorClass: "bg-rose-500/10 text-rose-600",
  category: "alert",
  getActionLink: () => "/dashboard/tenants",
});

NotificationTypeRegistry.register("INVITATION_EXPIRED", {
  label: "Invitation Expired",
  icon: Clock,
  colorClass: "bg-rose-500/10 text-rose-600",
  category: "alert",
  getActionLink: () => "/dashboard/invitations",
});

NotificationTypeRegistry.register("TENANT_REMOVED", {
  label: "Removed from Asset",
  icon: UserMinus,
  colorClass: "bg-rose-500/10 text-rose-600",
  category: "alert",
  getActionLink: () => "/dashboard/rentals",
});

NotificationTypeRegistry.register("ASSET_UPDATED", {
  label: "Asset Updated",
  icon: Home,
  colorClass: "bg-blue-500/10 text-blue-600",
  category: "info",
  getActionLink: (metadata) => {
    const id = metadata?.assetId;
    return id != null ? `/item/${id}` : undefined;
  },
});

NotificationTypeRegistry.register("ASSET_DELETED", {
  label: "Asset Removed",
  icon: Trash2,
  colorClass: "bg-rose-500/10 text-rose-600",
  category: "alert",
});

NotificationTypeRegistry.register("NEW_MESSAGE", {
  label: "New Message",
  icon: MessageSquare,
  colorClass: "bg-blue-500/10 text-blue-600",
  category: "info",
  getActionLink: () => "/dashboard/messages",
});

NotificationTypeRegistry.register("SYSTEM_ANNOUNCEMENT", {
  label: "Announcement",
  icon: Megaphone,
  colorClass: "bg-primary/10 text-primary",
  category: "stats",
});

NotificationTypeRegistry.register("PAYMENT_RECEIVED", {
  label: "Payment Received",
  icon: DollarSign,
  colorClass: "bg-emerald-500/10 text-emerald-600",
  category: "success",
  getActionLink: () => "/dashboard/payment-history",
});

NotificationTypeRegistry.register("PAYMENT_COMPLETED_TENANT", {
  label: "Payment Successful",
  icon: CreditCard,
  colorClass: "bg-emerald-500/10 text-emerald-600",
  category: "success",
  getActionLink: () => "/dashboard/payment-history",
});
