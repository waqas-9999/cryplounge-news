import { z } from 'zod';

/**
 * Environment contract.
 *
 * Validated once at startup. If anything is missing or malformed the process
 * exits immediately rather than failing later on the first request that
 * happens to need the value — a misconfigured deploy should never accept
 * traffic.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),

  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string'),

  // Access tokens are short-lived; refresh tokens rotate on every use.
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),

  /** Comma-separated origins allowed to call the API. */
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  /**
   * Origin the backend is publicly reachable at, used to turn a locally
   * stored file's relative path into an absolute URL a browser can load.
   * Irrelevant on the `cloudinary` provider, which already returns absolute
   * URLs.
   */
  API_PUBLIC_URL: z.string().url().optional(),

  /** Absolute or relative path for local file storage. */
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),

  /**
   * Which StorageProvider MediaModule binds to. Left unset, it defaults to
   * `cloudinary` when `VERCEL` is set (the function filesystem is read-only
   * and ephemeral) and `local` otherwise.
   */
  STORAGE_PROVIDER: z.enum(['local', 'cloudinary']).optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  /** Public base URL of the frontend, used to build canonical URLs. */
  FRONTEND_URL: z.string().url().default('https://cryplounge-news-two.vercel.app'),
  /** Shared secret for the cache revalidation webhook the frontend exposes. */
  REVALIDATE_SECRET: z.string().min(16).optional(),

  THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),

  /**
   * Outbound mail (SMTP). Entirely optional: with `SMTP_HOST` unset the mail
   * service is inert and the features that use it degrade quietly rather than
   * erroring — a contact message is still stored, it just isn't emailed.
   *
   * Credentials live here rather than in the database so that a password is
   * never readable through an admin screen or a database dump.
   */
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  /** Force TLS-on-connect. Defaults to true for port 465, false otherwise. */
  SMTP_SECURE: z.enum(['true', 'false']).optional(),
  /**
   * Verify the SMTP server certificate. Defaults to true (strict). Set to
   * "false" only behind a TLS-intercepting proxy/firewall where the local
   * network presents its own certificate — production should keep it strict.
   */
  SMTP_REJECT_UNAUTHORIZED: z.enum(['true', 'false']).optional(),
  /** Envelope sender. Must be an address the SMTP account is allowed to send as. */
  MAIL_FROM: z.string().email().optional(),
  MAIL_FROM_NAME: z.string().default('CrypLounge'),
  /** Comma-separated staff addresses that receive contact-form notifications. */
  CONTACT_NOTIFY_EMAILS: z.string().optional(),

  SWAGGER_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform(value => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Nest calls this through `ConfigModule.forRoot({ validate })`. Throwing here
 * aborts bootstrap.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const details = result.error.issues
      .map(issue => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }

  // Secrets that are merely long enough but obviously placeholder values are
  // still a production incident waiting to happen.
  if (result.data.NODE_ENV === 'production') {
    const weak = ['change-me', 'changeme', 'secret', 'password', 'replace-me'];
    for (const [key, value] of Object.entries({
      JWT_ACCESS_SECRET: result.data.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: result.data.JWT_REFRESH_SECRET,
    })) {
      if (weak.some(w => value.toLowerCase().includes(w))) {
        throw new Error(`${key} looks like a placeholder. Generate a real secret before deploying.`);
      }
    }
    if (result.data.JWT_ACCESS_SECRET === result.data.JWT_REFRESH_SECRET) {
      throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must differ.');
    }
  }

  // Same fail-fast principle as the JWT secrets above: a deploy that will
  // resolve to the Cloudinary provider but is missing credentials should
  // never accept traffic, rather than 500 on the first upload.
  const resolvedProvider = result.data.STORAGE_PROVIDER ?? (process.env.VERCEL ? 'cloudinary' : 'local');
  if (resolvedProvider === 'cloudinary') {
    const missing = (['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'] as const).filter(
      key => !result.data[key]
    );
    if (missing.length > 0) {
      throw new Error(`Cloudinary storage is selected but missing: ${missing.join(', ')}`);
    }
  }

  // Mail is optional, but a half-configured transport is worse than none: it
  // looks enabled and fails on every send. Either configure it or leave it out.
  if (result.data.SMTP_HOST) {
    const missing = (['SMTP_USER', 'SMTP_PASSWORD', 'MAIL_FROM'] as const).filter(
      key => !result.data[key]
    );
    if (missing.length > 0) {
      throw new Error(`SMTP_HOST is set but mail is incomplete, missing: ${missing.join(', ')}`);
    }
  }

  return result.data;
}
