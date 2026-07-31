import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { ApiErrorResponse } from '../dto/api-response.dto';

/**
 * The single place an error becomes an HTTP response.
 *
 * Two rules it exists to enforce:
 *  1. Every error has the same JSON shape.
 *  2. Nothing internal leaks — no stack traces, no SQL, no Prisma message, no
 *     environment detail. Unexpected errors are logged in full server-side and
 *     reported to the client as a bare 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, code, errors } = this.translate(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception)
      );
    } else if (status === HttpStatus.UNAUTHORIZED || status === HttpStatus.FORBIDDEN) {
      this.logger.warn(`${request.method} ${request.url} -> ${status} ${code}`);
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      code,
      ...(errors ? { errors } : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private translate(exception: unknown): {
    status: number;
    message: string;
    code: string;
    errors?: Record<string, string[]>;
  } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return { status, message: payload, code: this.codeFor(status) };
      }

      const record = payload as {
        message?: string | string[];
        code?: string;
        errors?: Record<string, string[]>;
      };

      // ValidationPipe hands us an array of messages.
      const message = Array.isArray(record.message)
        ? 'Validation failed'
        : (record.message ?? exception.message);

      return {
        status,
        message,
        code: record.code ?? this.codeFor(status),
        errors: record.errors,
      };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.translatePrisma(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      // The message embeds the query shape; never forward it.
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid request',
        code: 'INVALID_REQUEST',
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }

  /** Maps Prisma error codes to safe, actionable client messages. */
  private translatePrisma(error: Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        const target = error.meta?.target;
        const field = Array.isArray(target) ? target.join(', ') : String(target ?? 'value');
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${field} already exists`,
          code: 'DUPLICATE_ENTRY',
        };
      }
      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          code: 'NOT_FOUND',
        };
      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Referenced record does not exist',
          code: 'INVALID_REFERENCE',
        };
      case 'P2014':
        return {
          status: HttpStatus.CONFLICT,
          message: 'This record is still referenced by other records',
          code: 'REFERENCE_CONSTRAINT',
        };
      default:
        this.logger.error(`Unmapped Prisma error ${error.code}`, error.message);
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
        };
    }
  }

  private codeFor(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'VALIDATION_ERROR',
      429: 'RATE_LIMITED',
      500: 'INTERNAL_ERROR',
    };
    return map[status] ?? 'ERROR';
  }
}
