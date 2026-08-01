import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateAuthorDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl() avatarUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() @MaxLength(200) email?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() x?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() website?: string;
}

export class UpdateAuthorDto extends PartialType(CreateAuthorDto) {}
