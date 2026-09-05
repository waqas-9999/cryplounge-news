import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** The only thing the browser supplies; everything else is verified server-side. */
export class AttachVisualDto {
  @ApiProperty({ description: 'Media id of an approved candidate.' })
  @IsString()
  @Length(1, 64)
  mediaId!: string;
}
