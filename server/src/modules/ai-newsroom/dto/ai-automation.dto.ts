import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsObject, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { MODEL_STAGES, TEXT_PROVIDERS, IMAGE_PROVIDERS } from '../model-settings';
import {
  AI_PUBLISH_MODES,
  AUTO_PUBLISH_STRICTNESS,
  type AiPublishMode,
  type AutoPublishStrictness,
} from '../ai-newsroom.service';

export class SetAutomationDto {
  @ApiProperty({ description: 'Global AI automation switch. False stops all automatic publishing.' })
  @IsBoolean()
  enabled!: boolean;
}

export class SetPublishModeDto {
  @ApiProperty({
    enum: AI_PUBLISH_MODES,
    description:
      'AUTO_PUBLISH lets articles that clear every gate publish without review. ' +
      'Enabling it is refused on malformed automation configuration. It grants no ' +
      'agent any permission: an agent must separately hold news.publish.',
  })
  @IsIn(AI_PUBLISH_MODES)
  mode!: AiPublishMode;
}

export class SetCategoryAutomationDto {
  @ApiProperty({ description: 'CrypLounge NEWS category slug, e.g. "policy"' })
  @IsString()
  @MaxLength(120)
  slug!: string;

  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;
}

export class SetEmergencyPauseDto {
  @ApiProperty({
    description:
      'True engages the emergency stop: nothing publishes automatically until it is released. ' +
      'Independent of the publish mode, which is preserved.',
  })
  @IsBoolean()
  paused!: boolean;
}

export class SetAutoPublishLimitsDto {
  @ApiProperty({ required: false, description: 'Maximum articles published automatically per day.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  dailyLimit?: number;

  @ApiProperty({ required: false, description: 'Opportunity score an article must reach to publish itself.' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number;

  @ApiProperty({
    required: false,
    enum: AUTO_PUBLISH_STRICTNESS,
    description:
      'ALL_DRAFTS releases every draft the newsroom files. HIGH_CONFIDENCE additionally ' +
      'requires the score, fact and quality thresholds. Safety checks apply either way.',
  })
  @IsOptional()
  @IsIn(AUTO_PUBLISH_STRICTNESS)
  strictness?: AutoPublishStrictness;
}

/**
 * Model routing for every stage, in one object.
 *
 * Validated in the service rather than by decorators: the rules are
 * per-stage — an image stage takes image providers, a text stage takes text
 * providers — and expressing that with class-validator would mean nine
 * near-identical nested classes that still could not report every bad stage in
 * one response. `validateModelSettings` does both.
 */
export class SetModelsDto {
  @ApiProperty({
    description:
      'Stage → { provider, model }. Stages: ' +
      MODEL_STAGES.join(', ') +
      '. Text providers: ' +
      TEXT_PROVIDERS.join(', ') +
      '. Image providers: ' +
      IMAGE_PROVIDERS.join(', ') +
      '. Omit a field, or send null or "", to leave that stage on the newsroom configuration.',
    example: {
      writer: { provider: 'google-gemini', model: 'gemini-flash-latest' },
      image: { provider: 'gemini', model: 'gemini-2.5-flash-image' },
    },
  })
  @IsObject()
  models!: Record<string, { provider?: string | null; model?: string | null }>;
}
