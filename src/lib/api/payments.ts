import { apiClient } from "./client";
import type {
  PaymentOption,
  Payment,
  CheckoutSessionResponse,
  CreatePaymentOptionRequest,
  UpdatePaymentOptionRequest,
} from "@/types/payment";
import type { ApiResponse, PaginationResponse } from "@/types";

const PREFIX = "/api/admin";

// ============================================================================
// PAYMENT OPTIONS — owner CRUD
// ============================================================================

export async function createPaymentOption(
  data: CreatePaymentOptionRequest
): Promise<ApiResponse<number>> {
  const res = await apiClient.post<ApiResponse<number>>(`${PREFIX}/payment-options`, data);
  return res.data;
}

export async function updatePaymentOption(
  id: number,
  data: UpdatePaymentOptionRequest
): Promise<ApiResponse<null>> {
  const res = await apiClient.put<ApiResponse<null>>(`${PREFIX}/payment-options/${id}`, data);
  return res.data;
}

export async function deletePaymentOption(id: number): Promise<void> {
  await apiClient.delete(`${PREFIX}/payment-options/${id}`);
}

export async function getOwnerPaymentOptions(
  pageNumber = 0,
  pageSize = 10
): Promise<ApiResponse<PaginationResponse<PaymentOption>>> {
  const res = await apiClient.get<ApiResponse<PaginationResponse<PaymentOption>>>(
    `${PREFIX}/payment-options`,
    { params: { pageNumber, pageSize } }
  );
  return res.data;
}

export async function getPaymentOptionById(
  id: number
): Promise<ApiResponse<PaymentOption>> {
  const res = await apiClient.get<ApiResponse<PaymentOption>>(
    `${PREFIX}/payment-options/${id}`
  );
  return res.data;
}

export async function getPaymentOptionsByAsset(
  assetId: number
): Promise<ApiResponse<PaymentOption[]>> {
  const res = await apiClient.get<ApiResponse<PaymentOption[]>>(
    `${PREFIX}/payment-options/by-asset/${assetId}`
  );
  return res.data;
}

// ============================================================================
// PAYMENTS — tenant checkout + both history views
// ============================================================================

export async function createCheckoutSession(
  paymentOptionId: number
): Promise<ApiResponse<CheckoutSessionResponse>> {
  const res = await apiClient.post<ApiResponse<CheckoutSessionResponse>>(
    `${PREFIX}/payments/checkout-session`,
    { paymentOptionId }
  );
  return res.data;
}

export async function getOwnerPaymentHistory(
  pageNumber = 0,
  pageSize = 10
): Promise<ApiResponse<PaginationResponse<Payment>>> {
  const res = await apiClient.get<ApiResponse<PaginationResponse<Payment>>>(
    `${PREFIX}/payments/history/owner`,
    { params: { pageNumber, pageSize } }
  );
  return res.data;
}

export async function getTenantPaymentHistory(
  pageNumber = 0,
  pageSize = 10
): Promise<ApiResponse<PaginationResponse<Payment>>> {
  const res = await apiClient.get<ApiResponse<PaginationResponse<Payment>>>(
    `${PREFIX}/payments/history/tenant`,
    { params: { pageNumber, pageSize } }
  );
  return res.data;
}
