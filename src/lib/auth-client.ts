/**
 * Real authentication against the NestJS backend.
 *
 * This is the only module that talks to `/auth/*`. It exists separately from
 * `src/utils/adminAuth.ts` so the token/session mechanics are testable and
 * reusable; `adminAuth.ts` adapts this to the shape the existing admin pages
 * already expect.
 */
import { apiClient, ApiError, hasStoredSession, refreshSession, setTokens } from './api-client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

let currentUser: AuthenticatedUser | null = null;

export function getCurrentUser(): AuthenticatedUser | null {
  return currentUser;
}

export async function login(email: string, password: string): Promise<AuthenticatedUser> {
  const tokens = await apiClient.post<{ accessToken: string; refreshToken: string }>(
    'auth/login',
    { email, password },
    { auth: false }
  );
  setTokens(tokens);

  try {
    currentUser = await apiClient.get<AuthenticatedUser>('auth/me');
  } catch (error) {
    setTokens(null);
    throw error;
  }

  return currentUser;
}

export async function logout(): Promise<void> {
  const refreshToken =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('cryplounge_admin_refresh_token')
      : null;

  setTokens(null);
  currentUser = null;

  if (refreshToken) {
    try {
      await apiClient.post('auth/logout', { refreshToken }, { auth: false });
    } catch {
      // Best-effort: the local session is already cleared either way.
    }
  }
}

/**
 * Restores a session after a page reload using the persisted refresh token.
 * Returns null if there is no stored session or it's no longer valid.
 */
export async function restoreSession(): Promise<AuthenticatedUser | null> {
  if (currentUser) return currentUser;
  if (!hasStoredSession()) return null;

  const refreshed = await refreshSession();
  if (!refreshed) return null;

  try {
    currentUser = await apiClient.get<AuthenticatedUser>('auth/me');
    return currentUser;
  } catch {
    setTokens(null);
    return null;
  }
}

export { ApiError };
