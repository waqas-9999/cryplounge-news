import { registerAs } from '@nestjs/config';
import type { Env } from './env.validation';

/**
 * Typed configuration namespaces.
 *
 * Services inject these rather than reading `process.env` directly, so every
 * consumer sees the same parsed, validated values and nothing depends on the
 * raw environment at call time.
 */

export const appConfig = registerAs('app', () => {
  const env = process.env as unknown as Env;
  return {
    env: env.NODE_ENV,
    port: Number(env.PORT ?? 4000),
    isProduction: env.NODE_ENV === 'production',
    frontendUrl: env.FRONTEND_URL,
    revalidateSecret: env.REVALIDATE_SECRET,
    corsOrigins: String(env.CORS_ORIGINS ?? '')
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean),
    swaggerEnabled: String(env.SWAGGER_ENABLED) === 'true',
  };
});

export const authConfig = registerAs('auth', () => {
  const env = process.env as unknown as Env;
  return {
    accessSecret: env.JWT_ACCESS_SECRET,
    refreshSecret: env.JWT_REFRESH_SECRET,
    accessTtl: env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: env.JWT_REFRESH_TTL ?? '7d',
  };
});

export const mailConfig = registerAs('mail', () => {
  const env = process.env as unknown as Env;
  const port = Number(env.SMTP_PORT ?? 587);

  return {
    /** Everything downstream branches on this rather than probing for a host. */
    enabled: Boolean(env.SMTP_HOST),
    host: env.SMTP_HOST,
    port,
    // Port 465 is implicit TLS; 587 and 25 negotiate STARTTLS after connecting.
    secure: env.SMTP_SECURE ? String(env.SMTP_SECURE) === 'true' : port === 465,
    // Strict certificate verification by default. Only disable behind a
    // TLS-intercepting proxy, where the local chain is what fails.
    rejectUnauthorized: env.SMTP_REJECT_UNAUTHORIZED
      ? String(env.SMTP_REJECT_UNAUTHORIZED) === 'true'
      : true,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.MAIL_FROM,
    fromName: env.MAIL_FROM_NAME ?? 'CrypLounge',
    contactRecipients: String(env.CONTACT_NOTIFY_EMAILS ?? '')
      .split(',')
      .map(address => address.trim())
      .filter(Boolean),
  };
});

export const storageConfig = registerAs('storage', () => {
  const env = process.env as unknown as Env;
  return {
    /**
     * `local` writes to `uploadDir` on disk; `cloudinary` uploads to
     * Cloudinary and stores its public ID as `Media.path`. Defaults to
     * `cloudinary` on Vercel (the function filesystem can't hold uploads
     * between invocations) and `local` everywhere else.
     */
    provider: env.STORAGE_PROVIDER ?? (process.env.VERCEL ? 'cloudinary' : 'local'),
    uploadDir: env.UPLOAD_DIR ?? './uploads',
    maxBytes: Number(env.UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024),
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },
    /**
     * Raster formats only.
     *
     * SVG is deliberately excluded: it is XML that may contain <script>, and
     * serving user-uploaded SVG from the site's own origin is a stored-XSS
     * vector. Re-adding it requires sanitising the markup on upload, not just
     * widening this list.
     */
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'image/gif',
    ] as const,
  };
});

export const throttleConfig = registerAs('throttle', () => {
  const env = process.env as unknown as Env;
  return {
    ttlSeconds: Number(env.THROTTLE_TTL_SECONDS ?? 60),
    limit: Number(env.THROTTLE_LIMIT ?? 120),
  };
});

export const configNamespaces = [appConfig, authConfig, storageConfig, throttleConfig, mailConfig];
