import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { AgentsService, type AgentContext } from './agents.service';
import { CurrentAgent } from './decorators/current-agent.decorator';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { AgentAuthGuard } from './guards/agent-auth.guard';

/**
 * The surface agents actually call. Kept separate from `AgentsController`
 * (which is admin-only) so the two authentication schemes never mix on one
 * controller.
 */
@ApiTags('AI Agents')
@Controller('agents')
@Public()
@UseGuards(AgentAuthGuard)
@ApiSecurity('agent-key')
@ApiSecurity('agent-secret')
export class AgentSubmissionController {
  constructor(private readonly agents: AgentsService) {}

  @Post('articles')
  @ResponseMessage('Article submitted')
  @ApiOperation({ summary: 'Submit an article; status follows the agent\'s publish mode' })
  async submitArticle(
    @Body() dto: SubmitArticleDto,
    @CurrentAgent() agent: AgentContext,
    @Req() request: Request
  ) {
    const startedAt = Date.now();
    const ipAddress =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? request.ip;

    try {
      const article = await this.agents.submitArticle(agent, dto);

      await this.agents.logRequest({
        agentId: agent.id,
        agentName: agent.name,
        endpoint: 'agents/articles',
        method: 'POST',
        statusCode: 201,
        ipAddress,
        contentType: request.headers['content-type'],
        resultEntity: 'Article',
        resultEntityId: article.id,
        durationMs: Date.now() - startedAt,
      });

      return article;
    } catch (error) {
      const statusCode = (error as { status?: number }).status ?? 500;

      await this.agents.logRequest({
        agentId: agent.id,
        agentName: agent.name,
        endpoint: 'agents/articles',
        method: 'POST',
        statusCode,
        ipAddress,
        contentType: request.headers['content-type'],
        validationErrors: (error as { response?: unknown }).response,
        durationMs: Date.now() - startedAt,
      });

      throw error;
    }
  }
}
