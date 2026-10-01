import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes article body HTML before it is persisted.
 *
 * The frontend also sanitizes on render (defense in depth), but content must
 * never reach the database carrying scripts, event handlers or dangerous
 * protocols — anything reading the DB directly (RSS, JSON-LD, future
 * consumers) would otherwise be exposed.
 *
 * Article bodies are written by the structured editor (Tiptap/ProseMirror),
 * whose schema serializes to a small, fixed set of HTML shapes. This allowlist
 * is that schema — anything outside it is dropped, and the structured blocks
 * are only accepted with the exact attribute values the editor emits:
 *
 *   image  <figure data-type="image" data-align="wide|center|inline">
 *            <img src alt width height data-media-id loading>
 *            <figcaption><span data-role="caption">…</span>
 *                        <span data-role="credit">…</span></figcaption>
 *          </figure>
 *   FAQ    <section data-type="faq"><h2 data-role="faq-title">…</h2>
 *            <details data-type="faq-item"><summary>Q</summary>
 *              <div data-role="faq-answer"><p>A</p></div></details>
 *          </section>
 *
 * Older bodies (plain <p>, bare <img>, <figure> without data attributes) are
 * still valid input, so existing articles keep rendering unchanged.
 */
@Injectable()
export class HtmlSanitizerService {
  private static readonly ALLOWED_TAGS = [
    'p',
    'br',
    'hr',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'a',
    'ul',
    'ol',
    'li',
    'blockquote',
    'h2',
    'h3',
    'h4',
    'img',
    'figure',
    'figcaption',
    'span',
    'section',
    'details',
    'summary',
    'div',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ];

  private static readonly SAFE_PROTOCOLS = ['http', 'https', 'mailto', 'tel'];

  /** Table spans: a small positive integer, never a layout weapon. */
  private static readonly SPAN = /^(?:[1-9]|1\d|20)$/;

  /** Media ids are cuids; anything else is not a reference to our library. */
  private static readonly MEDIA_ID = /^[a-z0-9]{8,40}$/;

  /** Block tags that mean "this is already structured HTML, leave it alone". */
  private static readonly BLOCK_TAG_PATTERN =
    /<(p|h2|h3|h4|ul|ol|li|blockquote|figure|hr|section|details|table)[ >]/i;

  sanitize(html: string): string {
    const withParagraphs = HtmlSanitizerService.autoParagraph(html);

    const cleaned = sanitizeHtml(withParagraphs, {
      allowedTags: HtmlSanitizerService.ALLOWED_TAGS,
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height', 'data-media-id', { name: 'loading', multiple: false, values: ['lazy', 'eager'] }],
        figure: [
          { name: 'data-type', multiple: false, values: ['image'] },
          { name: 'data-align', multiple: false, values: ['wide', 'center', 'inline'] },
        ],
        span: [{ name: 'data-role', multiple: false, values: ['caption', 'credit'] }],
        section: [{ name: 'data-type', multiple: false, values: ['faq'] }],
        h2: [{ name: 'data-role', multiple: false, values: ['faq-title'] }],
        details: [{ name: 'data-type', multiple: false, values: ['faq-item'] }],
        div: [{ name: 'data-role', multiple: false, values: ['faq-answer'] }],
        th: ['colspan', 'rowspan'],
        td: ['colspan', 'rowspan'],
      },
      allowedSchemes: HtmlSanitizerService.SAFE_PROTOCOLS,
      // Images load, they are never navigated to: web URLs only, so no
      // `data:`/`mailto:` sources.
      allowedSchemesByTag: { img: ['http', 'https'] },
      allowProtocolRelative: false,
      // Internal links (`/news/...`) and relative image paths have no
      // scheme — allow them through rather than requiring an absolute URL.
      allowedSchemesAppliedToAttributes: ['href', 'src'],
      transformTags: {
        a: (tagName, attribs) => {
          const next: Record<string, string> = { href: attribs.href };
          // `_blank` is the only target the editor offers; it always gets rel.
          if (attribs.target === '_blank') {
            next.target = '_blank';
            next.rel = 'noopener noreferrer';
          } else if (attribs.rel) {
            next.rel = attribs.rel;
          }
          return { tagName, attribs: next };
        },
        th: HtmlSanitizerService.cellSpans,
        td: HtmlSanitizerService.cellSpans,
        img: (tagName, attribs) => {
          const next: Record<string, string> = { ...attribs };
          for (const dim of ['width', 'height'] as const) {
            if (next[dim] !== undefined && !/^\d{1,5}$/.test(next[dim])) delete next[dim];
          }
          if (next['data-media-id'] !== undefined && !HtmlSanitizerService.MEDIA_ID.test(next['data-media-id'])) {
            delete next['data-media-id'];
          }
          return { tagName, attribs: next };
        },
      },
      // Drop links with no href and images with no source — copy-paste
      // artifacts, not content.
      exclusiveFilter: frame =>
        (frame.tag === 'a' && !frame.attribs.href) || (frame.tag === 'img' && !frame.attribs.src),
    });

    // Strip genuinely empty paragraphs left behind by editors/copy-paste.
    // Done as a post-process (not exclusiveFilter) so paragraphs that wrap
    // only an <img>/<br> — which have no text of their own — survive.
    return cleaned.replace(/<p>(?:\s|&nbsp;)*<\/p>/gi, '');
  }

  /** Drops a colspan/rowspan that is not a small positive integer. */
  private static cellSpans(tagName: string, attribs: Record<string, string>) {
    const next: Record<string, string> = { ...attribs };
    for (const span of ['colspan', 'rowspan']) {
      if (next[span] !== undefined && !HtmlSanitizerService.SPAN.test(next[span])) delete next[span];
    }
    return { tagName, attribs: next };
  }

  /**
   * Plain text typed into the editor (bare `\n`, no tags) renders as one
   * unbroken line in HTML — browsers collapse literal whitespace. If the
   * content has no block tags yet, treat blank lines as paragraph breaks
   * and single newlines as `<br>` so line breaks actually show up.
   */
  private static autoParagraph(html: string): string {
    if (HtmlSanitizerService.BLOCK_TAG_PATTERN.test(html)) return html;

    return html
      .split(/\n{2,}/)
      .map(block => block.trim())
      .filter(Boolean)
      .map(block => `<p>${block.replace(/\n/g, '<br>')}</p>`)
      .join('');
  }
}
