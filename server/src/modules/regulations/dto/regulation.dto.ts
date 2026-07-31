import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class CreateRegulationDto {
  @ApiPropertyOptional({ description: 'Derived from the title when omitted' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Must be lowercase words separated by single hyphens',
  })
  @MaxLength(160)
  slug?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @ApiProperty({ description: 'Plain-language summary of what changed' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  summary!: string;

  @ApiProperty({ description: 'Full detail' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({
    description: 'ISO 3166-1 alpha-2. Omit for supranational bodies such as the EU or G20.',
    example: 'US',
  })
  @IsOptional()
  @IsISO31661Alpha2({ message: 'Must be a two-letter ISO country code' })
  countryCode?: string;

  @ApiPropertyOptional({ example: 'United States' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  countryName?: string;

  @ApiPropertyOptional({ example: 'Europe' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Projects affected by this regulation' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  projectIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  articleIds?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(400) seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() noindex?: boolean;
}

export class UpdateRegulationDto extends PartialType(CreateRegulationDto) {}

export class RegulationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus, description: 'Admin only' })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  country?: string;

  @ApiPropertyOptional({ example: 'Europe' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'Tag slug' })
  @IsOptional()
  @IsString()
  tag?: string;
}
