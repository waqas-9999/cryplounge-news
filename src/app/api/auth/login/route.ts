import { z } from 'zod';
import { login } from '@/server/auth';
import { recordAudit } from '@/server/audit';
import { apiError, clientIp, handle, ok, parseBody } from '@/server/api';

const LoginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/**
 * POST /api/auth/login
 *
 * On failure the response is identical whether the email is unknown or the
 * password is wrong, so it cannot be used to enumerate accounts.
 */
export const POST = handle(async (request: Request) => {
  const { email, password } = await parseBody(request, LoginInput);
  const ipAddress = clientIp(request);

  const user = await login(email, password, {
    ipAddress,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  if (!user) {
    await recordAudit({
      action: 'LOGIN_FAILED',
      summary: `Failed sign-in attempt for ${email}`,
      userEmail: email,
      ipAddress,
    });
    return apiError('Invalid email or password', 401, 'invalid_credentials');
  }

  await recordAudit({
    action: 'LOGIN',
    summary: `${user.email} signed in`,
    user,
    ipAddress,
  });

  return ok({ user });
});
