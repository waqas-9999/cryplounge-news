import { HtmlSanitizerService } from '../content-core/html-sanitizer.service';

/**
 * The AI newsroom's FAQ and table markup, exactly as cryplounge-ai renders it
 * (`renderFaqBlock` / `renderTables` in src/writing/article-draft.ts),
 * through this CMS's sanitizer.
 *
 * The two repos agree on these shapes by construction, not by sharing code,
 * so this is the test that notices if either side drifts: an AI article whose
 * FAQ or table the CMS quietly strips would show the reader loose text.
 * Sanitizing must leave the markup byte-for-byte unchanged.
 */
const AI_FAQ = "<section data-type=\"faq\"><h2 data-role=\"faq-title\">Frequently asked questions</h2><details data-type=\"faq-item\"><summary>Who does the rule apply to?</summary><div data-role=\"faq-answer\"><p>Firms that hold assets on behalf of clients.</p></div></details><details data-type=\"faq-item\"><summary>Is it 8% &amp; final?</summary><div data-role=\"faq-answer\"><p>Yes, 8% of client assets.</p><p>It takes effect next quarter.</p></div></details></section>";
const AI_TABLE = "<p><strong>The rule at a glance</strong></p><table><tbody><tr><th colspan=\"1\" rowspan=\"1\"><p>Measure</p></th><th colspan=\"1\" rowspan=\"1\"><p>Value</p></th></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>Capital ratio</p></td><td colspan=\"1\" rowspan=\"1\"><p>8%</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>Firms covered</p></td><td colspan=\"1\" rowspan=\"1\"><p>240</p></td></tr></tbody></table>";

describe('AI newsroom markup survives the CMS sanitizer unchanged', () => {
  const sanitizer = new HtmlSanitizerService();

  it('keeps the FAQ block, including escaped text and a two-paragraph answer', () => {
    expect(sanitizer.sanitize(AI_FAQ)).toBe(AI_FAQ);
  });

  it('keeps the table with its caption line, header row and cell spans', () => {
    expect(sanitizer.sanitize(AI_TABLE)).toBe(AI_TABLE);
  });

  it('keeps both inside a narrative body', () => {
    const body = `<p>Lead paragraph.</p>${AI_TABLE}<p>More reporting.</p>${AI_FAQ}`;
    expect(sanitizer.sanitize(body)).toBe(body);
  });
});
