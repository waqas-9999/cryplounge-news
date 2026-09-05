import { ConfigService } from '@nestjs/config';
import { ImageryClient } from './imagery.client';

/**
 * The CMS transport client.
 *
 * The properties worth pinning down are all about what must *not* happen: the
 * internal key must not travel in a body or reach a browser, an editorial
 * rejection must not be reported as an outage, and no failure mode may return
 * something the caller could mistake for an approved image.
 */

const KEY = 'internal-test-key-not-a-real-credential';

function client(values: Record<string, string | undefined> = {}) {
  const config = {
    get: (key: string) =>
      ({ AI_IMAGERY_URL: 'http://127.0.0.1:4310', AI_IMAGERY_API_KEY: KEY, ...values })[key],
  } as unknown as ConfigService;
  return new ImageryClient(config);
}

function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  return jest.fn().mockResolvedValue({
    status,
    headers: { get: (name: string) => headers[name.toLowerCase()] ?? null },
    json: async () => body,
  });
}

const approved = {
  success: true,
  status: 'approved',
  image: { data: 'AAAA', mimeType: 'image/webp', width: 1920, height: 1080 },
  provider: 'nvidia',
  model: 'flux',
  qualityScore: 78,
  durationMs: 4200,
};

afterEach(() => jest.restoreAllMocks());

describe('configuration', () => {
  it('reports unconfigured when the URL or key is missing', () => {
    expect(client({ AI_IMAGERY_URL: undefined }).configured).toBe(false);
    expect(client({ AI_IMAGERY_API_KEY: undefined }).configured).toBe(false);
    expect(client().configured).toBe(true);
  });

  it('fails without calling out when unconfigured', async () => {
    const spy = jest.spyOn(global, 'fetch' as never);
    const result = await client({ AI_IMAGERY_URL: undefined }).generate({ headline: 'h' });

    expect(result.approved).toBe(false);
    if (!result.approved) expect(result.failure).toBe('not_configured');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('a successful generation', () => {
  it('returns the candidate and its provenance', async () => {
    global.fetch = mockFetch(200, approved) as never;
    const result = await client().generate({ headline: 'Bitcoin mining facility opens' });

    expect(result.approved).toBe(true);
    if (result.approved) {
      expect(result.candidate.mimeType).toBe('image/webp');
      expect(result.provider).toBe('nvidia');
      expect(result.qualityScore).toBe(78);
    }
  });

  it('sends the key as a header and never in the body', async () => {
    const fetchMock = mockFetch(200, approved);
    global.fetch = fetchMock as never;
    await client().generate({ headline: 'h' });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    expect(init.body as string).not.toContain(KEY);
  });

  it('rejects a 200 that carries no usable image', async () => {
    global.fetch = mockFetch(200, { success: true, image: { data: '', mimeType: 'text/html' } }) as never;
    const result = await client().generate({ headline: 'h' });
    expect(result.approved).toBe(false);
  });
});

describe('failures are classified, not conflated', () => {
  it.each([
    [401, 'unauthorized'],
    [400, 'invalid_request'],
    [429, 'rate_limited'],
    [500, 'unavailable'],
    [503, 'unavailable'],
  ])('maps HTTP %i to %s', async (status, failure) => {
    global.fetch = mockFetch(status, { error: 'nope' }) as never;
    const result = await client().generate({ headline: 'h' });

    expect(result.approved).toBe(false);
    if (!result.approved) expect(result.failure).toBe(failure);
  });

  it('treats 422 as an editorial rejection and keeps the reasons', async () => {
    // The distinction that matters to an editor: the pipeline ran and said no.
    global.fetch = mockFetch(422, {
      success: false,
      status: 'rejected',
      reasons: ['the image contains a chart or graph'],
    }) as never;

    const result = await client().generate({ headline: 'h' });
    expect(result.approved).toBe(false);
    if (!result.approved) {
      expect(result.failure).toBe('rejected');
      expect(result.reasons.join(' ')).toMatch(/chart/i);
    }
  });

  it('reports a timeout as a timeout', async () => {
    global.fetch = jest.fn().mockRejectedValue(
      Object.assign(new Error('aborted'), { name: 'AbortError' })
    ) as never;

    const result = await client().generate({ headline: 'h' });
    expect(result.approved).toBe(false);
    if (!result.approved) expect(result.failure).toBe('timeout');
  });

  it('reports an unreachable service without leaking the key, in logs or result', async () => {
    // Regression: the raw error message used to be logged verbatim, so an
    // error echoing a credentialled URL would have written the key to a log.
    const warn = jest.spyOn(require('@nestjs/common').Logger.prototype, 'warn').mockImplementation(() => undefined);
    global.fetch = jest.fn().mockRejectedValue(new Error(`connect ECONNREFUSED ${KEY}`)) as never;
    const result = await client().generate({ headline: 'h' });

    const logged = warn.mock.calls.map(call => String(call[0])).join(' ');
    expect(logged).not.toContain(KEY);
    expect(logged).toContain('[REDACTED]');

    expect(result.approved).toBe(false);
    if (!result.approved) {
      expect(result.failure).toBe('unavailable');
      expect(JSON.stringify(result.reasons)).not.toContain(KEY);
    }
  });

  it('refuses an oversized response', async () => {
    global.fetch = mockFetch(200, approved, { 'content-length': String(50 * 1024 * 1024) }) as never;
    const result = await client().generate({ headline: 'h' });
    expect(result.approved).toBe(false);
  });
});
