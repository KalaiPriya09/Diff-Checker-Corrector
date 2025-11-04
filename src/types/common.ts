/**
 * Common types used across the application
 */

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: Nullable<T>;
  status: Status;
  error: Nullable<string>;
}
