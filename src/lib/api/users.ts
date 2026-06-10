import { apiClient } from "./client";
import type { ApiResponse, PaginationResponse, UserResponse, UserProfileResponse, User } from "@/types";
import { ROLE_ID_ADMIN, ROLE_ID_SUPER_ADMIN, ROLE_ID_TENANT } from "@/types";

const PREFIX = "/api/admin/users";

function userFromUserResponse(inner: UserResponse): User {
  let role: User["role"] = "TENANT";
  if (inner.roleId === ROLE_ID_SUPER_ADMIN) role = "SUPER_ADMIN";
  else if (inner.roleId === ROLE_ID_ADMIN) role = "ADMIN";
  else if (inner.roleId === ROLE_ID_TENANT) role = "TENANT";
  return {
    id: String(inner.id),
    name: inner.name ?? "User",
    email: inner.email,
    roleId: inner.roleId,
    role,
  };
}

export async function getUser(id: number): Promise<UserResponse> {
  const { data } = await apiClient.get<ApiResponse<UserResponse>>(`${PREFIX}/${id}`);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "User not found");
  return data.data;
}

export async function getProfile(id: number): Promise<UserProfileResponse> {
  const { data } = await apiClient.get<ApiResponse<UserProfileResponse>>(`${PREFIX}/${id}/profile`);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Profile not found");
  return data.data;
}

export const getProfileByUserId = getProfile;

export async function updateProfile(id: number, payload: Partial<UserProfileResponse>): Promise<UserProfileResponse> {
  const { data } = await apiClient.put<ApiResponse<UserProfileResponse>>(`${PREFIX}/${id}/profile`, payload);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to update profile");
  return data.data;
}

export async function updateProfileImage(id: number, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.put<ApiResponse<string>>(`${PREFIX}/${id}/profile/image`, formData);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to update image");
  return data.data;
}

export async function listUsers(pageNumber = 0, pageSize = 20, searchText?: string): Promise<PaginationResponse<UserResponse>> {
  const params = new URLSearchParams();
  params.set("pageNumber", String(pageNumber));
  params.set("pageSize", String(pageSize));
  if (searchText) params.set("searchText", searchText);
  const { data } = await apiClient.get<ApiResponse<PaginationResponse<UserResponse>>>(`${PREFIX}?${params.toString()}`);
  if (!data.success || data.data == null) throw new Error(data.error?.message ?? "Failed to fetch users");
  return data.data;
}
/** Current user from admin-service GET /api/admin/users/me (gateway → GET /users/me). */
export async function getMe(): Promise<User | null> {
  try {
    const { data } = await apiClient.get<ApiResponse<UserResponse>>(`${PREFIX}/me`);
    const inner = data?.data;
    if (data.success && inner != null && (inner.id != null || inner.email)) {
      return userFromUserResponse(inner);
    }
  } catch {
    // Missing token or service unavailable
  }
  return null;
}

