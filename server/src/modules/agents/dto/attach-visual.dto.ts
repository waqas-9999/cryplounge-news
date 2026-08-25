import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Placing an uploaded asset in an article.
 *
 * Carries no image URL, creator or licence. Those are properties of the file,
 * which the upload endpoint already recorded, and for generated imagery they
 * are known rather than supplied — see `visuals/visual-brief.ts` in the
 * newsroom for why an agent is never asked for them.
 */
export class AttachVisualDto {
  @ApiProperty({ description: 'Id returned by the media upload endpoint' })
  @IsString()
  mediaId!: string;

  @ApiProperty({ enum: ['PHOTO', 'CHART', 'INFOGRAPHIC', 'TIMELINE'] })
  @IsEnum(['PHOTO', 'CHART', 'INFOGRAPHIC', 'TIMELINE'])
  type!: 'PHOTO' | 'CHART' | 'INFOGRAPHIC' | 'TIMELINE';

  @ApiPropertyOptional({ enum: ['HERO', 'INLINE'], default: 'INLINE' })
  @IsOptional()
  @IsEnum(['HERO', 'INLINE'])
  placement?: 'HERO' | 'INLINE';

  @ApiPropertyOptional({ description: 'Render order within the placement', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  position?: number;

  @ApiPropertyOptional({ description: 'Why this visual belongs, from the writer brief' })
  @IsOptional()
  @IsString()
  relevanceReason?: string;

  @ApiPropertyOptional({ description: 'Chart specification, when the visual is a chart' })
  @IsOptional()
  @IsObject()
  chartMeta?: Record<string, unknown>;
}
