import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSIONS = 'auth:permissions';

/**
 * Declares the permission keys a handler needs.
 *
 * @example
 *   @RequirePermissions('news.publish')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRED_PERMISSIONS, permissions);
