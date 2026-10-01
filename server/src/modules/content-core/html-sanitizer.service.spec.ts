import { HtmlSanitizerService } from './html-sanitizer.service';

/**
 * The article body is untrusted editor input. These tests pin the contract
 * between the structured editor and the database: every block the editor can
 * produce survives intact, and nothing else does.
 */
const s = new HtmlSanitizerService();

const IMAGE =
  '<figure data-type="image" data-align="wide">' +
  '<img src="https://res.cloudinary.com/x/image/upload/a.jpg" alt="Mining rigs" width="1600" height="900" data-media-id="clx9abcd1234efgh" loading="lazy" />' +
  '<figcaption><span data-role="caption">Rigs in Texas.</span><span data-role="credit">Photo: CrypLounge</span></figcaption>' +
  '</figure>';

const FAQ =
  '<section data-type="faq"><h2 data-role="faq-title">Frequently asked questions</h2>' +
  '<details data-type="faq-item"><summary>What happened?</summary><div data-role="faq-answer"><p>An answer.</p></div></details>' +
  '</section>';

const TABLE =
  '<table><thead><tr><th>Desk</th><th colspan="2">Coverage</th></tr></thead>' +
  '<tbody><tr><td>Investing</td><td rowspan="2">Markets</td><td>Daily</td></tr></tbody></table>';

describe('HtmlSanitizerService', () => {
  it('keeps editor tables with their spans', () => {
    const out = s.sanitize(TABLE);
    for (const needle of ['<table>', '<thead>', '<tbody>', '<th>Desk</th>', '<th colspan="2">', '<td rowspan="2">']) {
      expect(out).toContain(needle);
    }
  });

  it('strips table attributes the editor never emits', () => {
    const out = s.sanitize(
      '<table style="position:fixed" onclick="x()" width="9999" background="https://a.test/x.png">' +
        '<tr><td colspan="999" onmouseover="x()" style="color:red">c</td><td rowspan="abc">d</td></tr></table>'
    );
    expect(out).not.toMatch(/style=|onclick|onmouseover|background=|width=|colspan="999"|rowspan="abc"/);
    expect(out).toContain('<td>c</td>');
  });

  it('keeps every block the editor produces', () => {
    const html =
      '<h2>Heading</h2><h3>Sub</h3><h4>Minor</h4><p><strong>b</strong> <em>i</em> <a href="/news/tech">x</a></p>' +
      '<ul><li><p>one</p><ul><li><p>nested</p></li></ul></li></ul><ol><li><p>first</p></li></ol>' +
      '<blockquote><p>Quote</p></blockquote><hr />' +
      IMAGE +
      FAQ;
    const out = s.sanitize(html);
    for (const needle of [
      '<h2>Heading</h2>',
      '<h4>Minor</h4>',
      '<ul><li><p>nested</p></li></ul>',
      '<blockquote><p>Quote</p></blockquote>',
      '<hr />',
      'data-type="image"',
      'data-align="wide"',
      'data-media-id="clx9abcd1234efgh"',
      'width="1600"',
      '<span data-role="caption">Rigs in Texas.</span>',
      '<span data-role="credit">Photo: CrypLounge</span>',
      '<section data-type="faq">',
      '<h2 data-role="faq-title">',
      '<details data-type="faq-item"><summary>What happened?</summary>',
      '<div data-role="faq-answer"><p>An answer.</p></div>',
    ]) {
      expect(out).toContain(needle);
    }
  });

  it('removes scripts, handlers and unknown tags', () => {
    const out = s.sanitize(
      '<p onclick="steal()">hi<script>alert(1)</script></p><iframe src="https://evil.test"></iframe>' +
        '<img src="https://a.test/x.png" onerror="alert(1)" alt="x"><svg><script>1</script></svg><style>p{}</style>'
    );
    expect(out).not.toMatch(/script|onclick|onerror|iframe|svg|style/i);
    expect(out).toContain('<img src="https://a.test/x.png" alt="x" />');
  });

  it('refuses dangerous URL schemes on links and images', () => {
    const out = s.sanitize(
      '<p><a href="javascript:alert(1)">a</a><a href="JaVaScRiPt:alert(1)">b</a><a href="data:text/html,x">c</a>' +
        '<a href="vbscript:x">d</a></p><img src="data:image/svg+xml;base64,AAAA" alt="d"><img src="javascript:alert(1)" alt="j">'
    );
    expect(out).not.toMatch(/javascript|vbscript|data:/i);
    expect(out).not.toContain('<img');
  });

  it('only accepts the exact structured attribute values', () => {
    const out = s.sanitize(
      '<figure data-type="evil" data-align="float-left" style="position:fixed"><img src="https://a.test/x.png" alt="x" width="100%" data-media-id="../../etc" loading="auto" /></figure>' +
        '<section data-type="widget"><div data-role="anything" class="x">t</div></section>' +
        '<span data-role="caption" style="color:red">c</span>'
    );
    expect(out).not.toMatch(/evil|float-left|style=|width="100%"|etc|loading=|widget|anything|class=/);
    expect(out).toContain('<span data-role="caption">c</span>');
  });

  it('forces rel on new-tab links and drops other targets', () => {
    const out = s.sanitize(
      '<p><a href="https://a.test" target="_blank">a</a><a href="https://b.test" target="_top">b</a></p>'
    );
    expect(out).toContain('<a href="https://a.test" target="_blank" rel="noopener noreferrer">a</a>');
    expect(out).toContain('<a href="https://b.test">b</a>');
  });

  it('keeps legacy bodies rendering: bare images, plain figures, plain text', () => {
    expect(s.sanitize('<p><img src="/uploads/a.jpg" alt="a"></p>')).toBe('<p><img src="/uploads/a.jpg" alt="a" /></p>');
    expect(s.sanitize('<figure><img src="https://a.test/x.png" alt="x"><figcaption>Cap</figcaption></figure>')).toBe(
      '<figure><img src="https://a.test/x.png" alt="x" /><figcaption>Cap</figcaption></figure>'
    );
    expect(s.sanitize('Line one\n\nLine two')).toBe('<p>Line one</p><p>Line two</p>');
  });
});
