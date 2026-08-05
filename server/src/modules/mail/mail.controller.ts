import { Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { MailService } from './mail.service';

/**
 * Read-and-test surface for the admin Email screen.
 *
 * There is no write endpoint by design: SMTP credentials come from the
 * environment, so they cannot be changed — or read — through the API.
 */
@ApiTags('Mail')
@Controller('admin/mail')
export class MailController {
  constructor(private readonly mail: MailService) {}

  @Get('status')
  @ApiBearerAuth()
  @RequirePermissions('settings.read')
  @ResponseMessage('Mail configuration')
  @ApiOperation({ summary: 'Active mail configuration, with the password omitted' })
  status() {
    return this.mail.status();
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @RequirePermissions('settings.update')
  @ResponseMessage('Test email')
  @ApiOperation({ summary: 'Verify SMTP credentials and send a test to the signed-in user' })
  async test(@CurrentUser() user: AuthenticatedUser) {
    const verification = await this.mail.verify();
    if (!verification.ok) return { ok: false, stage: 'connection', error: verification.error };

    // Sent only to the requester's own address — never to an arbitrary one, so
    // this endpoint cannot be used to mail third parties.
    const sent = await this.mail.send({
      to: user.email,
      subject: 'CrypLounge test email',
      text: 'Your CrypLounge SMTP configuration is working.',
      html: '<p>Your CrypLounge SMTP configuration is working.</p>',
    });

    return sent
      ? { ok: true, sentTo: user.email }
      : { ok: false, stage: 'send', error: 'The server accepted the connection but the send failed.' };
  }
}
