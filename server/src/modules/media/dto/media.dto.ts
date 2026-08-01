import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

export class UploadMediaDto {
  @ApiPropertyOptional({
    description: 'Logical folder. Letters, numbers, hyphen and underscore only.',
    example: 'articles',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Folder may contain letters, numbers, - and _ only' })
  @MaxLength(60)
  folder?: string;

  @ApiPropertyOptional({ description: 'Accessible description of the image' })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;
}

export class UpdateMediaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: 'Folder may contain letters, numbers, - and _ only' })
  @MaxLength(60)
  folder?: string;
}

export class MediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({ description: 'Prefix match, e.g. "image/"' })
  @IsOptional()
  @IsString()
  mimeType?: string;
}
