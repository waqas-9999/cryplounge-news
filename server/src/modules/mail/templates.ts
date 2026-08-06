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

/**
 * Sent to a new newsletter subscriber.
 *
 * Like the contact acknowledgement, it deliberately echoes none of the
 * visitor's input — it goes to an unverified address, and echoing text back
 * would let the form deliver arbitrary content to a third party under our
 * domain. No unsubscribe link is included because subscribers have no
 * account or token to confirm with; the address simply leaves the list
 * when the reader emails the team or an admin unsubscribes them.
 */
export function newsletterConfirmation() {
  const body = `
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">
      Welcome to the CrypLounge newsletter. You're now subscribed to the
      sharpest crypto, DeFi and blockchain news — curated by our editors and
      delivered straight to your inbox.
    </p>
    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">
      Expect market briefings, breaking news, research digests and regulation
      updates. No spam, and you can leave anytime.
    </p>
    <p style="margin:0;font-size:14px;line-height:1.6;">
      There's no need to reply to this email — it's an automatic confirmation.
    </p>`;

  const text = [
    `Welcome to the CrypLounge newsletter.`,
    ``,
    `You're now subscribed to the sharpest crypto, DeFi and blockchain news —`,
    `curated by our editors and delivered straight to your inbox.`,
    ``,
    `Expect market briefings, breaking news, research digests and regulation`,
    `updates. No spam, and you can leave anytime.`,
    ``,
    `There's no need to reply to this email - it's an automatic confirmation.`,
  ].join('\n');

  return {
    subject: "You're subscribed to the CrypLounge newsletter",
    html: layout('Welcome to the CrypLounge newsletter', body),
    text,
  };
}

/**
 * A campaign email composed in the admin panel and sent to real subscribers
 * through the existing SMTP configuration.
 *
 * The content is sanitized HTML (see HtmlSanitizerService) so it is inserted
 * as-is; everything else is escaped. Every campaign carries a per-recipient
 * signed unsubscribe link — the address unsubscribes without logging in, and
 * the token is unforgeable, so one reader cannot unsubscribe another.
 */
export interface NewsletterCampaignInput {
  subject: string;
  title: string;
  contentHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  unsubscribeUrl: string;
  frontendUrl: string;
}

export function newsletterCampaignTemplate(input: NewsletterCampaignInput) {
  const cta = input.ctaLabel && input.ctaUrl
    ? `
      <p style="margin:24px 0 0;">
        <a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:${BRAND};color:#18181B;padding:12px 22px;border-radius:8px;font-weight:600;text-decoration:none;font-size:14px;">${escapeHtml(
          input.ctaLabel
        )}</a>
      </p>`
    : '';

  const html = campaignLayout(
    input.title,
    `
      <div style="font-size:14px;line-height:1.7;color:#18181B;">${input.contentHtml}</div>
      ${cta}`
  , {
    unsubscribeUrl: input.unsubscribeUrl,
    frontendUrl: input.frontendUrl,
  });

  const text = [
    input.title,
    ``,
    htmlToText(input.contentHtml),
    ...(cta ? [``, input.ctaLabel, input.ctaUrl] : []),
    ``,
    `You are receiving this because you subscribed to the CrypLounge newsletter.`,
    `To stop receiving these emails, visit: ${input.unsubscribeUrl}`,
    ``,
    input.frontendUrl,
  ].join('\n');

  return { subject: input.subject, html, text };
}

/** Campaign layout: same branding as the transactional emails, plus an unsubscribe footer. */
function campaignLayout(
  title: string,
  body: string,
  footer: { unsubscribeUrl: string; frontendUrl: string }
): string {
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
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;">${escapeHtml(title)}</h1>
          ${body}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #E4E4E7;font-size:12px;color:#71717A;">
          <p style="margin:0 0 8px;">You are receiving this because you subscribed to the CrypLounge newsletter.</p>
          <p style="margin:0;">
            <a href="${escapeHtml(footer.unsubscribeUrl)}" style="color:#71717A;text-decoration:underline;">Unsubscribe</a> from these emails.
          </p>
          <p style="margin:10px 0 0;">
            CrypLounge · <a href="${escapeHtml(footer.frontendUrl)}" style="color:#71717A;text-decoration:underline;">${escapeHtml(
              footer.frontendUrl.replace(/^https?:\/\//, '')
            )}</a>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Rough HTML → plain text, good enough for a text alternative to a sanitized body. */
export function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|blockquote|pre|ul|ol)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}
