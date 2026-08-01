import { ApiPropertyOptional, ApiProperty, PartialType } from '@nestjs/swagger';
import { AgentEnvironment, AgentPublishMode } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAgentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ enum: AgentEnvironment, default: AgentEnvironment.STAGING })
  @IsOptional()
  @IsEnum(AgentEnvironment)
  environment?: AgentEnvironment;

  @ApiPropertyOptional({ enum: AgentPublishMode, default: AgentPublishMode.DRAFT })
  @IsOptional()
  @IsEnum(AgentPublishMode)
  defaultPublishMode?: AgentPublishMode;

  @ApiPropertyOptional({ type: [String], description: 'Empty means any source address' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedIps?: string[];

  @ApiPropertyOptional({
    type: [String],
    description: 'Permission keys the agent may act with, e.g. ["news.create","media.upload"]',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ default: 60 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6000)
  rateLimitPerMinute?: number;
}

export class UpdateAgentDto extends PartialType(CreateAgentDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
