import { apiClient } from "./client";
import type {
  ApiResponse,
  PaginationResponse,
  AssetListItem,
  AssetDetailResponse,
} from "@/types";

const PREFIX = "/api/admin/assets";

export interface GetAssetsParams {
  pageNumber?: number;
  pageSize?: number;
  searchText?: string;
  categoryIds?: number[];
  adminIds?: number[];
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export async function getMyAssets(params: GetAssetsParams = {}): Promise<PaginationResponse<AssetListItem>> {
  const { data } = await apiClient.get<ApiResponse<PaginationResponse<AssetListItem>>>(PREFIX, { params });
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch assets");
  return data.data;
}

/** Global browse endpoint for all assets with filters */
export async function getBrowseAssets(params: GetAssetsParams = {}): Promise<PaginationResponse<AssetListItem>> {
  try {
    const { data } = await apiClient.get<ApiResponse<PaginationResponse<AssetListItem>>>(`${PREFIX}/all`, {
      params,
    });
    if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch assets");
    return data.data;
  } catch {
    return { result: [], totalCount: 0 };
  }
}

export async function getAssetById(id: number): Promise<AssetDetailResponse> {
  const { data } = await apiClient.get<ApiResponse<AssetDetailResponse>>(`${PREFIX}/${id}`);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Asset not found");
  return data.data;
}

export async function createAsset(formData: FormData): Promise<number> {
  const { data } = await apiClient.post<ApiResponse<number>>(PREFIX, formData);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to create asset");
  return data.data;
}

export async function updateAsset(id: number, formData: FormData): Promise<void> {
  const { data } = await apiClient.put<ApiResponse<void>>(`${PREFIX}/${id}`, formData);
  if (!data.success) throw new Error(data.error?.message ?? "Failed to update asset");
}

export async function deleteAsset(id: number): Promise<void> {
  await apiClient.delete(`${PREFIX}/${id}`);
}

export async function getMyRentals(): Promise<AssetListItem[]> {
  const { data } = await apiClient.get<ApiResponse<AssetListItem[]>>(`${PREFIX}/my-rentals`);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch rentals");
  return data.data;
}
