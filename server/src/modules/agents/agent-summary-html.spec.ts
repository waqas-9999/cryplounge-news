import { buildValidationPipe } from '@/common/pipes/validation.pipe';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { AgentsService, type AgentContext } from './agents.service';

/**
 * An AI agent's linked standfirst reaches the article row, sanitized.
 *
 * `submitArticle` lists its columns one by one (see agent-structured-fields.spec),
 * so a DTO field that is not added there is validated and then silently lost.
 */

const AGENT: AgentContext = {
  id: 'agent-1',
  name: 'CrypLounge AI Newsroom',
  environment: 'production',
  permissions: ['news.create', 'media.upload', 'telemetry.write'],
  defaultPublishMode: 'DRAFT',
};

function harness() {
  const created: Record<string, unknown>[] = [];
  const prisma = {
    article: {
      findFirst: jest.fn(async () => null),
      create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
        created.push(data);
        return { id: 'article-1', title: data.title, slug: data.slug, status: data.status };
      }),
    },
    aiAgent: { update: jest.fn(async () => ({})) },
  };
  const service = new AgentsService(
    prisma as never,
    { unique: jest.fn(async () => 'story-slug') } as never,
    { resolveDates: jest.fn(() => ({ publishedAt: null, scheduledFor: null })) } as never,
    { record: jest.fn() } as never,
    { dispatch: jest.fn() } as never,
    {} as never
  );
  return { service, created };
}

const SUMMARY = 'The Commission adopted a final custody rule on Tuesday.';
const LINKED =
  'The Commission <a href="https://www.sec.gov/a" target="_blank" rel="nofollow noopener">adopted a final custody rule</a> on Tuesday.';

const PAYLOAD = {
  title: 'Regulator finalises custody rule for client assets',
  slug: 'regulator-finalises-custody-rule',
  summary: SUMMARY,
  content: '<p>The Commission adopted a final custody rule on Tuesday.</p>',
  readMinutes: 3,
};

async function submit(body: Record<string, unknown>) {
  const dto = (await buildValidationPipe().transform(body, { type: 'body', metatype: SubmitArticleDto })) as SubmitArticleDto;
  const { service, created } = harness();
  await service.submitArticle(AGENT, dto);
  return created[0]!;
}

describe('agent article submission writes the linked standfirst', () => {
  it('stores sanitized summaryHtml next to the untouched plain summary', async () => {
    const data = await submit({ ...PAYLOAD, summaryHtml: LINKED });
    expect(data.summary).toBe(SUMMARY);
    expect(data.summaryHtml).toBe(
      'The Commission <a href="https://www.sec.gov/a" target="_blank" rel="nofollow noopener noreferrer">adopted a final custody rule</a> on Tuesday.'
    );
  });

  it('never stores unsafe or mismatched HTML', async () => {
    const unsafe = await submit({ ...PAYLOAD, summaryHtml: `<a href="javascript:alert(1)">${SUMMARY}</a>` });
    expect(unsafe.summaryHtml).toBeNull();
    const mismatch = await submit({ ...PAYLOAD, summaryHtml: 'Other <a href="https://www.sec.gov/a">words</a>.' });
    expect(mismatch.summaryHtml).toBeNull();
  });

  it('leaves summaryHtml unset for an older client that does not send it', async () => {
    const data = await submit(PAYLOAD);
    expect(data).not.toHaveProperty('summaryHtml');
  });
});
