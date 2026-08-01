import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpsertSettingDto {
  @ApiProperty({ example: 'brand.name' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/, {
    message: 'Key must be lowercase, dot- or hyphen-separated',
  })
  @MaxLength(120)
  key!: string;

  @ApiProperty({
    description: 'Any JSON value',
    example: { value: 'CrypLounge' },
  })
  value!: unknown;
}

export class UpdateHomepageSectionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Section-specific options, e.g. { "limit": 8 }' })
  @IsOptional()
  @IsObject()
  config?: Record<string, unknown>;
}

export class ReorderItemDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  position!: number;
}

export class ReorderDto {
  @ApiProperty({ type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items!: ReorderItemDto[];
}

export class CreateNavigationItemDto {
  @ApiProperty({ enum: ['header', 'footer'] })
  @IsString()
  @Matches(/^(header|footer)$/, { message: 'Location must be header or footer' })
  location!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  label!: string;

  @ApiProperty({ example: '/news/market' })
  @IsString()
  @MaxLength(300)
  href!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({ description: 'Parent item id, for a dropdown entry' })
  @IsOptional()
  @IsString()
  parentId?: string;
}

export class UpdateNavigationItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(80) label?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) href?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) position?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() parentId?: string | null;
}
