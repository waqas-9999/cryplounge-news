/**
 * Admin Authentication Utility
 * Client-side admin session management with token-based auth
 * NOTE: This is frontend-only until backend is ready
 */

import { SecureStorage } from './secureStorage';

export interface AdminSession {
  userId: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator';
  permissions: string[];
  loginTime: number;
  lastActivity: number;
  expiresAt: number;
}

export class AdminAuthService {
  private static SESSION_KEY = 'admin_session';
  private static SESSION_DURATION = 8 * 60 * 60 * 1000; // 8 hours
  private static INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static activityTimer: NodeJS.Timeout | null = null;

  /**
   * Create admin session
   */
  static createSession(email: string, role: AdminSession['role'] = 'admin'): AdminSession {
    const now = Date.now();
    const session: AdminSession = {
      userId: this.generateUserId(),
      email,
      role,
      permissions: this.getPermissionsForRole(role),
      loginTime: now,
      lastActivity: now,
      expiresAt: now + this.SESSION_DURATION,
    };

    SecureStorage.set(this.SESSION_KEY, session);
    this.startActivityMonitoring();
    
    return session;
  }

  /**
   * Get current session
   */
  static getSession(): AdminSession | null {
    const session = SecureStorage.get<AdminSession>(this.SESSION_KEY);
    
    if (!session) return null;

    const now = Date.now();

    // Check if session expired
    if (now > session.expiresAt) {
      this.clearSession();
      return null;
    }

    // Check inactivity timeout
    if (now - session.lastActivity > this.INACTIVITY_TIMEOUT) {
      this.clearSession();
      return null;
    }

    return session;
  }

  /**
   * Update last activity timestamp
   */
  static updateActivity(): void {
    const session = this.getSession();
    if (session) {
      session.lastActivity = Date.now();
      SecureStorage.set(this.SESSION_KEY, session);
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Check if user has permission
   */
  static hasPermission(permission: string): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Super admin has all permissions
    if (session.role === 'super_admin') return true;

    return session.permissions.includes(permission);
  }

  /**
   * Clear session (logout)
   */
  static clearSession(): void {
    SecureStorage.remove(this.SESSION_KEY);
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
  }

  /**
   * Get permissions for role
   */
  private static getPermissionsForRole(role: AdminSession['role']): string[] {
    const permissions: Record<AdminSession['role'], string[]> = {
      super_admin: ['*'], // All permissions
      admin: [
        'news.create', 'news.edit', 'news.delete', 'news.publish',
        'learn.create', 'learn.edit', 'learn.delete', 'learn.publish',
        'events.create', 'events.edit', 'events.delete', 'events.publish',
        'founders.create', 'founders.edit', 'founders.delete',
        'users.view', 'users.edit',
        'analytics.view',
        'settings.view', 'settings.edit',
      ],
      editor: [
        'news.create', 'news.edit', 'news.delete',
        'learn.create', 'learn.edit',
        'events.create', 'events.edit',
        'founders.create', 'founders.edit',
        'analytics.view',
      ],
      moderator: [
        'news.edit',
        'learn.edit',
        'events.view', 'events.edit',
        'users.view',
      ],
    };

    return permissions[role] || [];
  }

  /**
   * Generate random user ID
   */
  private static generateUserId(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Start monitoring user activity
   */
  private static startActivityMonitoring(): void {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }

    // Update activity every minute
    this.activityTimer = setInterval(() => {
      const session = this.getSession();
      if (!session) {
        if (this.activityTimer) {
          clearInterval(this.activityTimer);
          this.activityTimer = null;
        }
      }
    }, 60 * 1000);

    // Listen for user activity
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      const handler = () => this.updateActivity();
      
      events.forEach(event => {
        window.addEventListener(event, handler, { passive: true });
      });
    }
  }

  /**
   * Get time until session expires
   */
  static getTimeUntilExpiry(): number {
    const session = this.getSession();
    if (!session) return 0;
    return Math.max(0, session.expiresAt - Date.now());
  }

  /**
   * Get time since last activity
   */
  static getTimeSinceActivity(): number {
    const session = this.getSession();
    if (!session) return 0;
    return Date.now() - session.lastActivity;
  }

  /**
   * Validate admin credentials (temporary - replace with backend)
   */
  static async validateCredentials(email: string, password: string): Promise<boolean> {
    // TODO: Replace with actual backend API call
    // This is a temporary implementation for demo purposes
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Temporary hardcoded admin credentials (CHANGE THIS!)
    const validAdmins = [
      { email: 'admin@cryplounge.com', password: 'Admin@123' },
      { email: 'editor@cryplounge.com', password: 'Editor@123' },
    ];

    return validAdmins.some(admin => 
      admin.email === email && admin.password === password
    );
  }

  /**
   * Get role from email (temporary - replace with backend)
   */
  static getRoleFromEmail(email: string): AdminSession['role'] {
    if (email === 'admin@cryplounge.com') return 'super_admin';
    if (email === 'editor@cryplounge.com') return 'editor';
    return 'moderator';
  }
}

/**
 * React hook for admin authentication
 */
export function useAdminAuth() {
  const checkAuth = (): boolean => {
    return AdminAuthService.isAuthenticated();
  };

  const hasPermission = (permission: string): boolean => {
    return AdminAuthService.hasPermission(permission);
  };

  const logout = (): void => {
    AdminAuthService.clearSession();
  };

  const getSession = (): AdminSession | null => {
    return AdminAuthService.getSession();
  };

  return {
    checkAuth,
    hasPermission,
    logout,
    getSession,
    isAuthenticated: AdminAuthService.isAuthenticated(),
  };
}