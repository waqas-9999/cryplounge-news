import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

/**
 * Public, unauthenticated story submission. No `status`/`slug`/`featured` —
 * the server always forces `REVIEW` so nothing goes live without an editor.
 */
export class SubmitFounderDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Founder & CEO' })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  role!: string;

  @ApiPropertyOptional({ description: 'Project or company' })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  company?: string;

  @ApiProperty({ description: 'Full story' })
  @IsString()
  @MinLength(1)
  bio!: string;

  @ApiProperty({ description: 'Short standfirst shown on cards' })
  @IsString()
  @MinLength(1)
  @MaxLength(600)
  excerpt!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() photoId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() website?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() x?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedin?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() github?: string;

  @ApiPropertyOptional({ example: 'Asia-Pacific' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiProperty({ description: 'Submitter contact name' })
  @IsString()
  @MinLength(1)
  submittedByName!: string;

  @ApiProperty({ description: 'Submitter contact email, for follow-up' })
  @IsEmail()
  submittedByEmail!: string;
}
