import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CategoryKind } from '@prisma/client';
import {
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** Shared slug rule: lowercase words joined by single hyphens. */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MESSAGE = 'Must be lowercase words separated by single hyphens';

export class CreateCategoryDto {
  @ApiProperty({ enum: CategoryKind, description: 'Which content type this category belongs to' })
  @IsEnum(CategoryKind)
  kind!: CategoryKind;

  @ApiProperty({ example: 'market-analysis' })
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(120)
  slug!: string;

  @ApiProperty({ example: 'Market Analysis' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ default: 0, description: 'Manual ordering in menus and pickers' })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}

export class CreateTagDto {
  @ApiProperty({ example: 'layer-2' })
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(80)
  slug!: string;

  @ApiProperty({ example: 'Layer 2' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;
}

export class UpdateTagDto extends PartialType(CreateTagDto) {}

export class MergeTagsDto {
  @ApiProperty({ description: 'Tag absorbed into the target, then deleted' })
  @IsString()
  sourceId!: string;

  @ApiProperty({ description: 'Tag that survives and inherits the content' })
  @IsString()
  targetId!: string;
}

export class CreateLabelDto {
  @ApiProperty({ example: 'breaking' })
  @IsString()
  @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE })
  @MaxLength(60)
  slug!: string;

  @ApiProperty({ example: 'Breaking' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  name!: string;

  @ApiPropertyOptional({ example: '#EFB81A' })
  @IsOptional()
  @IsHexColor()
  color?: string;
}

export class UpdateLabelDto extends PartialType(CreateLabelDto) {}
