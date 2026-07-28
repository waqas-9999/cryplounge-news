/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Client-side token generation and validation
 */

import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';

export class CSRFProtection {
  private static TOKEN_KEY = 'csrf_token';
  private static TOKEN_EXPIRY_KEY = 'csrf_token_expiry';
  private static TOKEN_EXPIRY = 3600000; // 1 hour

  /**
   * Generate cryptographically secure random token
   */
  private static generateRandomToken(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for older browsers
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    const token = this.generateRandomToken();
    const expiry = Date.now() + this.TOKEN_EXPIRY;

    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString());

    return token;
  }

  /**
   * Get current CSRF token
   */
  static getToken(): string | null {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (!token || !expiry) {
      return this.generateToken();
    }

    if (Date.now() > parseInt(expiry)) {
      return this.generateToken();
    }

    return token;
  }

  /**
   * Verify CSRF token
   */
  static verifyToken(token: string): boolean {
    const storedToken = sessionStorage.getItem(this.TOKEN_KEY);
    const expiry = sessionStorage.getItem(this.TOKEN_EXPIRY_KEY);

    if (!storedToken || !expiry) return false;
    if (Date.now() > parseInt(expiry)) return false;
    if (token !== storedToken) return false;

    return true;
  }

  /**
   * Add CSRF token to headers
   */
  static addToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
    return headers;
  }

  /**
   * Add CSRF token to form data
   */
  static addToFormData(formData: FormData): FormData {
    const token = this.getToken();
    if (token) {
      formData.append('csrf_token', token);
    }
    return formData;
  }

  /**
   * Add CSRF token to request body
   */
  static addToBody<T extends Record<string, any>>(body: T): T & { csrf_token: string } {
    const token = this.getToken();
    return {
      ...body,
      csrf_token: token || '',
    };
  }

  /**
   * Clear CSRF token
   */
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  /**
   * Refresh token (generate new one)
   */
  static refreshToken(): string {
    this.clearToken();
    return this.generateToken();
  }
}

/**
 * React hook for CSRF protection
 */
export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const csrfToken = CSRFProtection.getToken();
    setToken(csrfToken);

    // Refresh token periodically (every 30 minutes)
    const interval = setInterval(() => {
      const newToken = CSRFProtection.refreshToken();
      setToken(newToken);
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    token,
    getToken: CSRFProtection.getToken,
    verifyToken: CSRFProtection.verifyToken,
    addToHeaders: CSRFProtection.addToHeaders,
    addToFormData: CSRFProtection.addToFormData,
    addToBody: CSRFProtection.addToBody,
    refreshToken: CSRFProtection.refreshToken,
  };
}

/**
 * Higher-order component to protect forms with CSRF
 */
export function withCSRFProtection<T extends Record<string, any>>(
  Component: ComponentType<T>
) {
  return function CSRFProtectedComponent(props: T) {
    const { token } = useCSRF();
    return <Component {...props} csrfToken={token} />;
  };
}
