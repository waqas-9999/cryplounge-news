/**
 * Admin session adapter.
 *
 * Backs the admin panel with the real backend (`POST /auth/login` etc, via
 * `src/lib/auth-client.ts`). This file exists to keep the call sites
 * (`AdminLoginPage`, `admin-guard.tsx`, `views/admin.tsx`) unchanged — they
 * already only use `isAuthenticated`, `getSession`, `hasPermission`, and
 * `clearSession`.
 *
 * There is no fallback authentication. A wrong password fails; there is no
 * hardcoded account.
 */

import * as authClient from '@/lib/auth-client';
import { ApiError } from '@/lib/auth-client';

export interface AdminSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
}

export class AdminAuthService {
  /**
   * Authenticate against the backend. Throws `ApiError` on invalid
   * credentials — callers should catch it and show `error.message`.
   */
  static async login(email: string, password: string): Promise<AdminSession> {
    const user = await authClient.login(email, password);
    return toSession(user);
  }

  static async logout(): Promise<void> {
    await authClient.logout();
  }

  /** Synchronous — only reflects state already loaded this session. */
  static getSession(): AdminSession | null {
    const user = authClient.getCurrentUser();
    return user ? toSession(user) : null;
  }

  static isAuthenticated(): boolean {
    return authClient.getCurrentUser() !== null;
  }

  /**
   * Call once on mount (e.g. in a route guard) to restore a session from the
   * persisted refresh token after a page reload. Resolves to `null` if there
   * is no valid session.
   */
  static async restoreSession(): Promise<AdminSession | null> {
    const user = await authClient.restoreSession();
    return user ? toSession(user) : null;
  }

  static hasPermission(permission: string): boolean {
    const user = authClient.getCurrentUser();
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;
    return user.permissions.includes(permission);
  }

  static clearSession(): void {
    // Fire-and-forget: the caller (logout button) navigates away immediately
    // regardless of whether the network call completes.
    void authClient.logout();
  }
}

function toSession(user: authClient.AuthenticatedUser): AdminSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };
}

export { ApiError };

/** React hook mirroring the previous mock implementation's shape. */
export function useAdminAuth() {
  return {
    checkAuth: (): boolean => AdminAuthService.isAuthenticated(),
    hasPermission: (permission: string): boolean => AdminAuthService.hasPermission(permission),
    logout: (): void => AdminAuthService.clearSession(),
    getSession: (): AdminSession | null => AdminAuthService.getSession(),
    isAuthenticated: AdminAuthService.isAuthenticated(),
  };
}
