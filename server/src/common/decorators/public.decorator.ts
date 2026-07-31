import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'auth:public';

/**
 * Marks a route as reachable without authentication.
 *
 * The JWT guard is global, so access is closed by default and opening it is an
 * explicit, greppable decision on the handler.
 */
export const Public = () => SetMetadata(IS_PUBLIC, true);
