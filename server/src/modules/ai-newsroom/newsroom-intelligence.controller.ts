import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { INTEL_WINDOWS, type IntelWindowKey } from './newsroom-intelligence.derive';
import { NewsroomIntelligenceService } from './newsroom-intelligence.service';

/**
 * Newsroom intelligence: the read model behind the admin globe.
 *
 * `ai.automation.read` — SUPER_ADMIN and ADMIN — like the other internal
 * newsroom pages. Read-only: this controller changes nothing.
 *
 * ## Transport
 *
 * Polled, not streamed. The admin client authenticates with a bearer token,
 * which `EventSource` cannot send, and the newsroom writes in batches every
 * few seconds, so a short poll of a bounded snapshot is both simpler and no
 * less current than a stream would be today. The response carries
 * `generatedAt` so the page can say how fresh it is.
 */
@ApiTags('AI Newsroom')
@Controller('admin/ai/newsroom')
export class NewsroomIntelligenceController {
  constructor(private readonly intelligence: NewsroomIntelligenceService) {}

  @Get('intelligence')
  @ApiBearerAuth()
  @RequirePermissions('ai.automation.read')
  @ResponseMessage('Newsroom intelligence')
  @ApiQuery({ name: 'window', required: false, enum: Object.keys(INTEL_WINDOWS) })
  @ApiOperation({ summary: 'Stories, stages, publisher bases and recent events for a time window' })
  snapshot(@Query('window') window?: string) {
    const key: IntelWindowKey = window && window in INTEL_WINDOWS ? (window as IntelWindowKey) : 'live';
    return this.intelligence.snapshot(key);
  }
}
