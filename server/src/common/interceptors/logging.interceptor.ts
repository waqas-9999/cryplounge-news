import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { tap, type Observable } from 'rxjs';

/**
 * One line per request. Deliberately terse: method, path, status, duration.
 *
 * Bodies are never logged — they carry passwords, tokens and draft content.
 * Slow requests are raised to `warn` so they surface without a separate tool.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private static readonly SLOW_MS = 1_000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.write(request, http.getResponse<Response>().statusCode, started),
        // Errors are logged by the exception filter, which knows the status.
        error: () => undefined,
      })
    );
  }

  private write(request: Request, status: number, started: number): void {
    const duration = Date.now() - started;
    const line = `${request.method} ${request.originalUrl} ${status} ${duration}ms`;

    if (duration >= LoggingInterceptor.SLOW_MS) {
      this.logger.warn(`${line} (slow)`);
    } else {
      this.logger.log(line);
    }
  }
}
