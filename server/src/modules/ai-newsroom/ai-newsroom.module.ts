import { Module } from '@nestjs/common';
import { ContentCoreModule } from '../content-core/content-core.module';
import { AiNewsroomController } from './ai-newsroom.controller';
import { AiNewsroomService } from './ai-newsroom.service';
import { NewsroomDiscoveryController } from './newsroom-discovery.controller';
import { NewsroomDiscoveryService } from './newsroom-discovery.service';
import { AutoPublishService } from './auto-publish.service';

/**
 * AI newsroom automation controls.
 *
 * Exports the service so the future publication path can ask
 * `canPublishToCategory()` before creating anything — the kill switch is
 * enforced server-side, not in the admin UI.
 */
@Module({
  imports: [ContentCoreModule],
  controllers: [AiNewsroomController, NewsroomDiscoveryController],
  providers: [AiNewsroomService, NewsroomDiscoveryService, AutoPublishService],
  exports: [AiNewsroomService, AutoPublishService],
})
export class AiNewsroomModule {}
