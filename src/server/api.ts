import 'server-only';

import { NextResponse } from 'next/server';
import { ZodError, type ZodSchema } from 'zod';
import { AuthError } from './auth';

/**
 * Shared plumbing for Route Handlers: one response envelope, one error
 * translation, one pagination contract. Handlers stay free of boilerplate and
 * cannot invent their own error shapes.
 */

export interface ApiErrorBody {
  error: { message: string; code: string; details?: unknown };
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function apiError(message: string, status: number, code: string, details?: unknown) {
  return NextResponse.json<ApiErrorBody>({ error: { message, code, details } }, { status });
}

/**
 * Wraps a handler so thrown errors become correct status codes.
 *
 * Unexpected errors are logged server-side and reported generically — internal
 * messages and stack traces must never reach the client.
 */
export function handle<Args extends unknown[]>(
  fn: (...args: Args) => Promise<Response>
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof AuthError) {
        return apiError(error.message, error.status, error.status === 401 ? 'unauthorized' : 'forbidden');
      }
      if (error instanceof ZodError) {
        return apiError('Validation failed', 422, 'validation_error', error.issues);
      }
      console.error('[api] unhandled error:', error);
      return apiError('Internal server error', 500, 'internal_error');
    }
  };
}

/** Parse and validate a JSON body, throwing ZodError on mismatch. */
export async function parseBody<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    throw new ZodError([
      { code: 'custom', message: 'Request body must be valid JSON', path: [] },
    ]);
  }
  return schema.parse(payload);
}

export interface PageParams {
  page: number;
  perPage: number;
  skip: number;
  take: number;
}

/** Read `?page=` and `?perPage=`, clamped to sane bounds. */
export function pageParams(request: Request, defaultPerPage = 20): PageParams {
  const url = new URL(request.url);
  const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
  const requested = Number.parseInt(url.searchParams.get('perPage') ?? '', 10) || defaultPerPage;
  const perPage = Math.min(Math.max(1, requested), 100);
  return { page, perPage, skip: (page - 1) * perPage, take: perPage };
}

export function paginated<T>(items: T[], total: number, params: PageParams) {
  return {
    items,
    pagination: {
      page: params.page,
      perPage: params.perPage,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.perPage)),
    },
  };
}

/** Client IP, honouring the proxy header Vercel and most CDNs set. */
export function clientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || undefined;
}
