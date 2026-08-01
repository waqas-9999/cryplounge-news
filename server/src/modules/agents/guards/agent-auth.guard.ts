import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AgentsService } from '../agents.service';
import type { AgentContext } from '../agents.service';

/**
 * Authenticates an AI agent from `X-Agent-Key` / `X-Agent-Secret` headers.
 *
 * Separate from `JwtAuthGuard` on purpose: an agent is not a user session,
 * has no refresh token, and is scoped by permissions stored on `AiAgent`
 * rather than a role. Routes using this guard must be marked `@Public()` so
 * the global JWT guard does not also demand a bearer token.
 */
@Injectable()
export class AgentAuthGuard implements CanActivate {
  constructor(private readonly agents: AgentsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { agent?: AgentContext }>();

    const apiKey = request.headers['x-agent-key'];
    const apiSecret = request.headers['x-agent-secret'];

    if (typeof apiKey !== 'string' || typeof apiSecret !== 'string') {
      throw new UnauthorizedException('Missing agent credentials');
    }

    const ipAddress = (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? request.ip;
    const agent = await this.agents.verifyCredentials(apiKey, apiSecret, ipAddress);

    const context$: AgentContext = {
      id: agent.id,
      name: agent.name,
      environment: agent.environment,
      permissions: agent.permissions,
      defaultPublishMode: agent.defaultPublishMode,
    };

    await this.agents.assertWithinRateLimit(context$);
    request.agent = context$;
    return true;
  }
}
