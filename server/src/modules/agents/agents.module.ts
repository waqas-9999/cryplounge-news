import { Module } from '@nestjs/common';
import { WebhooksModule } from '../webhooks/webhooks.module';
import { AgentSubmissionController } from './agent-submission.controller';
import { AgentLogCleanupTask } from './agent-log-cleanup.task';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentAuthGuard } from './guards/agent-auth.guard';

@Module({
  imports: [WebhooksModule],
  controllers: [AgentsController, AgentSubmissionController],
  providers: [AgentsService, AgentAuthGuard, AgentLogCleanupTask],
  exports: [AgentsService],
})
export class AgentsModule {}
