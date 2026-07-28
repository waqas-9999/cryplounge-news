/**
 * Client-Side Rate Limiter
 * Prevents brute force attacks and API abuse
 */

import { useState } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    attempts: number;
    resetAt: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private storageKey = 'rate_limit_store';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load rate limit data from localStorage
   */
  private loadFromStorage(): void {
    // This class is instantiated at module scope, which also runs on the
    // server during SSR/prerender where localStorage does not exist.
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.store = JSON.parse(stored);
        // Clean expired entries
        this.cleanExpired();
      }
    } catch (error) {
      console.error('Failed to load rate limit store:', error);
      this.store = {};
    }
  }

  /**
   * Save rate limit data to localStorage
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.store));
    } catch (error) {
      console.error('Failed to save rate limit store:', error);
    }
  }

  /**
   * Clean expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetAt < now) {
        delete this.store[key];
      }
    });
    this.saveToStorage();
  }

  /**
   * Check if rate limit is exceeded
   */
  isLimited(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.store[key];

    // No record or window expired
    if (!record || now > record.resetAt) {
      this.store[key] = {
        attempts: 1,
        resetAt: now + config.windowMs,
      };
      this.saveToStorage();
      return false;
    }

    // Increment attempts
    record.attempts++;
    this.saveToStorage();

    // Check if limit exceeded
    if (record.attempts > config.maxAttempts) {
      return true;
    }

    return false;
  }

  /**
   * Get remaining attempts
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const record = this.store[key];
    if (!record || Date.now() > record.resetAt) {
      return config.maxAttempts;
    }
    return Math.max(0, config.maxAttempts - record.attempts);
  }

  /**
   * Get time until reset (ms)
   */
  getResetTime(key: string): number {
    const record = this.store[key];
    if (!record) return 0;
    return Math.max(0, record.resetAt - Date.now());
  }

  /**
   * Clear rate limit for key
   */
  clear(key: string): void {
    delete this.store[key];
    this.saveToStorage();
  }

  /**
   * Clear all rate limits
   */
  clearAll(): void {
    this.store = {};
    localStorage.removeItem(this.storageKey);
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  SIGNUP: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many signup attempts. Please try again later.',
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    message: 'Too many password reset requests. Please try again later.',
  },
  ADMIN_LOGIN: {
    maxAttempts: 3,
    windowMs: 30 * 60 * 1000, // 30 minutes
    message: 'Too many admin login attempts. Account locked for 30 minutes.',
  },
  API: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please slow down.',
  },
  FORM_SUBMIT: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Too many form submissions. Please wait a moment.',
  },
};

/**
 * React hook for rate limiting
 */
export function useRateLimit(key: string, config: RateLimitConfig) {
  const [isLimited, setIsLimited] = useState(false);
  const [remaining, setRemaining] = useState(config.maxAttempts);
  const [resetIn, setResetIn] = useState(0);

  const check = (): boolean => {
    const limited = rateLimiter.isLimited(key, config);
    setIsLimited(limited);
    setRemaining(rateLimiter.getRemaining(key, config));
    setResetIn(rateLimiter.getResetTime(key));
    return limited;
  };

  const clear = () => {
    rateLimiter.clear(key);
    setIsLimited(false);
    setRemaining(config.maxAttempts);
    setResetIn(0);
  };

  return {
    isLimited,
    remaining,
    resetIn,
    check,
    clear,
  };
}

/**
 * Format reset time as human-readable string
 */
export function formatResetTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
}
