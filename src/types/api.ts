/**
 * Backend API response envelope (gateway + admin-service).
 * Success: success=true, data set, error null.
 * Error: success=false, error set, data/message null.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginationResponse<T = unknown> {
  result: T[];
  totalCount: number;
}
