import { getSessionUser } from '@/server/auth';
import { handle, ok } from '@/server/api';

/**
 * GET /api/auth/session — the current staff user, or null.
 *
 * Returns 200 with `{ user: null }` rather than 401 so the admin shell can
 * distinguish "signed out" from "request failed".
 */
export const GET = handle(async () => {
  const user = await getSessionUser();
  return ok({ user });
});
