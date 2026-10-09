import { BadRequestException } from '@nestjs/common';
import { ContentStatus } from '@prisma/client';
import { buildValidationPipe } from '@/common/pipes/validation.pipe';
import { HtmlSanitizerService } from '../content-core/html-sanitizer.service';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto';
import { ArticlesService, cleanSummaryHtml, withoutEditorialFields } from './articles.service';

/**
 * `summaryHtml`: the standfirst with contextual links.
 *
 * `summary` stays the plain-text standfirst that cards, RSS, metadata and
 * JSON-LD read. `summaryHtml` is a linked rendering of the same words, kept
 * only while it is sanitized inline HTML whose text equals `summary`.
 */

const EDITOR: AuthenticatedUser = {
  id: 'user-1',
  email: 'editor@example.invalid',
  role: 'EDITOR',
  permissions: ['news.create', 'news.update', 'news.read'],
} as unknown as AuthenticatedUser;

const CONTEXT = { ip: '127.0.0.1', userAgent: 'jest' } as never;

const SUMMARY = 'The SEC adopted the custody rule on Tuesday, and firms must hold capital from next quarter.';
const LINKED =
  'The SEC <a href="https://www.sec.gov/rules/final" target="_blank" rel="nofollow noopener">adopted the custody rule</a> on Tuesday, ' +
  'and firms must hold capital from next quarter.';

function payload(extra: Record<string, unknown> = {}) {
  return { title: 'Regulator finalises custody rule', summary: SUMMARY, content: '<p>Body.</p>', ...extra };
}

async function validate<T>(dto: new () => T, value: unknown): Promise<T> {
  return buildValidationPipe().transform(value, { type: 'body', metatype: dto }) as Promise<T>;
}

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

  return { service, rows };
}

describe('summaryHtml validation', () => {
  it('accepts inline HTML and rejects oversize values', async () => {
    const dto = await validate(CreateArticleDto, payload({ summaryHtml: LINKED }));
    expect(dto.summaryHtml).toBe(LINKED);
    await expect(validate(CreateArticleDto, payload({ summaryHtml: 'x'.repeat(4001) }))).rejects.toBeInstanceOf(BadRequestException);
  });

  it('is optional: a client that never sends it is unchanged', async () => {
    const dto = await validate(CreateArticleDto, payload());
    expect(dto.summaryHtml).toBeUndefined();
  });
});

describe('cleanSummaryHtml', () => {
  it('keeps a researched source link and an internal link', () => {
    const html =
      'The <a href="https://www.sec.gov/rules/final" target="_blank" rel="nofollow noopener">SEC rule</a> follows ' +
      '<a href="https://cryplounge.com/news/regulation/earlier-story">earlier coverage</a>.';
    const clean = cleanSummaryHtml(html, 'The SEC rule follows earlier coverage.')!;
    expect(clean).toContain(
      '<a href="https://www.sec.gov/rules/final" target="_blank" rel="nofollow noopener noreferrer">SEC rule</a>'
    );
    expect(clean).toContain('<a href="https://cryplounge.com/news/regulation/earlier-story">earlier coverage</a>');
  });

  it('keeps site-relative internal links', () => {
    const clean = cleanSummaryHtml('See <a href="/news/markets/story">the earlier report</a>.', 'See the earlier report.');
    expect(clean).toBe('See <a href="/news/markets/story">the earlier report</a>.');
  });

  it('refuses unsafe schemes: javascript, data, http, protocol-relative', () => {
    for (const href of ['javascript:alert(1)', 'data:text/html,x', 'http://insecure.example/x', '//evil.example/x']) {
      expect(cleanSummaryHtml(`Read <a href="${href}">the rule</a> now.`, 'Read the rule now.')).toBeNull();
    }
  });

  it('strips scripts, handlers, styles, images and block tags but keeps the words', () => {
    const clean = cleanSummaryHtml(
      'A <a href="https://a.example/x" onclick="x()" style="color:red">link</a> <img src=x onerror=y>here <h2>now</h2>.',
      'A link here now.'
    )!;
    expect(clean).toBe('A <a href="https://a.example/x">link</a> here now.');
  });

  it('drops the HTML when its words differ from summary', () => {
    expect(cleanSummaryHtml('Different <a href="https://a.example/x">words</a> entirely.', SUMMARY)).toBeNull();
  });

  it('drops the HTML when no link is left, so unlinked summaries render as before', () => {
    expect(cleanSummaryHtml('Plain <strong>words</strong> only.', 'Plain words only.')).toBeNull();
  });

  it('compares decoded text, so ampersands and quotes still match', () => {
    const clean = cleanSummaryHtml('S&amp;P said <a href="https://a.example/x">"yes"</a> to the ETF.', 'S&P said "yes" to the ETF.');
    expect(clean).toContain('<a href="https://a.example/x">');
  });
});

describe('summaryHtml persistence and serialization', () => {
  it('stores it and reads it back while summary stays plain text', async () => {
    const { service } = harness();
    const created = (await service.create(
      await validate(CreateArticleDto, payload({ summaryHtml: LINKED })),
      EDITOR,
      CONTEXT
    )) as Record<string, unknown>;

    const read = (await service.findById(created.id as string)) as Record<string, unknown>;
    expect(read.summary).toBe(SUMMARY);
    expect(read.summary).not.toMatch(/</);
    expect(read.summaryHtml).toContain('<a href="https://www.sec.gov/rules/final"');
  });

  it('survives an unrelated update, and is cleared when summary is edited without it', async () => {
    const { service } = harness();
    const created = (await service.create(
      await validate(CreateArticleDto, payload({ summaryHtml: LINKED })),
      EDITOR,
      CONTEXT
    )) as Record<string, unknown>;
    const id = created.id as string;

    await service.update(id, await validate(UpdateArticleDto, { title: 'A new headline for this story' }), EDITOR, CONTEXT);
    expect(((await service.findById(id)) as Record<string, unknown>).summaryHtml).toContain('<a ');

    await service.update(id, await validate(UpdateArticleDto, { summary: 'An editor rewrote the standfirst by hand.' }), EDITOR, CONTEXT);
    const edited = (await service.findById(id)) as Record<string, unknown>;
    expect(edited.summary).toBe('An editor rewrote the standfirst by hand.');
    expect(edited.summaryHtml).toBeNull();
  });

  it('is part of the public read (unlike sources), and absent on older articles', async () => {
    const { service, rows } = harness();
    rows.set('new', {
      id: 'new', slug: 'new', status: ContentStatus.PUBLISHED, deletedAt: null,
      summaryHtml: LINKED, sources: [{ name: 'x', url: 'https://a.example' }],
    });
    rows.set('old', { id: 'old', slug: 'old', status: ContentStatus.PUBLISHED, deletedAt: null, content: '<p>Old.</p>' });

    const publicNew = withoutEditorialFields((await service.findBySlug('new')) as never) as Record<string, unknown>;
    expect(publicNew.summaryHtml).toBe(LINKED);
    expect(publicNew).not.toHaveProperty('sources');

    const publicOld = withoutEditorialFields((await service.findBySlug('old')) as never) as Record<string, unknown>;
    expect(publicOld.summaryHtml ?? null).toBeNull();
  });
});
