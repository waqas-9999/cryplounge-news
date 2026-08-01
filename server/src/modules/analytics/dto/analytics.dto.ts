import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

/** The content types views are tracked against. Kept in sync with ViewCount's comment in schema.prisma. */
export const TRACKED_ENTITIES = [
  'Article',
  'Project',
  'Research',
  'Regulation',
  'Event',
  'Founder',
] as const;

export type TrackedEntity = (typeof TRACKED_ENTITIES)[number];

export class RecordViewDto {
  @ApiProperty({ enum: TRACKED_ENTITIES })
  @IsIn(TRACKED_ENTITIES)
  entity!: TrackedEntity;

  @ApiProperty()
  @IsString()
  @MaxLength(60)
  entityId!: string;
}

export class AnalyticsRangeQueryDto {
  @ApiPropertyOptional({ description: 'Inclusive lower bound; defaults to 30 days ago' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  from?: Date;

  @ApiPropertyOptional({ description: 'Inclusive upper bound; defaults to now' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  to?: Date;

  @ApiPropertyOptional({ enum: TRACKED_ENTITIES })
  @IsOptional()
  @IsEnum(TRACKED_ENTITIES)
  entity?: TrackedEntity;
}

export class TopContentQueryDto extends AnalyticsRangeQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  limit?: number;
}
