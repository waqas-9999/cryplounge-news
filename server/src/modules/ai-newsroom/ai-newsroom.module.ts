import { Module } from '@nestjs/common';
import { ContentCoreModule } from '../content-core/content-core.module';
import { AiNewsroomController } from './ai-newsroom.controller';
import { AiNewsroomService } from './ai-newsroom.service';

/**
 * AI newsroom automation controls.
 *
 * Exports the service so the future publication path can ask
 * `canPublishToCategory()` before creating anything — the kill switch is
 * enforced server-side, not in the admin UI.
 */
@Module({
  imports: [ContentCoreModule],
  controllers: [AiNewsroomController],
  providers: [AiNewsroomService],
  exports: [AiNewsroomService],
})
export class AiNewsroomModule {}
