import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { WebhookEvent } from '@prisma/client';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @ApiPropertyOptional({ description: 'Scopes deliveries to one agent; omit for every agent' })
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiProperty()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiProperty({ enum: WebhookEvent, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(WebhookEvent, { each: true })
  events!: WebhookEvent[];
}

export class UpdateWebhookDto extends PartialType(CreateWebhookDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
