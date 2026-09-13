import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { NewsroomRecoveryStatus } from '@prisma/client';
import type { Request } from 'express';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { auditContext } from '../articles/articles.controller';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateRecoveryRequestDto } from './dto/newsroom-recovery.dto';
import {
  DECISION_CLASSES,
  NewsroomPipelineReader,
  PIPELINE_WINDOWS,
  type PipelineWindowKey,
} from './newsroom-pipeline.reader';
import { NewsroomRecoveryService } from './newsroom-recovery.service';

/**
 * Held-back stories, their evidence, and editor recovery.
 *
 * `ai.newsroom.review` — SUPER_ADMIN, ADMIN and EDITOR. Reads come from the
 * newsroom database through a read-only connection; the one write, a recovery
 * request, lands in the CMS database with an audit entry and is applied by the
 * newsroom itself.
 */
@ApiTags('AI Newsroom')
@Controller('admin/ai/newsroom')
export class NewsroomRecoveryController {
  constructor(
    private readonly reader: NewsroomPipelineReader,
    private readonly recovery: NewsroomRecoveryService,
    private readonly prisma: PrismaService
  ) {}

  @Get('pipeline/health')
  @ApiBearerAuth()
  @RequirePermissions('ai.newsroom.review')
  @ResponseMessage('Newsroom pipeline health')
  @ApiQuery({ name: 'window', required: false, enum: Object.keys(PIPELINE_WINDOWS) })
  @ApiOperation({ summary: 'Story states, refusals by class, queue and editorial health, and the main bottleneck' })
  async health(@Query('window') window?: string) {
    const [health, pendingRecoveries] = await Promise.all([
      this.reader.health(windowOf(window, '24h')),
      this.prisma.newsroomRecoveryRequest.count({ where: { status: 'PENDING' } }),
    ]);
    return { ...health, pendingRecoveries };
  }

  @Get('decisions')
  @ApiBearerAuth()
  @RequirePermissions('ai.newsroom.review')
  @ResponseMessage('Newsroom decisions')
  @ApiQuery({ name: 'window', required: false, enum: Object.keys(PIPELINE_WINDOWS) })
  @ApiQuery({ name: 'decisionClass', required: false, enum: DECISION_CLASSES })
  @ApiQuery({ name: 'code', required: false })
  @ApiQuery({ name: 'state', required: false })
  @ApiQuery({ name: 'recoverable', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiOperation({ summary: 'Stories the newsroom held back, with its reasons and a deterministic editor assist score' })
  decisions(
    @Query('window') window?: string,
    @Query('decisionClass') decisionClass?: string,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('recoverable') recoverable?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string
  ) {
    if (decisionClass && !(DECISION_CLASSES as readonly string[]).includes(decisionClass)) {
      throw new BadRequestException({ message: 'Unknown decision class', code: 'INVALID_FILTER' });
    }
    return this.reader.decisions({
      window: windowOf(window, '7d'),
      decisionClass,
      code: code ? code.slice(0, 80) : undefined,
      state: state ? state.slice(0, 40) : undefined,
      recoverable: recoverable === 'true' ? true : recoverable === 'false' ? false : undefined,
      page: positive(page),
      perPage: positive(perPage),
    });
  }

  @Get('stories/:clusterId')
  @ApiBearerAuth()
  @RequirePermissions('ai.newsroom.review')
  @ResponseMessage('Newsroom story')
  @ApiOperation({
    summary: 'Everything the newsroom recorded about one story: research, every draft attempt, reviews, jobs, overrides',
  })
  async story(@Param('clusterId') clusterId: string) {
    const [inspection, recoveries, events] = await Promise.all([
      this.reader.story(clusterId),
      this.prisma.newsroomRecoveryRequest.findMany({
        where: { clusterId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.newsroomEvent.findMany({
        where: { clusterId },
        orderBy: { occurredAt: 'asc' },
        take: 200,
        select: { id: true, type: true, stage: true, status: true, model: true, durationMs: true, metadata: true, occurredAt: true },
      }),
    ]);

    if (inspection === null) {
      throw new NotFoundException({ message: 'No such story in the newsroom', code: 'NOT_FOUND' });
    }
    return { ...inspection, recoveries, events };
  }

  @Post('stories/:clusterId/recovery')
  @ApiBearerAuth()
  @RequirePermissions('ai.newsroom.review')
  @ResponseMessage('Recovery requested')
  @ApiHeader({
    name: 'Idempotency-Key',
    required: false,
    description: 'Repeating a request with the same key returns the first request instead of recording another.',
  })
  @ApiOperation({
    summary: 'Ask the newsroom to re-run, retry or dismiss a story it held back',
    description:
      'Recorded here with an audit entry and applied by the newsroom on its next cycle. Nothing is ' +
      'published or approved: a re-run passes every gate again and ends at most as a CMS draft.',
  })
  async requestRecovery(
    @Param('clusterId') clusterId: string,
    @Body() dto: CreateRecoveryRequestDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request
  ) {
    return this.recovery.request(clusterId, dto, auditContext(user, request), idempotencyKeyOf(request));
  }

  @Get('recoveries')
  @ApiBearerAuth()
  @RequirePermissions('ai.newsroom.review')
  @ResponseMessage('Recovery requests')
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'QUEUED', 'APPLIED', 'REJECTED'] })
  @ApiQuery({ name: 'clusterId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiOperation({ summary: 'Recovery requests and what the newsroom did with them' })
  recoveries(@Query('status') status?: string, @Query('clusterId') clusterId?: string, @Query('page') page?: string) {
    const statuses = ['PENDING', 'QUEUED', 'APPLIED', 'REJECTED'];
    if (status && !statuses.includes(status)) {
      throw new BadRequestException({ message: 'Unknown status', code: 'INVALID_FILTER' });
    }
    return this.recovery.list({
      status: status as NewsroomRecoveryStatus | undefined,
      clusterId: clusterId?.slice(0, 64),
      page: positive(page),
    });
  }
}

function windowOf(value: string | undefined, fallback: PipelineWindowKey): PipelineWindowKey {
  return value && value in PIPELINE_WINDOWS ? (value as PipelineWindowKey) : fallback;
}

function positive(value: string | undefined): number | undefined {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Same rules as the agent API: bounded, restricted characters, absent is legal. */
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{8,200}$/;

export function idempotencyKeyOf(request: Request): string | null {
  const raw = request.headers['idempotency-key'];
  const value = (Array.isArray(raw) ? raw[0] : raw)?.trim();
  if (!value) return null;
  if (!IDEMPOTENCY_KEY_PATTERN.test(value)) {
    throw new BadRequestException({
      message: 'Idempotency-Key must be 8-200 characters of letters, digits, dot, underscore, colon or hyphen',
      code: 'INVALID_IDEMPOTENCY_KEY',
    });
  }
  return `user:${value}`;
}
