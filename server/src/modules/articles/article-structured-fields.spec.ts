import { BadRequestException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { buildValidationPipe } from '@/common/pipes/validation.pipe';
import { HtmlSanitizerService } from '../content-core/html-sanitizer.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ArticlesService, cleanKeyPoints, cleanSources, withoutEditorialFields } from './articles.service';

/**
 * Key points, sources, tables and FAQs, end to end through the API layer.
 *
 * The rule these exist to enforce: nothing the editor collects is silently
 * lost. A field the workspace sends must pass the real validation pipe, be
 * stored, and come back on the next read — and a table or FAQ in the body must
 * survive the server sanitizer unchanged, or the editor would show content
 * that disappears on save.
 *
 * Tables and FAQs live in the body HTML (the editor's own markup), so they are
 * covered here as a round trip through `create` → read → `update` → read, on
 * top of the shape-by-shape tests in html-sanitizer.service.spec.ts.
 */

/* ------------------------------------------------------------- fixtures --- */

const EDITOR: AuthenticatedUser = {
  id: 'user-1',
  email: 'editor@example.invalid',
  role: 'EDITOR',
  permissions: ['news.create', 'news.update', 'news.read'],
} as unknown as AuthenticatedUser;

const CONTEXT = { ip: '127.0.0.1', userAgent: 'jest' } as never;

/** Exactly the markup the editor emits for a table and an FAQ block. */
const TABLE =
  '<table><tbody>' +
  '<tr><th colspan="1" rowspan="1"><p>Asset</p></th><th colspan="1" rowspan="1"><p>Price</p></th></tr>' +
  '<tr><td colspan="1" rowspan="1"><p>BTC</p></td><td colspan="1" rowspan="1"><p>$64,000</p></td></tr>' +
  '<tr><td colspan="1" rowspan="1"><p>ETH</p></td><td colspan="1" rowspan="1"><p>$3,100</p></td></tr>' +
  '</tbody></table>';

const FAQ =
  '<section data-type="faq"><h2 data-role="faq-title">Frequently asked questions</h2>' +
  '<details data-type="faq-item"><summary>What changed?</summary>' +
  '<div data-role="faq-answer"><p>The rule was finalised on <strong>Tuesday</strong>.</p></div></details>' +
  '<details data-type="faq-item"><summary>When does it apply?</summary>' +
  '<div data-role="faq-answer"><p>From the start of next quarter.</p></div></details>' +
  '</section>';

const BODY = `<p>Lead paragraph.</p>${TABLE}<h2>Background</h2><p>More reporting.</p>${FAQ}`;

/** A minimal valid create payload, as the workspace sends it. */
function payload(extra: Record<string, unknown> = {}) {
  return { title: 'Regulator finalises custody rule', summary: 'A summary.', content: BODY, ...extra };
}

/** The production pipe: whitelist + forbidNonWhitelisted + transform. */
async function validate<T>(dto: new () => T, value: unknown): Promise<T> {
  return buildValidationPipe().transform(value, { type: 'body', metatype: dto }) as Promise<T>;
}

async function rejects(dto: new () => unknown, value: unknown): Promise<void> {
  await expect(validate(dto, value)).rejects.toBeInstanceOf(BadRequestException);
}

/**
 * The real ArticlesService over an in-memory article table, so a value has to
 * survive the actual write path (scalars, sanitizer) to be read back.
 */
function harness() {
  const rows = new Map<string, Record<string, unknown>>();
  let seq = 0;

  const prisma = {
    article: {
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const id = `article-${++seq}`;
        const row = { id, deletedAt: null, publishedAt: null, scheduledFor: null, sources: [], keyPoints: [], ...data };
        delete (row as Record<string, unknown>).versions;
        rows.set(id, row);
        return { ...row };
      }),
      update: jest.fn(async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
        const next = { ...rows.get(where.id)!, ...data };
        delete (next as Record<string, unknown>).versions;
        rows.set(where.id, next);
        return { ...next };
      }),
      findFirst: jest.fn(async ({ where }: { where: Record<string, unknown> }) => {
        for (const row of rows.values()) {
          if (where.id !== undefined && row.id !== where.id) continue;
          if (where.slug !== undefined && row.slug !== where.slug) continue;
          if (where.status !== undefined && row.status !== where.status) continue;
          return { ...row };
        }
        return null;
      }),
    },
  };

  const service = new ArticlesService(
    prisma as never,
    { unique: jest.fn(async (_kind: string, value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-')) } as never,
    {
      resolveDates: jest.fn(() => ({ publishedAt: null, scheduledFor: null })),
      assertTransition: jest.fn(),
      requiresPublishPermission: jest.fn((status: ContentStatus) =>
        status === ContentStatus.PUBLISHED || status === ContentStatus.SCHEDULED
      ),
    } as never,
    { buildConnect: jest.fn(() => ({})), buildSet: jest.fn(() => ({})) } as never,
    { record: jest.fn(), diff: jest.fn(() => ({})) } as never,
    new HtmlSanitizerService(),
    {} as never
  );

  return { service, prisma, rows };
}

/* ------------------------------------------------------------ key points --- */

describe('Key points', () => {
  it('accepts up to eight plain-text lines', async () => {
    const dto = await validate(CreateArticleDto, payload({ keyPoints: ['One', 'Two', 'Three'] }));
    expect(dto.keyPoints).toEqual(['One', 'Two', 'Three']);
  });

  it('rejects more than eight', async () => {
    await rejects(CreateArticleDto, payload({ keyPoints: Array.from({ length: 9 }, (_, i) => `Point ${i}`) }));
  });

  it('rejects a line over 200 characters', async () => {
    await rejects(CreateArticleDto, payload({ keyPoints: ['x'.repeat(201)] }));
  });

  it('rejects a malformed payload', async () => {
    await rejects(CreateArticleDto, payload({ keyPoints: 'not an array' }));
    await rejects(CreateArticleDto, payload({ keyPoints: [{ text: 'object, not string' }] }));
    await rejects(CreateArticleDto, payload({ keyPoints: [42] }));
  });

  it('stores plain text: blank lines dropped, markup and control characters removed', () => {
    expect(cleanKeyPoints(['  First  ', '', '   ', '<b>Bold</b> claim', 'Line\u0000with\u001fcontrol'])).toEqual([
      'First',
      'bBold/b claim',
      'Line with control',
    ]);
  });

  it('keeps the order the editor chose', () => {
    expect(cleanKeyPoints(['Third', 'First', 'Second'])).toEqual(['Third', 'First', 'Second']);
  });
});

/* -------------------------------------------------------------- sources --- */

describe('Sources', () => {
  const SEC = { name: 'SEC filing', url: 'https://www.sec.gov/filing', note: 'Form 8-K' };

  it('accepts name, http(s) URL and an optional note', async () => {
    const dto = await validate(CreateArticleDto, payload({ sources: [SEC, { name: 'Report', url: 'http://example.org/r' }] }));
    expect(dto.sources).toHaveLength(2);
  });

  it('rejects an unsafe or non-web URL', async () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'ftp://example.org/x', 'not a url', '//example.org/x']) {
      await rejects(CreateArticleDto, payload({ sources: [{ name: 'Bad', url }] }));
    }
  });

  it('rejects an empty name, a missing URL and an unknown field', async () => {
    await rejects(CreateArticleDto, payload({ sources: [{ name: '', url: 'https://example.org' }] }));
    await rejects(CreateArticleDto, payload({ sources: [{ name: 'No URL' }] }));
    // forbidNonWhitelisted: nothing extra rides along in the stored JSON.
    await rejects(CreateArticleDto, payload({ sources: [{ ...SEC, onclick: 'alert(1)' }] }));
  });

  it('rejects more than thirty', async () => {
    await rejects(CreateArticleDto, payload({ sources: Array.from({ length: 31 }, () => SEC) }));
  });

  it('stores only the three known fields, trimmed', () => {
    expect(cleanSources([{ name: '  SEC  ', url: ' https://www.sec.gov/x ', note: '   ' }])).toEqual([
      { name: 'SEC', url: 'https://www.sec.gov/x' },
    ]);
  });
});

/* ----------------------------------------------------- round trip, real API --- */

describe('create → read → update → read keeps all four intact', () => {
  it('stores key points, sources and the table/FAQ body, and reads them back unchanged', async () => {
    const { service } = harness();

    const dto = await validate(
      CreateArticleDto,
      payload({
        keyPoints: ['Custodians must hold capital.', 'The rule takes effect next quarter.'],
        sources: [{ name: 'SEC filing', url: 'https://www.sec.gov/filing', note: 'Form 8-K' }],
      })
    );
    const created = (await service.create(dto, EDITOR, CONTEXT)) as Record<string, unknown>;

    const read = (await service.findById(created.id as string)) as Record<string, unknown>;
    expect(read.keyPoints).toEqual(['Custodians must hold capital.', 'The rule takes effect next quarter.']);
    expect(read.sources).toEqual([{ name: 'SEC filing', url: 'https://www.sec.gov/filing', note: 'Form 8-K' }]);
    // The body the editor saved is the body that comes back: table and FAQ intact.
    expect(read.content).toBe(BODY);

    const update = await validate(UpdateArticleDto, {
      keyPoints: ['Revised point.'],
      sources: [],
      content: `${BODY}<p>Update.</p>`,
    });
    await service.update(created.id as string, update, EDITOR, CONTEXT);

    const reread = (await service.findById(created.id as string)) as Record<string, unknown>;
    expect(reread.keyPoints).toEqual(['Revised point.']);
    expect(reread.sources).toEqual([]);
    expect(reread.content).toBe(`${BODY}<p>Update.</p>`);
  });

  it('leaves key points and sources alone when an update does not mention them', async () => {
    const { service } = harness();
    const created = (await service.create(
      await validate(CreateArticleDto, payload({ keyPoints: ['Kept.'], sources: [{ name: 'Kept', url: 'https://example.org' }] })),
      EDITOR,
      CONTEXT
    )) as Record<string, unknown>;

    await service.update(created.id as string, await validate(UpdateArticleDto, { title: 'New headline' }), EDITOR, CONTEXT);

    const read = (await service.findById(created.id as string)) as Record<string, unknown>;
    expect(read.keyPoints).toEqual(['Kept.']);
    expect(read.sources).toEqual([{ name: 'Kept', url: 'https://example.org' }]);
  });

  it('reads an older article with neither field as empty lists', async () => {
    const { service, rows } = harness();
    rows.set('legacy', { id: 'legacy', slug: 'legacy', status: ContentStatus.PUBLISHED, content: '<p>Old.</p>', deletedAt: null });
    const read = (await service.findBySlug('legacy')) as Record<string, unknown>;
    expect(read.content).toBe('<p>Old.</p>');
    expect(read.keyPoints ?? []).toEqual([]);
  });
});

/* -------------------------------------------- sources stay editorial-only --- */

describe('sources are not exposed publicly', () => {
  it('omits sources from the public slug read, keeps key points', async () => {
    const { service, rows } = harness();
    rows.set('a1', {
      id: 'a1',
      slug: 'story',
      status: ContentStatus.PUBLISHED,
      deletedAt: null,
      keyPoints: ['Shown publicly.'],
      sources: [{ name: 'SEC filing', url: 'https://www.sec.gov/x' }],
    });

    const pub = (await service.findBySlug('story', false)) as Record<string, unknown>;
    expect(pub).not.toHaveProperty('sources');
    expect(pub.keyPoints).toEqual(['Shown publicly.']);
  });

  it('keeps sources for admin reads, which the editor needs to reload them', async () => {
    const { service, rows } = harness();
    rows.set('a1', { id: 'a1', slug: 'story', status: ContentStatus.DRAFT, deletedAt: null, sources: [{ name: 'S', url: 'https://x.example' }] });
    expect(((await service.findById('a1')) as Record<string, unknown>).sources).toHaveLength(1);
    expect(((await service.findBySlug('story', true)) as Record<string, unknown>).sources).toHaveLength(1);
  });

  it('withoutEditorialFields removes only sources', () => {
    expect(withoutEditorialFields({ id: 'x', title: 't', keyPoints: ['k'], sources: [{ name: 'n', url: 'u' }] })).toEqual({
      id: 'x',
      title: 't',
      keyPoints: ['k'],
    });
  });
});

/* -------------------------------------------- body security via the service --- */

describe('tables and FAQs survive; hostile markup does not', () => {
  it('strips scripts, handlers and javascript: URLs from a body that also has a table and FAQ', async () => {
    const { service } = harness();
    const hostile =
      '<p onclick="alert(1)">Lead</p><script>alert(1)</script>' +
      TABLE.replace('<td colspan="1" rowspan="1"><p>BTC</p></td>', '<td colspan="1" rowspan="1" onmouseover="x()"><p>BTC</p><img src="x" onerror="alert(1)"></td>') +
      '<a href="javascript:alert(1)">bad link</a>' +
      FAQ.replace('<summary>What changed?</summary>', '<summary>What changed?<iframe src="https://evil.example"></iframe></summary>');

    const created = (await service.create(await validate(CreateArticleDto, payload({ content: hostile })), EDITOR, CONTEXT)) as Record<string, unknown>;
    const content = created.content as string;

    expect(content).not.toMatch(/<script|onclick|onmouseover|onerror|javascript:|<iframe/i);
    // The legitimate structure is still there.
    expect(content).toContain('<table>');
    expect(content).toContain('<th colspan="1" rowspan="1"><p>Asset</p></th>');
    expect(content).toContain('<section data-type="faq">');
    expect(content).toContain('<details data-type="faq-item"><summary>What changed?</summary>');
  });

  it('keeps every row and column of the table', async () => {
    const { service } = harness();
    const created = (await service.create(await validate(CreateArticleDto, payload({ content: TABLE })), EDITOR, CONTEXT)) as Record<string, unknown>;
    const content = created.content as string;
    expect(content.match(/<tr>/g)).toHaveLength(3);
    expect(content.match(/<t[hd] /g)).toHaveLength(6);
  });

  it('drops a table attribute the editor never emits, and an oversized span', async () => {
    const { service } = harness();
    const created = (await service.create(
      await validate(CreateArticleDto, payload({ content: '<table style="width:9999px" border="1"><tbody><tr><td colspan="999">x</td></tr></tbody></table>' })),
      EDITOR,
      CONTEXT
    )) as Record<string, unknown>;
    const content = created.content as string;
    expect(content).not.toMatch(/style=|border=|colspan="999"/);
    expect(content).toContain('<td>x</td>');
  });
});
