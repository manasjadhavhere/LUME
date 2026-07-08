import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface UseApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  isFormData?: boolean;
}

interface ApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (endpoint: string, options?: UseApiOptions) => Promise<T | null>;
}

/**
 * Fetch wrapper that auto-injects the JWT token and handles errors uniformly.
 */
export function useApi<T = unknown>(): ApiResult<T> {
  const { token, logout } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (endpoint: string, options: UseApiOptions = {}): Promise<T | null> => {
      const { method = 'GET', body, isFormData = false } = options;

      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {};

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        if (!isFormData && body) {
          headers['Content-Type'] = 'application/json';
        }

        const res = await fetch(`${API_BASE}${endpoint}`, {
          method,
          headers,
          body: isFormData
            ? (body as FormData)
            : body
            ? JSON.stringify(body)
            : undefined,
        });

        const json = await res.json();

        if (!res.ok) {
          // 401 = token expired — auto logout
          if (res.status === 401) {
            logout();
          }
          throw new Error(json.message || `Request failed with status ${res.status}`);
        }

        const result = json.data as T;
        setData(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, logout]
  );

  return { data, loading, error, execute };
}

/**
 * Standalone fetch function for cases where hook can't be used
 */
export async function apiFetch<T>(
  endpoint: string,
  options: UseApiOptions & { token?: string } = {}
): Promise<T> {
  const { method = 'GET', body, isFormData = false, token } = options;

  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: isFormData
      ? (body as FormData)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json.data as T;
}
