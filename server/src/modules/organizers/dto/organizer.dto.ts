import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class CreateOrganizerDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() logoId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) contactPerson?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() contactEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) telegramUsername?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() telegramChannel?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() x?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedin?: string;

  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean() verified?: boolean;
}

export class UpdateOrganizerDto extends PartialType(CreateOrganizerDto) {}

export class OrganizerQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}
