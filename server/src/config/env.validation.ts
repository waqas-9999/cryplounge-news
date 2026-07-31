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

  /** Absolute or relative path for local file storage. */
  UPLOAD_DIR: z.string().default('./uploads'),
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),

  /** Public base URL of the frontend, used to build canonical URLs. */
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  /** Shared secret for the cache revalidation webhook the frontend exposes. */
  REVALIDATE_SECRET: z.string().min(16).optional(),

  THROTTLE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),

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

  return result.data;
}
