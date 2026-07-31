import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { REQUIRED_PERMISSIONS } from '../decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../jwt.strategy';

/**
 * Checks the permission keys a handler declares against those the caller's
 * role grants.
 *
 * Permissions come from the database, so an administrator can adjust what a
 * role may do without a deploy — the brief's "do not hardcode permissions".
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;

    if (!user) throw new ForbiddenException('Authentication required');

    // SUPER_ADMIN is the break-glass role and always passes.
    if (user.role === 'SUPER_ADMIN') return true;

    const missing = required.filter(permission => !user.permissions.includes(permission));
    if (missing.length > 0) {
      throw new ForbiddenException(`Missing permission: ${missing.join(', ')}`);
    }

    return true;
  }
}
