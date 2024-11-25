export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
