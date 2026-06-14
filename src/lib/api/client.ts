import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiResponse } from "@/types";

const baseURL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8080"
    : undefined);

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/** Let the browser set multipart boundary; default application/json breaks @RequestPart multipart. */
apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type QueuedRequest = {
  run: () => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

function processQueue(error: unknown) {
  failedQueue.forEach(({ run, reject }) => {
    if (error) reject(error);
    else run();
  });
  failedQueue = [];
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

function shouldAttemptRefresh(config: InternalAxiosRequestConfig | undefined): boolean {
  const url = config?.url ?? "";
  if (url.includes("/auth/refresh")) return false;
  if (url.includes("/auth/login")) return false;
  if (url.includes("/auth/logout")) return false;
  return true;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as RetriableConfig;

    if (error.response.status !== 401) {
      return Promise.reject(error);
    }

    if (!shouldAttemptRefresh(originalRequest)) {
      if (originalRequest.url?.includes("/auth/refresh")) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          run: () => {
            resolve(apiClient(originalRequest));
          },
          reject: (err) => reject(err),
        });
      });
    }

    isRefreshing = true;

    try {
      await apiClient.post("/auth/refresh");
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error) && error.response?.data) {
    const data = error.response.data as ApiResponse;
    return data.error?.message ?? data.message ?? error.message;
  }
  return error instanceof Error ? error.message : "An unexpected error occurred";
}
