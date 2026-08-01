import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AgentContext } from '../agents.service';

/** Injects the authenticated agent attached by `AgentAuthGuard`. */
export const CurrentAgent = createParamDecorator(
  (_: unknown, context: ExecutionContext): AgentContext => {
    const request = context.switchToHttp().getRequest<Request & { agent: AgentContext }>();
    return request.agent;
  }
);
