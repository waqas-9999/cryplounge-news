import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class CreateResearchDto {
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

  @ApiProperty({ description: 'Overview shown above the report' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  summary!: string;

  @ApiProperty({ description: 'Full report body' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Source list rendered as the References block',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];

  @ApiPropertyOptional({ enum: ContentStatus, default: ContentStatus.DRAFT })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() authorId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverImageId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiPropertyOptional({ type: [String] })
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

export class UpdateResearchDto extends PartialType(CreateResearchDto) {}

export class ResearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ContentStatus, description: 'Admin only' })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;

  @ApiPropertyOptional({ description: 'Category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Tag slug' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;
}
