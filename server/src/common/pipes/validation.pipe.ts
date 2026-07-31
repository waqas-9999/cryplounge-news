import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';

/**
 * Application-wide validation.
 *
 * `whitelist` + `forbidNonWhitelisted` mean a request carrying fields the DTO
 * does not declare is rejected rather than silently ignored — that is what
 * stops mass-assignment, where a client sets `role: SUPER_ADMIN` on a profile
 * update and the ORM happily persists it.
 */
export function buildValidationPipe(options: ValidationPipeOptions = {}): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    stopAtFirstError: false,
    exceptionFactory: (errors: ValidationError[]) =>
      new BadRequestException({
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        errors: flatten(errors),
      }),
    ...options,
  });
}

/** Collapses nested validation errors into `{ "seo.title": ["..."] }`. */
function flatten(errors: ValidationError[], parent = ''): Record<string, string[]> {
  return errors.reduce<Record<string, string[]>>((acc, error) => {
    const path = parent ? `${parent}.${error.property}` : error.property;

    if (error.constraints) {
      acc[path] = Object.values(error.constraints);
    }
    if (error.children?.length) {
      Object.assign(acc, flatten(error.children, path));
    }
    return acc;
  }, {});
}
