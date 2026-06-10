import { apiClient } from "./client";

export async function requestVerification(email: string): Promise<string> {
  const { data } = await apiClient.post<{ success: boolean; data?: string; message?: string }>(
    "/api/admin/register/verification-request",
    { email }
  );
  return (data as { data?: string })?.data ?? (data as { message?: string })?.message ?? "Verification email sent.";
}

export async function verifyEmail(email: string, verificationCode: string): Promise<void> {
  await apiClient.post("/api/admin/register/verify-email", { email, verificationCode });
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  roleId: number;
}

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post("/api/admin/register", payload);
}
