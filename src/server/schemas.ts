import { z } from 'zod';

/**
 * Request validation schemas.
 *
 * Shared between Route Handlers and admin forms so the client validates
 * against exactly what the server enforces.
 */

export const ContentStatusEnum = z.enum([
  'DRAFT',
  'REVIEW',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED',
]);

/** Lowercase, hyphenated, no leading/trailing hyphen. This becomes a URL. */
export const slugSchema = z
  .string()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Must be lowercase words separated by hyphens');

export const ArticleCreateInput = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(300),
  summary: z.string().min(1).max(2000),
  content: z.string().min(1),
  status: ContentStatusEnum.default('DRAFT'),
  publishedAt: z.coerce.date().optional().nullable(),
  scheduledFor: z.coerce.date().optional().nullable(),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  priority: z.number().int().min(0).max(100).default(0),
  readMinutes: z.number().int().min(1).max(120).default(3),
  categoryId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  featuredImageId: z.string().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  projectIds: z.array(z.string()).default([]),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(400).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  noindex: z.boolean().default(false),
});

/** Every field optional — PATCH semantics. */
export const ArticleUpdateInput = ArticleCreateInput.partial();

export const ProjectCreateInput = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(120),
  tagline: z.string().min(1).max(200),
  about: z.string().min(1),
  keyFeatures: z.array(z.string()).default([]),
  categoryId: z.string().optional().nullable(),
  blockchain: z.string().min(1),
  supportedNetworks: z.array(z.string()).default([]),
  nativeToken: z.string().max(20).optional().nullable(),
  launchYear: z.number().int().min(2008).max(2100).optional().nullable(),
  status: z.enum(['LIVE', 'BETA', 'TESTNET', 'DEPRECATED']).default('LIVE'),
  verified: z.boolean().default(false),
  openSource: z.boolean().default(false),
  featured: z.boolean().default(false),
  editorsPick: z.boolean().default(false),
  logo: z.string().min(1).max(8),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex colour such as #EFB81A')
    .default('#EFB81A'),
  website: z.string().url().optional().nullable(),
  x: z.string().url().optional().nullable(),
  github: z.string().url().optional().nullable(),
  discord: z.string().url().optional().nullable(),
  telegram: z.string().url().optional().nullable(),
  linkedin: z.string().url().optional().nullable(),
  youtube: z.string().url().optional().nullable(),
  medium: z.string().url().optional().nullable(),
  blog: z.string().url().optional().nullable(),
  docs: z.string().url().optional().nullable(),
  whitepaper: z.string().url().optional().nullable(),
  explorer: z.string().url().optional().nullable(),
  api: z.string().url().optional().nullable(),
  tagIds: z.array(z.string()).default([]),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(400).optional().nullable(),
  noindex: z.boolean().default(false),
});

export const ProjectUpdateInput = ProjectCreateInput.partial();

export const UserCreateInput = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(120),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'VIEWER']),
});

export const UserUpdateInput = z.object({
  name: z.string().min(1).max(120).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'AUTHOR', 'MODERATOR', 'VIEWER']).optional(),
  isActive: z.boolean().optional(),
});

export const CategoryCreateInput = z.object({
  kind: z.enum(['NEWS', 'RESEARCH', 'REGULATION', 'PROJECT', 'EVENT', 'FOUNDER']),
  slug: slugSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  position: z.number().int().min(0).default(0),
});

export const TagCreateInput = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(80),
});
