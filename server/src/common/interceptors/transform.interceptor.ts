import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { map, type Observable } from 'rxjs';
import { Paginated } from '../dto/api-response.dto';
import { RESPONSE_MESSAGE } from '../decorators/response-message.decorator';

/**
 * Wraps every successful handler return value in the standard envelope.
 *
 * Controllers return domain data and nothing else — no envelope construction,
 * no status juggling — which is what keeps them thin.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const response = http.getResponse<Response>();

    const message =
      this.reflector.getAllAndOverride<string>(RESPONSE_MESSAGE, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'OK';

    return next.handle().pipe(
      map(payload => {
        const base = {
          success: true as const,
          statusCode: response.statusCode,
          message,
          timestamp: new Date().toISOString(),
        };

        if (payload instanceof Paginated) {
          return { ...base, data: payload.items, pagination: payload.pagination };
        }

        return { ...base, data: payload ?? null };
      })
    );
  }
}
