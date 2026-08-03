import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventMode } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Public, unauthenticated submission. No `status`/`slug`/`featured` — the
 * server always forces `REVIEW` so nothing goes live without an editor.
 */
export class SubmitEventDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  summary!: string;

  @ApiProperty({ description: 'Full description and agenda' })
  @IsString()
  @MinLength(1)
  content!: string;

  @ApiProperty({ description: 'Start instant, in UTC' })
  @Type(() => Date)
  @IsDate()
  startsAt!: Date;

  @ApiPropertyOptional({ description: 'End instant, in UTC' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endsAt?: Date;

  @ApiPropertyOptional({ enum: EventMode, default: EventMode.OFFLINE })
  @IsOptional()
  @IsEnum(EventMode)
  mode?: EventMode;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) venue?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) city?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) country?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() onlineUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() registerUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() telegramChannel?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Free text, e.g. "$50" or "0.05 ETH"' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  ticketPrice?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bannerImageId?: string;

  @ApiProperty({ description: 'Organizer contact name' })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  submittedByName!: string;

  @ApiProperty({ description: 'Organizer contact email, for follow-up' })
  @IsEmail()
  submittedByEmail!: string;
}
