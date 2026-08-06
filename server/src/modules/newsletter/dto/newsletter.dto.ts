import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { NewsletterStatus } from '@prisma/client';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/** Public, unauthenticated subscription from the newsletter forms. */
export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'reader@example.com' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(200)
  email!: string;

  @ApiPropertyOptional({ example: 'Ada', description: 'Optional first name' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;
}

/** Admin update — currently only the subscription status is mutable. */
export class UpdateNewsletterDto {
  @ApiPropertyOptional({ enum: NewsletterStatus, enumName: 'NewsletterStatus' })
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus;
}

export class NewsletterQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: NewsletterStatus, description: 'Filter by subscription status' })
  @IsOptional()
  @IsEnum(NewsletterStatus)
  status?: NewsletterStatus;
}
