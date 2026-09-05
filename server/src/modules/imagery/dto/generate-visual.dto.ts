import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * What an editor may contribute to a generation request.
 *
 * Deliberately one optional field. The headline, summary and category come
 * from the article row, and there is nowhere here to put a raw prompt — a
 * prompt field would let the browser reach the model directly and route
 * around the safety layer in `cryplounge-ai`.
 */
export class GenerateVisualDto {
  @ApiPropertyOptional({ description: 'What the image should show, in editorial terms.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  visualSubject?: string;
}
