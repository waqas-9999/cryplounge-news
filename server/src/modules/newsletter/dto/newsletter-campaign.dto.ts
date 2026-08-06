import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { NewsletterCampaignStatus, NewsletterRecipientType } from '@prisma/client';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

const CONTENT_MAX = 100_000;

/** Shared campaign fields, used by create and update. */
class CampaignFields {
  @ApiProperty({ example: 'Top Crypto & Technology News This Week' })
  @IsString()
  @MinLength(3, { message: 'Subject must be at least 3 characters' })
  @MaxLength(200)
  subject!: string;

  @ApiProperty({ example: 'This Week at Cryplounge' })
  @IsString()
  @MinLength(1, { message: 'Title must not be empty' })
  @MaxLength(200)
  title!: string;

  @ApiProperty({ description: 'Sanitized HTML body authored in the admin editor' })
  @IsString()
  @MinLength(1, { message: 'Content must not be empty' })
  @MaxLength(CONTENT_MAX)
  content!: string;

  @ApiPropertyOptional({ enum: NewsletterRecipientType })
  @IsOptional()
  @IsEnum(NewsletterRecipientType)
  recipientType?: NewsletterRecipientType;

  /** Emails chosen when recipientType = SELECTED. */
  @ApiPropertyOptional({ type: [String], description: 'Only when recipientType = SELECTED' })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10000)
  @IsEmail({}, { each: true, message: 'Contains an invalid email address' })
  recipientEmails?: string[];

  @ApiPropertyOptional({ example: 'Read the full report' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  ctaLabel?: string;

  @ApiPropertyOptional({ example: 'https://cryplounge-news-two.vercel.app/reports' })
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'CTA link must be a valid URL' })
  @MaxLength(2000)
  ctaUrl?: string;
}

/** Create a new draft campaign. Empty recipient lists are caught in the service. */
export class CreateNewsletterCampaignDto extends CampaignFields {}

/** Update a draft campaign. Only drafts are editable (the service enforces it). */
export class UpdateNewsletterCampaignDto {
  @ApiPropertyOptional({ example: 'Top Crypto & Technology News This Week' })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Subject must be at least 3 characters' })
  @MaxLength(200)
  subject?: string;

  @ApiPropertyOptional({ example: 'This Week at Cryplounge' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Sanitized HTML body authored in the admin editor' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(CONTENT_MAX)
  content?: string;

  @ApiPropertyOptional({ enum: NewsletterRecipientType })
  @IsOptional()
  @IsEnum(NewsletterRecipientType)
  recipientType?: NewsletterRecipientType;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10000)
  @IsEmail({}, { each: true })
  recipientEmails?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  ctaLabel?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'CTA link must be a valid URL' })
  @MaxLength(2000)
  ctaUrl?: string | null;
}

/** List campaigns, filterable by status. */
export class CampaignQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: NewsletterCampaignStatus })
  @IsOptional()
  @IsEnum(NewsletterCampaignStatus)
  status?: NewsletterCampaignStatus;
}

/** Address that receives the test send. */
export class TestCampaignDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(200)
  email!: string;
}

/** Public unsubscribe. The token is a signed value, never the row id. */
export class UnsubscribeNewsletterDto {
  @ApiProperty({ description: 'Signed unsubscribe token from the email link' })
  @IsString()
  @MinLength(8)
  @MaxLength(512)
  token!: string;
}
