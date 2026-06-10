import { apiClient } from "./client";
import type { ApiResponse, Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/api/admin/categories");
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch categories");
  return data.data;
}
