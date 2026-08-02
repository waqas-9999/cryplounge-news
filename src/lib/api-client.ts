/**
 * HTTP client for the NestJS backend (`server/`).
 *
 * Every backend endpoint returns one envelope shape:
 *   { success, statusCode, message, data, pagination?, timestamp }
 * (see `server/src/common/dto/api-response.dto.ts`). This module is the only
 * place that knows that — callers get back plain data (or a `Paginated<T>`),
 * never the envelope.
 *
 * Auth: the backend issues a short-lived access token and a rotating refresh
 * token, both in the JSON response body (it has no httpOnly-cookie flow to
 * use instead — see `server/src/modules/auth/auth.controller.ts`). The
 * access token is kept in memory only; the refresh token is persisted so a
 * page reload doesn't force a re-login. A 401 triggers one silent refresh
 * attempt before failing.
 */

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(
  /\/+$/,
  ''
);

/** Public origin the API is served from, e.g. for building absolute media URLs. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

const REFRESH_TOKEN_KEY = 'cryplounge_admin_refresh_token';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}

interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  code?: string;
  errors?: Record<string, string[]>;
}

/* --------------------------------------------------------- token state --- */

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function loadRefreshToken(): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

function storeRefreshToken(token: string | null): void {
  if (!isBrowser()) return;
  if (token) window.localStorage.setItem(REFRESH_TOKEN_KEY, token);
  else window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/** Set after login/refresh; cleared on logout. Not exported — go through `authClient`. */
export function setTokens(tokens: { accessToken: string; refreshToken: string } | null): void {
  accessToken = tokens?.accessToken ?? null;
  storeRefreshToken(tokens?.refreshToken ?? null);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function hasStoredSession(): boolean {
  return loadRefreshToken() !== null;
}

/**
 * Exchange the stored refresh token for a new pair. Used both for silent
 * background refresh and for restoring a session after a page reload.
 * Concurrent callers share one in-flight request.
 */
export async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refreshToken = loadRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        setTokens(null);
        return false;
      }

      const envelope = (await response.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
      }>;
      setTokens(envelope.data);
      return true;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

/* -------------------------------------------------------------- request --- */

export interface RequestOptions {
  /** Query params, serialized and appended to the URL. */
  query?: Record<string, string | number | boolean | undefined | null>;
  /** Attach `Authorization: Bearer <token>`. Default true. */
  auth?: boolean;
  /** Skip the automatic refresh-and-retry on a 401. Used by the refresh call itself. */
  skipAuthRetry?: boolean;
  signal?: AbortSignal;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}/${path.replace(/^\/+/, '')}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const { query, auth = true, skipAuthRetry = false, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  // 401 with a stored refresh token: refresh once, then retry the original call.
  if (response.status === 401 && auth && !skipAuthRetry && hasStoredSession()) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(method, path, body, { ...options, skipAuthRetry: true });
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = await response.json();
  } catch {
    // Non-JSON error body (e.g. a proxy/500 page) — fall through to the generic error below.
  }

  if (!response.ok || !envelope || envelope.success === false) {
    throw new ApiError(
      envelope?.message ?? `Request failed with status ${response.status}`,
      envelope?.statusCode ?? response.status,
      envelope?.code ?? 'UNKNOWN_ERROR',
      envelope?.errors
    );
  }

  return envelope.data;
}

async function requestUpload<T>(
  path: string,
  formData: FormData,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, skipAuthRetry = false, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers,
    body: formData,
    signal,
  });

  if (response.status === 401 && auth && !skipAuthRetry && hasStoredSession()) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return requestUpload<T>(path, formData, { ...options, skipAuthRetry: true });
    }
  }

  const envelope = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !envelope.success) {
    throw new ApiError(
      envelope.message ?? `Request failed with status ${response.status}`,
      envelope.statusCode ?? response.status,
      envelope.code ?? 'UNKNOWN_ERROR',
      envelope.errors
    );
  }

  return envelope.data;
}

async function requestPaginated<T>(
  method: 'GET',
  path: string,
  options: RequestOptions = {}
): Promise<Paginated<T>> {
  const { query, auth = true, skipAuthRetry = false, signal } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(buildUrl(path, query), { method, headers, signal });

  if (response.status === 401 && auth && !skipAuthRetry && hasStoredSession()) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return requestPaginated<T>(method, path, { ...options, skipAuthRetry: true });
    }
  }

  const envelope = (await response.json()) as ApiEnvelope<T[]>;

  if (!response.ok || !envelope.success) {
    throw new ApiError(
      envelope.message ?? `Request failed with status ${response.status}`,
      envelope.statusCode ?? response.status,
      envelope.code ?? 'UNKNOWN_ERROR',
      envelope.errors
    );
  }

  return {
    items: envelope.data,
    pagination: envelope.pagination ?? {
      page: 1,
      perPage: envelope.data.length,
      total: envelope.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('POST', path, body, options),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),
  delete: <T = void>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, undefined, options),
  getPaginated: <T>(path: string, options?: RequestOptions) =>
    requestPaginated<T>('GET', path, options),
  upload: <T>(path: string, formData: FormData, options?: RequestOptions) =>
    requestUpload<T>(path, formData, options),
};

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

/**
 * Absolute URL for a media path returned by the backend (e.g. `featuredImage.path`).
 *
 * Endpoints that go through `MediaService` (upload/list/findById/update) already
 * return a computed `url` field — prefer that over calling this. This helper only
 * exists for nested Media relations (e.g. `article.featuredImage.path`) that never
 * carry one. Legacy local-storage paths always end in a file extension; Cloudinary
 * public IDs never do (see `CloudinaryStorageProvider.save`), which is what lets us
 * tell them apart here without a schema change.
 */
export function mediaUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;

  const isLocalPath = /\.[a-zA-Z0-9]+$/.test(path);
  if (isLocalPath) {
    return `${API_ORIGIN}/uploads/${path.replace(/^\/+/, '')}`;
  }

  if (!CLOUDINARY_CLOUD_NAME) return undefined;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${path}`;
}
