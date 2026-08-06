import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
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

/**
 * Public, unauthenticated submission. No `status`/`slug`/`featured` — the
 * server always forces `PENDING` so nothing goes live without an editor.
 */
export class SubmitProjectDto {
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

  @ApiProperty({ description: 'What the project does and for whom' })
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

  @ApiProperty({ description: 'Emoji mark used until a logo asset exists', example: '🦄' })
  @IsString()
  @MinLength(1)
  @MaxLength(8)
  logo!: string;

  @ApiPropertyOptional({ example: '#FF007A' })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Must be a hex colour, e.g. #FF007A' })
  accent?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() logoImageId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverImageId?: string;

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

  @ApiProperty({ description: 'Submitter contact name' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  submittedByName!: string;

  @ApiProperty({ description: 'Submitter contact email, for follow-up' })
  @IsEmail()
  submittedByEmail!: string;
}
