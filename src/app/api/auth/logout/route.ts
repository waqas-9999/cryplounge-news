import { getSessionUser, logout } from '@/server/auth';
import { recordAudit } from '@/server/audit';
import { clientIp, handle, noContent } from '@/server/api';

/** POST /api/auth/logout — destroys the session row and clears the cookie. */
export const POST = handle(async (request: Request) => {
  const user = await getSessionUser();
  await logout();

  if (user) {
    await recordAudit({
      action: 'LOGOUT',
      summary: `${user.email} signed out`,
      user,
      ipAddress: clientIp(request),
    });
  }

  return noContent();
});
