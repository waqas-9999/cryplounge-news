import DOMPurify from 'isomorphic-dompurify';

/**
 * Article body contract, shared by the editor and the public renderer.
 *
 * The body is stored as HTML in `Article.content`, but only in the fixed set
 * of shapes the structured editor (Tiptap) emits — mirrored by the backend's
 * HtmlSanitizerService, which enforces it on save. See that service for the
 * exact image and FAQ markup.
 */

export const IMAGE_ALIGNMENTS = ['wide', 'center', 'inline'] as const;
export type ImageAlignment = (typeof IMAGE_ALIGNMENTS)[number];

export const IMAGE_ALIGNMENT_LABELS: Record<ImageAlignment, string> = {
  wide: 'Full width',
  center: 'Centered',
  inline: 'Inline',
};

export const FAQ_TITLE = 'Frequently asked questions';

/**
 * Links an editor may create: web, mail, phone, site-relative and in-page.
 * Everything else — `javascript:`, `data:`, `vbscript:`, `file:`,
 * protocol-relative `//host` — is refused.
 */
export function isSafeLinkUrl(raw: string): boolean {
  const url = raw.trim();
  if (!url || /\s/.test(url)) return false;
  if (url.startsWith('//')) return false;
  if (url.startsWith('/') || url.startsWith('#')) return true;
  if (/^mailto:[^@\s]+@[^@\s]+$/i.test(url) || /^tel:\+?[\d\s().-]{3,}$/i.test(url)) return true;
  try {
    const parsed = new URL(url);
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

/** Bare domains ("coindesk.com/x") become https URLs; everything else is left as typed. */
export function normalizeLinkUrl(raw: string): string {
  const url = raw.trim();
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/|$)/i.test(url)) return `https://${url}`;
  return url;
}

/** Images must come from a web URL (our media library); never `data:` or scripts. */
export function isSafeImageUrl(raw: string): boolean {
  const url = raw.trim();
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/** True when the body has no words, images or FAQ — `<p></p>` from an empty editor counts as empty. */
export function isBodyEmpty(html: string): boolean {
  if (/<(img|figure|section)\b/i.test(html)) return false;
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '') === '';
}

/* ---------------------------------------------------- public rendering --- */

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote',
  'h2', 'h3', 'h4', 'img', 'figure', 'figcaption', 'span', 'section', 'details', 'summary', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height', 'loading',
  'data-media-id', 'data-type', 'data-align', 'data-role', 'colspan', 'rowspan',
];

/** Attribute values the structured blocks may carry; anything else is removed. */
const ATTR_VALUES: Record<string, readonly string[]> = {
  'data-type': ['image', 'faq', 'faq-item'],
  'data-align': IMAGE_ALIGNMENTS,
  'data-role': ['caption', 'credit', 'faq-title', 'faq-answer'],
  loading: ['lazy', 'eager'],
  target: ['_blank'],
};

let hooked = false;

function installHooks() {
  if (hooked) return;
  hooked = true;
  DOMPurify.addHook('afterSanitizeAttributes', node => {
    for (const [attr, values] of Object.entries(ATTR_VALUES)) {
      const value = node.getAttribute(attr);
      if (value !== null && !values.includes(value)) node.removeAttribute(attr);
    }
    for (const span of ['colspan', 'rowspan']) {
      const value = node.getAttribute(span);
      if (value !== null && !/^(?:[1-9]|1\d|20)$/.test(value)) node.removeAttribute(span);
    }
    for (const dim of ['width', 'height']) {
      const value = node.getAttribute(dim);
      if (value !== null && !/^\d{1,5}$/.test(value)) node.removeAttribute(dim);
    }
    const mediaId = node.getAttribute('data-media-id');
    if (mediaId !== null && !/^[a-z0-9]{8,40}$/.test(mediaId)) node.removeAttribute('data-media-id');
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
    if (node.tagName === 'IMG') {
      // Body images sit below the fold; the lead image is the featured image.
      if (!node.getAttribute('loading')) node.setAttribute('loading', 'lazy');
      node.setAttribute('decoding', 'async');
      const src = node.getAttribute('src') ?? '';
      if (!isSafeImageUrl(src)) node.remove();
    }
  });
}

/**
 * Sanitizes a stored article body for the public page. Defense in depth: the
 * backend already sanitized on save, but bodies written before that existed,
 * or edited directly in the database, pass through here too.
 */
export function sanitizeArticleBody(html: string): string {
  installHooks();
  return DOMPurify.sanitize(html, SANITIZE_CONFIG);
}

const SANITIZE_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR: [...ALLOWED_ATTR, 'decoding'],
  // DOMPurify's default minus ftp/sms/callto/cid/xmpp: web, mail, phone and
  // scheme-less (relative) URLs only.
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  ALLOW_DATA_ATTR: false,
};

/**
 * The body as the public page shows it: sanitized, with each table wrapped in
 * a focusable scroll region so a wide table scrolls inside the column on a
 * phone while staying a real table (headers stay announced against cells).
 *
 * Done on the sanitized DOM rather than by string replacement: a regex over
 * HTML would also match `<table` inside an attribute value that a browser left
 * unescaped, and splice markup into it. The wrapper is presentation only — it
 * is added here, never stored, and never passes through the server sanitizer.
 */
export function renderArticleBody(html: string): string {
  installHooks();
  const fragment = DOMPurify.sanitize(html, { ...SANITIZE_CONFIG, RETURN_DOM_FRAGMENT: true });
  const doc = fragment.ownerDocument;
  for (const table of Array.from(fragment.querySelectorAll('table'))) {
    const scroll = doc.createElement('div');
    scroll.className = 'cl-table-scroll';
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', 'Table');
    scroll.setAttribute('tabindex', '0');
    table.replaceWith(scroll);
    scroll.appendChild(table);
  }
  const container = doc.createElement('div');
  container.appendChild(fragment);
  return container.innerHTML;
}
