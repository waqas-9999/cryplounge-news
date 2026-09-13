import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export const RECOVERY_ACTIONS = ['ADVANCE_TO_RESEARCH', 'REQUIRE_REWRITE', 'RETRY', 'DISMISS'] as const;
export type RecoveryActionKey = (typeof RECOVERY_ACTIONS)[number];

export const RECOVERY_ACK_STATUSES = ['QUEUED', 'APPLIED', 'REJECTED'] as const;
export type RecoveryAckStatus = (typeof RECOVERY_ACK_STATUSES)[number];

export class CreateRecoveryRequestDto {
  @ApiProperty({
    enum: RECOVERY_ACTIONS,
    description:
      'ADVANCE_TO_RESEARCH and REQUIRE_REWRITE re-run the story through the full pipeline, every gate ' +
      'included. RETRY re-arms a failed or stalled job. DISMISS is a hard rejection. None of them ' +
      'publishes or approves anything.',
  })
  @IsIn(RECOVERY_ACTIONS)
  action!: RecoveryActionKey;

  @ApiProperty({ description: 'Why the newsroom decision is being overridden. Recorded in the audit log.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  reason!: string;

  @ApiPropertyOptional({ description: 'Anything else the next editor should know.' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  note?: string;
}

export class AcknowledgeRecoveryDto {
  @ApiProperty({ enum: RECOVERY_ACK_STATUSES })
  @IsIn(RECOVERY_ACK_STATUSES)
  status!: RecoveryAckStatus;

  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  detail!: string;

  @ApiPropertyOptional({ description: 'The newsroom job the request became, when it queued one.' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  jobId?: string | null;
}
