/**
 * Shared HTTP / API types.
 *
 * Add ApiError<T>, PaginatedResponse<T>, etc. here as the backend
 * contract firms up. Keep this file free of implementation logic so it
 * can be imported from features and tests.
 */
export interface ApiError<TData = unknown> {
  message: string;
  code?: string;
  data?: TData;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
