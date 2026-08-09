import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContentStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

/** Pages don't use review/scheduling — just draft and published. */
export const PAGE_STATUSES = [ContentStatus.DRAFT, ContentStatus.PUBLISHED] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export class CreateLegalPageDto {
  @ApiProperty({ example: 'Terms of Service' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @ApiPropertyOptional({ description: 'Derived from the title when left blank' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  slug?: string;

  @ApiProperty({ description: 'Sanitized HTML' })
  @IsString()
  content!: string;

  @ApiPropertyOptional({ enum: PAGE_STATUSES, default: ContentStatus.DRAFT })
  @IsOptional()
  @IsEnum(PAGE_STATUSES)
  status?: PageStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  seoTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  seoDescription?: string;
}

export class UpdateLegalPageDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(160) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
  @ApiPropertyOptional({ enum: PAGE_STATUSES })
  @IsOptional()
  @IsEnum(PAGE_STATUSES)
  status?: PageStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(400) seoDescription?: string;
}
