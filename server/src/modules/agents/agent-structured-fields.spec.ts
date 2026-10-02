import { BadRequestException } from '@nestjs/common';
import { buildValidationPipe } from '@/common/pipes/validation.pipe';
import { SubmitArticleDto } from './dto/submit-article.dto';
import { AgentsService, type AgentContext } from './agents.service';

/**
 * An AI agent's key points, FAQs and sources reach the article row.
 *
 * The production failure this pins: SubmitArticleDto accepted all three, but
 * `submitArticle` builds its Prisma `create` field by field and listed none of
 * them, so every AI article reached the CMS with empty Key Points, FAQs and
 * Sources — validation passed and the data vanished, with no error anywhere.
 * The admin save path was fine; only the agent path dropped them.
 *
 * These drive the real `submitArticle` through the real validation pipe and
 * read back exactly what was handed to the database.
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

/** The payload the AI newsroom sends with both structured switches on. */
const PAYLOAD = {
  title: 'Regulator finalises custody rule for client assets',
  slug: 'regulator-finalises-custody-rule',
  summary: 'Firms holding client assets must set aside capital once the rule takes effect next quarter.',
  content: '<p>The Commission adopted a final custody rule on Tuesday.</p>',
  readMinutes: 3,
  keyPoints: ['The Commission adopted a final custody rule.', 'Custodians face capital requirements.'],
  faqs: [
    { question: 'Who does the rule apply to?', answer: 'Firms that hold assets on behalf of clients.' },
    { question: 'When does it take effect?', answer: 'At the start of the next quarter.' },
  ],
  sources: [{ name: 'SEC', url: 'https://www.sec.gov/a', note: 'Final rule' }],
};

async function submit(body: Record<string, unknown>) {
  const dto = (await buildValidationPipe().transform(body, { type: 'body', metatype: SubmitArticleDto })) as SubmitArticleDto;
  const { service, created } = harness();
  await service.submitArticle(AGENT, dto);
  return created[0]!;
}

describe('agent article submission writes the structured fields', () => {
  it('stores key points, FAQs and sources from the AI payload', async () => {
    const data = await submit(PAYLOAD);
    expect(data.keyPoints).toEqual(PAYLOAD.keyPoints);
    expect(data.faqs).toEqual(PAYLOAD.faqs);
    expect(data.sources).toEqual(PAYLOAD.sources);
  });

  it('keeps FAQs and key points out of the body: content is stored exactly as sent', async () => {
    const data = await submit(PAYLOAD);
    expect(data.content).toBe(PAYLOAD.content);
  });

  it('cleans them as the admin save does: plain text, no markup', async () => {
    const data = await submit({
      ...PAYLOAD,
      keyPoints: ['<b>Bold</b> claim'],
      faqs: [{ question: '<i>When?</i>', answer: 'Soon.\n\n<script>x</script> Later.' }],
    });
    expect(data.keyPoints).toEqual(['bBold/b claim']);
    expect(data.faqs).toEqual([{ question: 'iWhen?/i', answer: 'Soon.\n\nscriptx/script Later.' }]);
  });

  it('leaves the fields unset when an older agent payload omits them', async () => {
    const { keyPoints: _k, faqs: _f, sources: _s, ...older } = PAYLOAD;
    const data = await submit(older);
    expect(data).not.toHaveProperty('keyPoints');
    expect(data).not.toHaveProperty('faqs');
    expect(data).not.toHaveProperty('sources');
  });

  it('still rejects malformed structured fields before anything is written', async () => {
    for (const bad of [
      { faqs: [{ question: '', answer: 'a' }] },
      { sources: [{ name: 'Bad', url: 'javascript:alert(1)' }] },
      { keyPoints: ['x'.repeat(201)] },
    ]) {
      await expect(submit({ ...PAYLOAD, ...bad })).rejects.toBeInstanceOf(BadRequestException);
    }
  });

  it('always creates a draft, whatever the payload', async () => {
    const data = await submit(PAYLOAD);
    expect(data.status).toBe('DRAFT');
  });
});
