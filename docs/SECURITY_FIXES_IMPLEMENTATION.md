# CrypLounge - Security Fixes Implementation Plan

**Date:** November 14, 2025  
**Priority:** P0 - CRITICAL  
**Timeline:** 48 hours

---

## 🚨 CRITICAL FIXES - IMPLEMENT IMMEDIATELY

### Fix #1: Admin Route Protection with JWT

#### Step 1: Create Auth Middleware
**File:** `/utils/adminAuth.ts`

```typescript
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export interface AdminTokenPayload {
  userId: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor' | 'moderator';
  permissions: string[];
  iat: number;
  exp: number;
}

export class AdminAuthService {
  /**
   * Generate JWT token for admin
   */
  static async generateToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'>): Promise<string> {
    const token = await new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
    
    return token;
  }

  /**
   * Verify and decode JWT token
   */
  static async verifyToken(token: string): Promise<AdminTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as AdminTokenPayload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Check if user has required permission
   */
  static hasPermission(payload: AdminTokenPayload, requiredPermission: string): boolean {
    if (payload.role === 'super_admin') return true;
    return payload.permissions.includes(requiredPermission);
  }

  /**
   * Refresh token
   */
  static async refreshToken(oldToken: string): Promise<string | null> {
    const payload = await this.verifyToken(oldToken);
    if (!payload) return null;

    // Check if token is about to expire (within 1 hour)
    const expiresIn = payload.exp * 1000 - Date.now();
    if (expiresIn > 3600000) return oldToken; // Still valid

    // Generate new token
    return this.generateToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    });
  }
}

/**
 * Admin route guard hook
 */
export function useAdminAuth() {
  const navigate = (page: string) => {
    window.location.href = `/${page}`;
  };

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('admin/login');
      return false;
    }

    const payload = await AdminAuthService.verifyToken(token);
    if (!payload) {
      localStorage.removeItem('admin_token');
      navigate('admin/login');
      return false;
    }

    // Refresh token if needed
    const newToken = await AdminAuthService.refreshToken(token);
    if (newToken && newToken !== token) {
      localStorage.setItem('admin_token', newToken);
    }

    return true;
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    const token = localStorage.getItem('admin_token');
    if (!token) return false;

    const payload = await AdminAuthService.verifyToken(token);
    if (!payload) return false;

    return AdminAuthService.hasPermission(payload, permission);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    navigate('admin/login');
  };

  return { checkAuth, hasPermission, logout };
}
```

#### Step 2: Update AdminLoginPage
**File:** `/pages/admin/AdminLoginPage.tsx` (modifications)

```typescript
import { AdminAuthService } from '../../utils/adminAuth';

// In the login handler:
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Call your backend API
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const { user, permissions } = await response.json();

    // Generate JWT token
    const token = await AdminAuthService.generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions,
    });

    // Store token securely
    localStorage.setItem('admin_token', token);

    // Navigate to dashboard
    onNavigate('admin/dashboard');
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Login failed');
  } finally {
    setLoading(false);
  }
};
```

#### Step 3: Protect Admin Routes in App.tsx
**File:** `/App.tsx` (modifications)

```typescript
import { useEffect, useState } from 'react';
import { AdminAuthService } from './utils/adminAuth';

// Add auth check function
const checkAdminAuth = async (): Promise<boolean> => {
  const token = localStorage.getItem('admin_token');
  if (!token) return false;

  const payload = await AdminAuthService.verifyToken(token);
  return !!payload;
};

// In your App component
useEffect(() => {
  if (isAdminPage && !isAdminLoginPage) {
    checkAdminAuth().then(isAuth => {
      if (!isAuth) {
        handleNavigate('admin/login');
      }
    });
  }
}, [currentPage]);
```

---

### Fix #2: CSRF Protection

#### Create CSRF Utility
**File:** `/utils/csrf.ts`

```typescript
import crypto from 'crypto';

export class CSRFProtection {
  private static TOKEN_KEY = 'csrf_token';
  private static TOKEN_EXPIRY = 3600000; // 1 hour

  /**
   * Generate CSRF token
   */
  static generateToken(): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = Date.now() + this.TOKEN_EXPIRY;

    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(`${this.TOKEN_KEY}_expiry`, expiry.toString());

    return token;
  }

  /**
   * Get current CSRF token
   */
  static getToken(): string | null {
    const token = sessionStorage.getItem(this.TOKEN_KEY);
    const expiry = sessionStorage.getItem(`${this.TOKEN_KEY}_expiry`);

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
    const expiry = sessionStorage.getItem(`${this.TOKEN_KEY}_expiry`);

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
   * Add CSRF token to form
   */
  static addToFormData(formData: FormData): FormData {
    const token = this.getToken();
    if (token) {
      formData.append('csrf_token', token);
    }
    return formData;
  }
}

/**
 * React hook for CSRF protection
 */
export function useCSRF() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(CSRFProtection.getToken());
  }, []);

  return {
    token,
    getToken: CSRFProtection.getToken,
    verifyToken: CSRFProtection.verifyToken,
    addToHeaders: CSRFProtection.addToHeaders,
  };
}
```

#### Use in Forms
**Example:** `/pages/admin/NewsCreatePage.tsx`

```typescript
import { useCSRF } from '../../utils/csrf';

const { addToHeaders } = useCSRF();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const response = await fetch('/api/admin/news', {
    method: 'POST',
    headers: addToHeaders({
      'Content-Type': 'application/json',
    }),
    body: JSON.stringify(formData),
  });

  // ... handle response
};
```

---

### Fix #3: Rate Limiting

#### Create Rate Limiter
**File:** `/utils/rateLimiter.ts`

```typescript
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
      return false;
    }

    // Increment attempts
    record.attempts++;

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
  API: {
    maxAttempts: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please slow down.',
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

  return {
    isLimited,
    remaining,
    resetIn,
    check,
  };
}
```

#### Use in Login Page
**File:** `/pages/LoginPage.tsx` (modifications)

```typescript
import { useRateLimit, RATE_LIMITS } from '../utils/rateLimiter';

const LoginPage = () => {
  const { check, isLimited, remaining, resetIn } = useRateLimit('login', RATE_LIMITS.LOGIN);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check rate limit
    if (check()) {
      const minutes = Math.ceil(resetIn / 60000);
      toast.error(`Too many attempts. Try again in ${minutes} minutes.`);
      return;
    }

    // Proceed with login
    try {
      await login(email, password);
    } catch (error) {
      // ... handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... form fields ... */}
      {isLimited && (
        <div className="text-red-600 text-sm">
          Too many attempts. Please wait {Math.ceil(resetIn / 60000)} minutes.
        </div>
      )}
      {!isLimited && remaining < 3 && (
        <div className="text-yellow-600 text-sm">
          {remaining} attempts remaining
        </div>
      )}
      <button type="submit" disabled={isLimited}>
        Login
      </button>
    </form>
  );
};
```

---

### Fix #4: Input Validation with Zod

#### Create Validation Schemas
**File:** `/utils/validation.ts`

```typescript
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Password validation regex
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

/**
 * Auth schemas
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Content schemas
 */
export const articleSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title too long'),
  slug: z.string()
    .min(5, 'Slug too short')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  excerpt: z.string()
    .min(50, 'Excerpt must be at least 50 characters')
    .max(500, 'Excerpt too long'),
  content: z.string()
    .min(100, 'Content must be at least 100 characters')
    .max(50000, 'Content too long'),
  category: z.enum([
    'finance', 'tech', 'policy', 'investment', 'blockchain',
    'defi', 'nfts', 'gaming', 'exchanges', 'startups', 'web3-ai', 'security-hacks'
  ]),
  tags: z.array(z.string()).max(10, 'Too many tags'),
  featured: z.boolean(),
  published: z.boolean(),
});

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .slice(0, 1000); // Limit length
}

/**
 * Validate and sanitize form data
 */
export function validateAndSanitize<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(e => e.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}
```

#### Use in Forms
**Example:** `/pages/LoginPage.tsx`

```typescript
import { loginSchema, validateAndSanitize } from '../utils/validation';

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validate input
  const result = validateAndSanitize(loginSchema, { email, password });

  if (!result.success) {
    setErrors(result.errors);
    return;
  }

  // Proceed with validated data
  try {
    await login(result.data.email, result.data.password);
  } catch (error) {
    // ... handle error
  }
};
```

---

### Fix #5: Secure LocalStorage with Encryption

#### Create Secure Storage Utility
**File:** `/utils/secureStorage.ts`

```typescript
import CryptoJS from 'crypto-js';

// Use environment variable in production
const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-key-change-in-production';

export class SecureStorage {
  /**
   * Encrypt and store data
   */
  static set(key: string, value: any): void {
    try {
      const json = JSON.stringify(value);
      const encrypted = CryptoJS.AES.encrypt(json, ENCRYPTION_KEY).toString();
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to encrypt data:', error);
    }
  }

  /**
   * Retrieve and decrypt data
   */
  static get<T = any>(key: string): T | null {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const json = decrypted.toString(CryptoJS.enc.Utf8);
      return JSON.parse(json) as T;
    } catch (error) {
      console.error('Failed to decrypt data:', error);
      return null;
    }
  }

  /**
   * Remove data
   */
  static remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all encrypted data
   */
  static clear(): void {
    localStorage.clear();
  }

  /**
   * Check if key exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

/**
 * Migrate existing localStorage to encrypted storage
 */
export function migrateToSecureStorage() {
  const keys = [
    'cryplounge_user',
    'cryplounge_xp',
    'cryplounge_xp_transactions',
    'cryplounge_completed_lessons',
    'cryplounge_enrolled_courses',
    'cryplounge_completed_courses',
    'admin_token',
  ];

  keys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value && !value.startsWith('U2FsdGVk')) { // Check if not already encrypted
      try {
        const parsed = JSON.parse(value);
        SecureStorage.set(key, parsed);
      } catch {
        // If not JSON, store as string
        SecureStorage.set(key, value);
      }
    }
  });
}
```

#### Update AuthContext to use SecureStorage
**File:** `/contexts/AuthContext.tsx` (modifications)

```typescript
import { SecureStorage } from '../utils/secureStorage';

// Replace localStorage with SecureStorage
useEffect(() => {
  const storedUser = SecureStorage.get('cryplounge_user');
  if (storedUser) {
    setUser(storedUser);
  }
  setIsLoading(false);
}, []);

useEffect(() => {
  if (user) {
    SecureStorage.set('cryplounge_user', user);
  } else {
    SecureStorage.remove('cryplounge_user');
  }
}, [user]);
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Day 1 (Hours 1-8)
- [ ] Implement JWT authentication (`adminAuth.ts`)
- [ ] Update AdminLoginPage with JWT
- [ ] Protect admin routes in App.tsx
- [ ] Add CSRF protection utility
- [ ] Update all admin forms with CSRF tokens

### Day 1 (Hours 9-16)
- [ ] Implement rate limiting utility
- [ ] Add rate limiting to login/signup
- [ ] Add rate limiting to password reset
- [ ] Create validation schemas with Zod
- [ ] Update all forms with validation

### Day 2 (Hours 1-8)
- [ ] Implement secure storage with encryption
- [ ] Migrate all localStorage usage to SecureStorage
- [ ] Update AuthContext
- [ ] Update XPContext
- [ ] Test all auth flows

### Day 2 (Hours 9-16)
- [ ] Add error logging (Sentry integration)
- [ ] Add session timeout mechanism
- [ ] Implement CSP headers
- [ ] Full security testing
- [ ] Documentation update

---

## 🧪 TESTING CHECKLIST

### Security Tests
- [ ] Verify JWT tokens expire correctly
- [ ] Test rate limiting with multiple attempts
- [ ] Verify CSRF protection blocks invalid requests
- [ ] Test input validation with malicious inputs
- [ ] Verify encrypted storage cannot be read
- [ ] Test session timeout mechanism
- [ ] Verify admin routes are protected

### Integration Tests
- [ ] Test login flow end-to-end
- [ ] Test admin authentication flow
- [ ] Test XP system with encrypted storage
- [ ] Test course enrollment with validation
- [ ] Test form submissions with CSRF

---

## 📦 DEPENDENCIES TO ADD

```json
{
  "dependencies": {
    "jose": "^5.1.0",
    "crypto-js": "^4.2.0",
    "zod": "^3.22.4",
    "isomorphic-dompurify": "^2.9.0"
  },
  "devDependencies": {
    "@types/crypto-js": "^4.2.1"
  }
}
```

Install with:
```bash
npm install jose crypto-js zod isomorphic-dompurify
npm install -D @types/crypto-js
```

---

## 🚀 DEPLOYMENT NOTES

### Environment Variables Required
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key-min-32-chars
CSRF_SECRET=your-csrf-secret-key
```

### Production Checklist
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Generate strong ENCRYPTION_KEY (32+ characters)
- [ ] Set secure cookie flags (httpOnly, secure, sameSite)
- [ ] Enable HTTPS only
- [ ] Configure CSP headers
- [ ] Set up error monitoring
- [ ] Configure rate limiting per IP
- [ ] Enable audit logging

---

**Status:** Ready for Implementation  
**Priority:** 🔴 CRITICAL  
**Timeline:** 48 hours  
**Team:** 2 developers minimum

