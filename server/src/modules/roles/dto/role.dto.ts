import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Unique, stable identifier. Upper snake case, e.g. CONTRIBUTOR.',
    example: 'CONTRIBUTOR',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'Key must be upper snake case, e.g. CONTRIBUTOR or REGIONAL_EDITOR',
  })
  key!: string;

  @ApiProperty({ description: 'Display name', example: 'Contributor' })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Initial permission grants; can be edited afterwards',
    example: ['content.write'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissionKeys?: string[];
}

export class UpdateRolePermissionsDto {
  @ApiProperty({
    type: [String],
    description: 'The complete set of permission keys for this role; replaces the current grants',
    example: ['news.read', 'news.create', 'news.update'],
  })
  @IsArray()
  @IsString({ each: true })
  permissionKeys!: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
