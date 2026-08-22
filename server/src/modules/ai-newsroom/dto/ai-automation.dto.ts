import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
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
      'DRAFT_ONLY and REVIEW_REQUIRED are selectable. AUTO_PUBLISH is rejected ' +
      'until generation, fact checking and images are implemented.',
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
