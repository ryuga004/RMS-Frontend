import { apiClient } from "./client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<void> {
  await apiClient.post("/auth/login", credentials);
}

export async function refresh(): Promise<void> {
  await apiClient.post("/auth/refresh");
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");
}
