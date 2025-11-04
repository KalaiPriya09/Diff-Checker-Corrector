import { API_BASE_URL } from '@/constants';

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, `API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, 'Network error occurred');
  }
}

/**
 * GET request
 */
export async function get<T>(endpoint: string): Promise<T> {
  const response = await apiFetch<T>(endpoint, { method: 'GET' });
  return response.data;
}

/**
 * POST request
 */
export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return response.data;
}

/**
 * PUT request
 */
export async function put<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await apiFetch<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return response.data;
}

/**
 * DELETE request
 */
export async function del<T>(endpoint: string): Promise<T> {
  const response = await apiFetch<T>(endpoint, { method: 'DELETE' });
  return response.data;
}
