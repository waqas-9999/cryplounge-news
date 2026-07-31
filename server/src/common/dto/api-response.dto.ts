import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * The single response envelope for every endpoint.
 *
 * One shape means clients write one parser. Handlers return plain data; the
 * TransformInterceptor wraps it, so no controller builds this by hand.
 */
export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  perPage!: number;

  @ApiProperty({ example: 137 })
  total!: number;

  @ApiProperty({ example: 7 })
  totalPages!: number;

  @ApiProperty({ example: true })
  hasNext!: boolean;

  @ApiProperty({ example: false })
  hasPrevious!: boolean;
}

export class ApiSuccessResponse<T> {
  @ApiProperty({ example: true })
  success!: true;

  @ApiProperty({ example: 200 })
  statusCode!: number;

  @ApiProperty({ example: 'OK' })
  message!: string;

  @ApiProperty()
  data!: T;

  @ApiPropertyOptional({ type: PaginationMeta })
  pagination?: PaginationMeta;

  @ApiProperty({ example: '2026-07-31T09:15:00.000Z' })
  timestamp!: string;
}

export class ApiErrorResponse {
  @ApiProperty({ example: false })
  success!: false;

  @ApiProperty({ example: 422 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code!: string;

  @ApiPropertyOptional({
    description: 'Field-level detail. Present for validation errors only.',
    example: { title: ['title should not be empty'] },
  })
  errors?: Record<string, string[]>;

  @ApiProperty({ example: '/api/v1/articles' })
  path!: string;

  @ApiProperty({ example: '2026-07-31T09:15:00.000Z' })
  timestamp!: string;
}

/**
 * Marker returned by services that paginate. The interceptor lifts
 * `pagination` to the envelope's top level and unwraps `items` into `data`.
 */
export class Paginated<T> {
  constructor(
    readonly items: T[],
    readonly pagination: PaginationMeta
  ) {}

  static from<T>(items: T[], total: number, page: number, perPage: number): Paginated<T> {
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    return new Paginated(items, {
      page,
      perPage,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    });
  }
}
