import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsHexColor,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/** Every official link is optional and validated as a URL when present. */
class ProjectLinksDto {
  @ApiPropertyOptional() @IsOptional() @IsUrl() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() x?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() github?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() discord?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() telegram?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() youtube?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() medium?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() blog?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() docs?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() whitepaper?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() explorer?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() api?: string;
}

export class CreateProjectDto extends ProjectLinksDto {
  @ApiPropertyOptional({ description: 'Derived from the name when omitted' })
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
  @MaxLength(120)
  name!: string;

  @ApiProperty({ description: 'One line shown on cards' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  tagline!: string;

  @ApiProperty({ description: 'Editorial description: what it does and for whom' })
  @IsString()
  @MinLength(1)
  about!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyFeatures?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ example: 'ethereum' })
  @IsString()
  @MinLength(1)
  blockchain!: string;

  @ApiPropertyOptional({ type: [String], example: ['ethereum', 'base'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportedNetworks?: string[];

  @ApiPropertyOptional({ example: 'UNI' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  nativeToken?: string;

  @ApiPropertyOptional({ minimum: 2008 })
  @IsOptional()
  @IsInt()
  @Min(2008)
  @Max(2100)
  launchYear?: number;

  @ApiPropertyOptional({ enum: ProjectStatus, default: ProjectStatus.LIVE })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({ description: 'Editorially confirmed as the official project' })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  openSource?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'Curated for the Ecosystem homepage "Trending Projects" rail' })
  @IsOptional()
  @IsBoolean()
  trending?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  editorsPick?: boolean;

  @ApiProperty({ description: 'Emoji mark used until a logo asset exists', example: '🦄' })
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  logo!: string;

  @ApiPropertyOptional({ example: '#FF007A' })
  @IsOptional()
  @IsHexColor()
  accent?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() logoImageId?: string;
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
  articleIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  researchIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regulationIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventIds?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  founderIds?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(400) seoDescription?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() noindex?: boolean;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Category slug' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Matches any project supporting this chain' })
  @IsOptional()
  @IsString()
  network?: string;

  @ApiPropertyOptional({ description: 'Tag slug' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ enum: ProjectStatus })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  featured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  trending?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  editorsPick?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  verified?: boolean;
}
