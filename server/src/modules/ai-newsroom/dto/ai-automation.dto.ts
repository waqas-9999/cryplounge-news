import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsString, MaxLength } from 'class-validator';
import { AI_PUBLISH_MODES, type AiPublishMode } from '../ai-newsroom.service';

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
