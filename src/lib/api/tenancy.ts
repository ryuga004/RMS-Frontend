import { apiClient } from "./client";
import type { ApiResponse, TenancyInvitationResponse, TenancyRequestResponse, TenantListItemResponse, PaginationResponse } from "@/types";

const ADMIN_PREFIX = "/api/admin";

export async function getMyInvitations(): Promise<TenancyInvitationResponse[]> {
  const { data } = await apiClient.get<ApiResponse<TenancyInvitationResponse[]>>(
    `${ADMIN_PREFIX}/tenancy-invitations`
  );
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch invitations");
  return data.data;
}

export async function acceptInvitation(assetId: number): Promise<void> {
  await apiClient.post(`${ADMIN_PREFIX}/tenancy-invitations/${assetId}/accept`);
}

export async function rejectInvitation(assetId: number): Promise<void> {
  await apiClient.post(`${ADMIN_PREFIX}/tenancy-invitations/${assetId}/reject`);
}

export async function createTenancyRequest(assetId: number): Promise<void> {
  await apiClient.post(`${ADMIN_PREFIX}/assets/${assetId}/tenancy-requests`);
}

export async function approveTenancyRequest(assetId: number, userId: number): Promise<void> {
  await apiClient.post(`${ADMIN_PREFIX}/assets/${assetId}/tenancy-requests/${userId}/approve`);
}

export async function rejectTenancyRequest(assetId: number, userId: number): Promise<void> {
  await apiClient.post(`${ADMIN_PREFIX}/assets/${assetId}/tenancy-requests/${userId}/reject`);
}

export async function createTenancyInvitation(assetId: number, tenantUserId: number): Promise<void> {
  await apiClient.post(`${ADMIN_PREFIX}/assets/${assetId}/tenancy-invitations`, { tenantUserId });
}

export async function getSentRequests(): Promise<TenancyRequestResponse[]> {
  const { data } = await apiClient.get<ApiResponse<TenancyRequestResponse[]>>(
    `${ADMIN_PREFIX}/assets/tenancy-requests/sent`
  );
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch sent requests");
  return data.data;
}

export async function getIncomingRequests(): Promise<TenancyRequestResponse[]> {
  const { data } = await apiClient.get<ApiResponse<TenancyRequestResponse[]>>(
    `${ADMIN_PREFIX}/assets/tenancy-requests/incoming`
  );
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch incoming requests");
  return data.data;
}

export async function getTenants(params: {
  page?: number;
  limit?: number;
  searchText?: string;
  assetIds?: number[];
}): Promise<PaginationResponse<TenantListItemResponse>> {
  const { page = 0, limit = 10, searchText, assetIds } = params;
  const { data } = await apiClient.get<ApiResponse<PaginationResponse<TenantListItemResponse>>>(
    `${ADMIN_PREFIX}/assets/tenants`,
    {
      params: {
        pageNumber: page,
        pageSize: limit,
        searchText,
        assetIds: assetIds?.join(",") || undefined,
      },
    }
  );
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch tenants");
  return data.data;
}

export async function removeTenant(assetId: number, userId: number): Promise<void> {
  await apiClient.delete(`${ADMIN_PREFIX}/assets/${assetId}/tenants/${userId}`);
}
