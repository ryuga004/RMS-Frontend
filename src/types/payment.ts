export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";

export type PaymentType = "RENT" | "DEPOSIT" | "MAINTENANCE" | "OTHER";

export type RecurringInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface PaymentOption {
  id: number;
  assetId: number;
  assetTitle: string;
  ownerId: number;
  name: string;
  description: string | null;
  amount: number;
  currency: string;
  paymentType: PaymentType;
  isRecurring: boolean;
  recurringInterval: RecurringInterval | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  paymentOptionId: number;
  paymentOptionName: string;
  assetId: number;
  assetTitle: string;
  tenantUserId: number;
  tenantName: string;
  tenantEmail: string;
  ownerUserId: number;
  ownerName: string;
  ownerEmail: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeCheckoutSessionId: string | null;
  stripePaymentIntentId: string | null;
  description: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface CreatePaymentOptionRequest {
  assetId: number;
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  paymentType?: PaymentType;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
}

export interface UpdatePaymentOptionRequest {
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  paymentType?: PaymentType;
  isRecurring?: boolean;
  recurringInterval?: RecurringInterval;
  isActive?: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  paymentId: number;
}
