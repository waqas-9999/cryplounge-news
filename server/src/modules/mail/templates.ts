import { escapeHtml } from './mail.service';

/**
 * Email bodies.
 *
 * Plain inline-styled HTML with a text alternative — no template engine and no
 * external assets, because mail clients strip stylesheets and block remote
 * content by default. Every interpolated value that originates with a visitor
 * is escaped at the point of use.
 */

const BRAND = '#EFB81A';

function layout(title: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#F4F4F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181B;">
    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#FFFFFF;border-radius:12px;border:1px solid #E4E4E7;">
      <tr>
        <td style="padding:20px 24px;border-bottom:3px solid ${BRAND};">
          <span style="font-size:18px;font-weight:600;">CrypLounge</span>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 16px;font-size:18px;font-weight:600;">${escapeHtml(title)}</h1>
          ${body}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #E4E4E7;font-size:12px;color:#71717A;">
          This is an automated message from the CrypLounge website.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:#71717A;width:110px;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;">${escapeHtml(value)}</td>
  </tr>`;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

/** Sent to staff. Carries the full submission so no one has to open the admin. */
export function contactNotification(submission: ContactSubmission) {
  const body = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
      ${row('From', submission.name)}
      ${row('Email', submission.email)}
      ${row('Subject', submission.subject)}
      ${row('Received', submission.createdAt.toUTCString())}
    </table>
    <div style="padding:14px 16px;background:#FAFAFA;border:1px solid #E4E4E7;border-radius:8px;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(
      submission.message
    )}</div>
    <p style="margin:16px 0 0;font-size:13px;color:#71717A;">
      Reply directly to this email to respond to ${escapeHtml(submission.name)}.
    </p>`;

  const text = [
    `New contact form submission`,
    ``,
    `From:     ${submission.name}`,
    `Email:    ${submission.email}`,
    `Subject:  ${submission.subject}`,
    `Received: ${submission.createdAt.toUTCString()}`,
    ``,
    submission.message,
  ].join('\n');

  return {
    subject: `Contact form: ${submission.subject}`.slice(0, 160),
    html: layout('New contact form submission', body),
    text,
  };
}

/**
 * Sent to whoever submitted the form.
 *
 * Deliberately contains none of their input — this goes to an unverified
 * address, so echoing text back would let the form be used to deliver
 * arbitrary content to a third party under our domain.
 */
export function contactAcknowledgement() {
  const body = `
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">
      Thanks for getting in touch. We've received your message and a member of the
      team will get back to you as soon as we can.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;">
      There's no need to reply to this email — it's an automatic confirmation.
    </p>`;

  const text = [
    `Thanks for getting in touch.`,
    ``,
    `We've received your message and a member of the team will get back to you`,
    `as soon as we can.`,
    ``,
    `There's no need to reply to this email - it's an automatic confirmation.`,
  ].join('\n');

  return {
    subject: 'We received your message — CrypLounge',
    html: layout('We received your message', body),
    text,
  };
}
