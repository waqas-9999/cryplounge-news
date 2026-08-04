import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

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

export const EVENT_TYPES = [
  'page_view',
  'article_view',
  'article_scroll',
  'article_complete',
  'search',
  'category_view',
  'author_view',
  'event_view',
  'share',
  'bookmark',
  'comment',
  'signup',
  'login',
  'newsletter_signup',
  'external_link_click',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/** Granularity for the traffic time-series. */
export const TRAFFIC_GRANULARITIES = ['hourly', 'daily', 'weekly', 'monthly'] as const;
export type TrafficGranularity = (typeof TRAFFIC_GRANULARITIES)[number];

/** Reports that can be exported as CSV. */
export const EXPORT_REPORTS = [
  'overview',
  'traffic',
  'articles',
  'article-detail',
  'categories',
  'authors',
  'countries',
  'regions',
  'cities',
  'acquisition',
  'referrers',
  'social',
  'devices',
  'browsers',
  'operating-systems',
  'screen-resolutions',
  'languages',
  'behavior',
  'searches',
  'sessions',
] as const;

export type ExportReport = (typeof EXPORT_REPORTS)[number];

/** A single event recorded by the public tracking endpoint. */
export class TrackedEventDto {
  @ApiProperty({ enum: EVENT_TYPES })
  @IsIn(EVENT_TYPES)
  type!: EventType;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  sessionId!: string;

  @ApiPropertyOptional({ description: 'Hashed anonymous visitor id' })
  @IsOptional() @IsString() @MaxLength(120)
  visitorId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(512) path?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(512) referrer?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) region?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) deviceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) browser?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) os?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) screenResolution?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) language?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) entity?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) entityId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) authorId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(100)
  scrollDepth?: number;

  @ApiPropertyOptional({ description: 'Structured payload, e.g. share platform or search term' })
  @IsOptional() @IsObject()
  meta?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Client timestamp; defaults to now (server)' })
  @IsOptional() @Type(() => Date) @IsDate()
  timestamp?: Date;
}

export class TrackBatchDto {
  @ApiProperty({ type: [TrackedEventDto], description: 'Up to 50 events per call' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackedEventDto)
  events!: TrackedEventDto[];
}

/** Shared date-range + cross-cutting filters for every admin report. */
export class AnalyticsRangeQueryDto {
  @ApiPropertyOptional({ description: 'Inclusive lower bound; defaults to 30 days ago' })
  @IsOptional() @Type(() => Date) @IsDate() from?: Date;

  @ApiPropertyOptional({ description: 'Inclusive upper bound; defaults to now' })
  @IsOptional() @Type(() => Date) @IsDate() to?: Date;

  @ApiPropertyOptional({ enum: TRACKED_ENTITIES })
  @IsOptional() @IsEnum(TRACKED_ENTITIES) entity?: TrackedEntity;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) region?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) deviceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) browser?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(60) os?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) language?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) authorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) categoryId?: string;
}

export class TrafficQueryDto extends AnalyticsRangeQueryDto {
  @ApiPropertyOptional({ enum: TRAFFIC_GRANULARITIES, default: 'daily' })
  @IsOptional() @IsIn(TRAFFIC_GRANULARITIES) granularity?: TrafficGranularity;
}

export class TopContentQueryDto extends AnalyticsRangeQueryDto {
  @ApiPropertyOptional({ default: 10 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(50) limit?: number;
}

export class ArticleAnalyticsQueryDto extends AnalyticsRangeQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) perPage?: number;
  @ApiPropertyOptional({ description: 'Free-text search on article title' })
  @IsOptional() @IsString() @MaxLength(200) search?: string;
  @ApiPropertyOptional({ description: 'Sort column (views, readers, engagement, readTime, shares)' })
  @IsOptional() @IsString() @MaxLength(40) sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
}

export class SessionsQueryDto extends AnalyticsRangeQueryDto {
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) perPage?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(40) sortBy?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['asc', 'desc']) sortOrder?: 'asc' | 'desc';
  @ApiPropertyOptional({ description: 'Only sessions for this visitor id' })
  @IsOptional() @IsString() @MaxLength(120) visitorId?: string;
}

export class ExportQueryDto extends AnalyticsRangeQueryDto {
  @ApiProperty({ enum: EXPORT_REPORTS })
  @IsIn(EXPORT_REPORTS)
  type!: ExportReport;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) entityId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) authorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(128) categoryId?: string;
}