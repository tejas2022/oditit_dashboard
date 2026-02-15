import axios, { type AxiosInstance } from 'axios';
import type { ApiResponse } from '../types/api';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

/** Default request timeout (ms). Long enough for LLM/dashboard summary, short enough to fail fast. */
const DEFAULT_TIMEOUT_MS = 60_000;

/** Max retries for 5xx / network errors (so total attempts = 1 + RETRY_COUNT). */
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

export const api: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: DEFAULT_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function shouldRetryRequest(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false;
  const status = err.response?.status;
  const is5xx = status != null && status >= 500;
  const isNetwork = err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK';
  const is429 = status === 429;
  return is5xx || isNetwork || is429;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    const retryCount = (original?._retryCount as number) ?? 0;

    // Retry on 5xx / network / 429 (avoid retrying auth refresh and already-retried)
    if (
      shouldRetryRequest(err) &&
      retryCount < RETRY_COUNT &&
      original &&
      !original._retry
    ) {
      (original as Record<string, unknown>)._retryCount = retryCount + 1;
      await delay(RETRY_DELAY_MS * (retryCount + 1));
      return api(original);
    }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        try {
          const { data } = await axios.post<{ accessToken?: string; refreshToken?: string }>(
            `${baseURL}/auth/refresh`,
            { refreshToken: refresh },
            { timeout: 15_000 }
          );
          const accessToken = data?.accessToken ?? (data as any)?.data?.accessToken;
          if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            const ref = data?.refreshToken ?? (data as any)?.data?.refreshToken;
            if (ref) localStorage.setItem('refreshToken', ref);
            original.headers.Authorization = `Bearer ${accessToken}`;
            return api(original);
          }
        } catch (_) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export function getData<T>(res: ApiResponse<T>): T {
  return res.data;
}
