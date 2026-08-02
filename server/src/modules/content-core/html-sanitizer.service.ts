import { Injectable } from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes article body HTML before it is persisted.
 *
 * The frontend also sanitizes on render (defense in depth), but content must
 * never reach the database carrying scripts, event handlers or dangerous
 * protocols — anything reading the DB directly (RSS, JSON-LD, future
 * consumers) would otherwise be exposed.
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
  ];

  private static readonly SAFE_PROTOCOLS = ['http', 'https', 'mailto', 'tel'];

  /** Block tags that mean "this is already structured HTML, leave it alone". */
  private static readonly BLOCK_TAG_PATTERN =
    /<(p|h2|h3|h4|ul|ol|li|blockquote|figure|hr)[ >]/i;

  sanitize(html: string): string {
    const withParagraphs = HtmlSanitizerService.autoParagraph(html);

    const cleaned = sanitizeHtml(withParagraphs, {
      allowedTags: HtmlSanitizerService.ALLOWED_TAGS,
      allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'title', 'width', 'height'],
      },
      allowedSchemes: HtmlSanitizerService.SAFE_PROTOCOLS,
      allowProtocolRelative: false,
      // Internal links (`/news/...`) and relative image paths have no
      // scheme — allow them through rather than requiring an absolute URL.
      allowedSchemesAppliedToAttributes: ['href', 'src'],
      transformTags: {
        a: (tagName, attribs) => {
          const rel =
            attribs.target === '_blank' ? 'noopener noreferrer' : attribs.rel;
          return {
            tagName,
            attribs: {
              ...attribs,
              ...(rel ? { rel } : {}),
            },
          };
        },
      },
      // Drop links with no href — a copy-paste artifact, not content.
      exclusiveFilter: frame => frame.tag === 'a' && !frame.attribs.href,
    });

    // Strip genuinely empty paragraphs left behind by editors/copy-paste.
    // Done as a post-process (not exclusiveFilter) so paragraphs that wrap
    // only an <img>/<br> — which have no text of their own — survive.
    return cleaned.replace(/<p>(?:\s|&nbsp;)*<\/p>/gi, '');
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
