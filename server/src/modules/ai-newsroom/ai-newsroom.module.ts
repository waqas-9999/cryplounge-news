import { Module } from '@nestjs/common';
import { ContentCoreModule } from '../content-core/content-core.module';
import { AiNewsroomController } from './ai-newsroom.controller';
import { AiNewsroomService } from './ai-newsroom.service';
import { NewsroomDiscoveryController } from './newsroom-discovery.controller';
import { NewsroomDiscoveryService } from './newsroom-discovery.service';
import { AutoPublishService } from './auto-publish.service';
import { NewsroomIntelligenceController } from './newsroom-intelligence.controller';
import { NewsroomIntelligenceService } from './newsroom-intelligence.service';
import { NewsroomPipelineReader } from './newsroom-pipeline.reader';
import { NewsroomRecoveryController } from './newsroom-recovery.controller';
import { NewsroomRecoveryService } from './newsroom-recovery.service';

/**
 * AI newsroom automation controls.
 *
 * Exports the service so the future publication path can ask
 * `canPublishToCategory()` before creating anything — the kill switch is
 * enforced server-side, not in the admin UI.
 */
@Module({
  imports: [ContentCoreModule],
  controllers: [
    AiNewsroomController,
    NewsroomDiscoveryController,
    NewsroomIntelligenceController,
    NewsroomRecoveryController,
  ],
  providers: [
    AiNewsroomService,
    NewsroomDiscoveryService,
    AutoPublishService,
    NewsroomIntelligenceService,
    NewsroomPipelineReader,
    NewsroomRecoveryService,
  ],
  // The recovery service is exported for the agent API, which serves the
  // newsroom's pull of pending requests and its acknowledgements.
  exports: [AiNewsroomService, AutoPublishService, NewsroomRecoveryService],
})
export class AiNewsroomModule {}
