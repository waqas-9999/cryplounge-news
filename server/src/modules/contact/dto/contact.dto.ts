import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/** Public, unauthenticated submission from the Contact Us form. */
export class SubmitContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsEmail()
  @MaxLength(200)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  subject!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  message!: string;
}

export class ContactQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by read/unread' })
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}
