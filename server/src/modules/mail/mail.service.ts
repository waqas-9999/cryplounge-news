import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createTransport, type Transporter } from 'nodemailer';
import { mailConfig } from '@/config/configuration';

/**
 * Outbound mail.
 *
 * Three rules shape this service:
 *
 *  1. **Mail is optional.** With no `SMTP_HOST` configured every send is a
 *     no-op that returns `false`. The site must keep working without it.
 *  2. **A send never breaks the operation that triggered it.** Callers are
 *     expected to ignore the result; failures are logged, not thrown. A
 *     contact message that is stored but not emailed is a degraded success,
 *     not a failed submission.
 *  3. **User input is never interpolated into HTML.** Everything supplied by
 *     a visitor is escaped, so a submitted message cannot inject markup into
 *     the notification an editor opens.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;

  constructor(@Inject(mailConfig.KEY) private readonly config: ConfigType<typeof mailConfig>) {
    this.logger.log(
      this.config.enabled
        ? `Mail enabled via ${this.config.host}:${this.config.port} as ${this.config.user}`
        : 'Mail disabled: SMTP_HOST is not set.'
    );
  }

  get enabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Non-secret view of the configuration, for the admin Email screen.
   * Deliberately excludes the password — it must never leave the server.
   */
  status() {
    return {
      enabled: this.config.enabled,
      host: this.config.host ?? null,
      port: this.config.port,
      secure: this.config.secure,
      user: this.config.user ? maskAddress(this.config.user) : null,
      from: this.config.from ?? null,
      fromName: this.config.fromName,
      contactRecipients: this.config.contactRecipients,
    };
  }

  /**
   * Built on first use rather than in the constructor, so an unreachable SMTP
   * server cannot delay or break application startup.
   */
  private transport(): Transporter | null {
    if (!this.config.enabled) return null;
    if (this.transporter) return this.transporter;

    this.transporter = createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: { user: this.config.user!, pass: this.config.password! },
    });

    return this.transporter;
  }

  /** Verifies credentials against the server. Used by the admin test action. */
  async verify(): Promise<{ ok: boolean; error?: string }> {
    const transport = this.transport();
    if (!transport) return { ok: false, error: 'Mail is not configured (SMTP_HOST is unset).' };

    try {
      await transport.verify();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : 'Verification failed' };
    }
  }

  /**
   * Sends one message. Returns whether it was accepted; never throws.
   *
   * `replyTo` is how a visitor's address reaches an editor's reply button
   * without ever appearing in the `From` header — sending *as* the visitor
   * would fail SPF and get the domain marked as a spammer.
   */
  async send(message: {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
  }): Promise<boolean> {
    const transport = this.transport();
    if (!transport) {
      this.logger.warn(`Mail not configured; skipped "${message.subject}"`);
      return false;
    }

    const recipients = Array.isArray(message.to) ? message.to : [message.to];
    if (recipients.length === 0) {
      this.logger.warn(`No recipients for "${message.subject}"`);
      return false;
    }

    try {
      const info = await transport.sendMail({
        from: { address: this.config.from!, name: this.config.fromName },
        to: recipients,
        subject: message.subject,
        text: message.text,
        html: message.html,
        replyTo: message.replyTo,
      });
      this.logger.log(
        `Sent "${message.subject}" to ${recipients.join(', ')} (messageId: ${info.messageId})`
      );
      return true;
    } catch (error) {
      // Logged rather than rethrown: see rule 2 above.
      this.logger.error(
        `Failed to send "${message.subject}" to ${recipients.join(', ')}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }
}

/** `alice@example.com` → `al***@example.com`. Enough to confirm which account. */
function maskAddress(address: string): string {
  const [local, domain] = address.split('@');
  if (!domain) return '***';
  return `${local.slice(0, 2)}***@${domain}`;
}

/** Escapes text for safe interpolation into an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
