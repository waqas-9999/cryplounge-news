import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AiNewsroomModule } from '../ai-newsroom/ai-newsroom.module';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { AgentSubmissionController } from './agent-submission.controller';
import { AgentLogCleanupTask } from './agent-log-cleanup.task';
import { NewsroomTelemetryCleanupTask } from './newsroom-telemetry-cleanup.task';
import { NewsroomTelemetryService } from './newsroom-telemetry.service';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentAuthGuard } from './guards/agent-auth.guard';
import { IDEMPOTENCY_STORE, IdempotencyService } from './idempotency.service';
import { PrismaIdempotencyStore } from './prisma-idempotency.store';

@Module({
  imports: [MediaModule, WebhooksModule, AiNewsroomModule],
  controllers: [AgentsController, AgentSubmissionController],
  providers: [
    AgentsService,
    AgentAuthGuard,
    AgentLogCleanupTask,
    NewsroomTelemetryCleanupTask,
    NewsroomTelemetryService,
    IdempotencyService,
    // Bound through a token because `IdempotencyStore` is an interface and is
    // erased at runtime. Swapping the implementation (for a test, or a
    // different backing table) is a change here and nowhere else.
    { provide: IDEMPOTENCY_STORE, useClass: PrismaIdempotencyStore },
  ],
  exports: [AgentsService, IdempotencyService],
})
export class AgentsModule {}
