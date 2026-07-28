/**
 * Input Validation and Sanitization Utilities
 * Protects against XSS, injection attacks, and invalid data
 */

import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Simple HTML sanitizer, used only if DOMPurify throws
function simpleSanitize(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe/gi, '&lt;iframe')
    .replace(/<object/gi, '&lt;object')
    .replace(/<embed/gi, '&lt;embed');
}

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
    .trim()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

export const signupSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(passwordRegex, 'Password must contain uppercase, lowercase, number, and special character'),
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase(),
});

export const adminLoginSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email too long')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long'),
});

/**
 * Content schemas
 */
export const articleSchema = z.object({
  title: z.string()
    .trim()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title too long'),
  slug: z.string()
    .trim()
    .min(5, 'Slug too short')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format (use lowercase letters, numbers, and hyphens)'),
  excerpt: z.string()
    .trim()
    .min(50, 'Excerpt must be at least 50 characters')
    .max(500, 'Excerpt too long'),
  content: z.string()
    .trim()
    .min(100, 'Content must be at least 100 characters')
    .max(50000, 'Content too long'),
  category: z.enum([
    'finance', 'tech', 'policy', 'investment', 'blockchain',
    'defi', 'nfts', 'gaming', 'exchanges', 'startups', 'web3-ai', 'security-hacks'
  ]),
  tags: z.array(z.string().trim().min(2).max(30)).max(10, 'Too many tags'),
  featured: z.boolean(),
  published: z.boolean(),
});

export const eventSchema = z.object({
  name: z.string()
    .trim()
    .min(5, 'Event name must be at least 5 characters')
    .max(200, 'Event name too long'),
  slug: z.string()
    .trim()
    .min(5, 'Slug too short')
    .max(200, 'Slug too long')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format'),
  description: z.string()
    .trim()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description too long'),
  category: z.enum(['Conference', 'Hackathon', 'Webinar', 'Meetup', 'Workshop']),
  date: z.string().min(1, 'Date is required'),
  location: z.string().trim().min(3, 'Location required').max(200),
});

export const founderSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  title: z.string()
    .trim()
    .min(2, 'Title required')
    .max(100, 'Title too long'),
  company: z.string()
    .trim()
    .min(2, 'Company name required')
    .max(100, 'Company name too long'),
  bio: z.string()
    .trim()
    .min(50, 'Bio must be at least 50 characters')
    .max(5000, 'Bio too long'),
});

export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email too long'),
  subject: z.string()
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject too long'),
  message: z.string()
    .trim()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message too long'),
});

/**
 * Sanitize HTML content
 */
export function sanitizeHTML(dirty: string): string {
  try {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'img'
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title'],
      ALLOW_DATA_ATTR: false,
    });
  } catch {
    // Fallback to simple sanitization
    return simpleSanitize(dirty);
  }
}

/**
 * Sanitize user input (remove dangerous characters)
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers (onclick, onload, etc.)
    .slice(0, 10000); // Limit length
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
      // Zod v4 renamed `ZodError.errors` to `.issues`.
      const errors = error.issues?.map(e => {
        // Clean error message format - remove field path for single field errors
        if (e.path.length === 1) {
          return `${e.message}`;
        }
        return `${e.path.join('.')}: ${e.message}`;
      }) || ['Validation failed'];
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHTML(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate URL
 */
export function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generate safe slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] } = options;

  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${maxSize / 1024 / 1024}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }

  return { valid: true };
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .slice(0, 255); // Limit length
}
