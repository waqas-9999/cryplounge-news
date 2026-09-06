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
      ({ IMAGERY_API_URL: 'http://127.0.0.1:4310', IMAGERY_API_KEY: KEY, ...values })[key],
  } as unknown as ConfigService;
  return new ImageryClient(config);
}

/** An error reply: the service reports failures as JSON. */
function mockFetch(status: number, body: unknown, headers: Record<string, string> = {}) {
  return jest.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name: string) =>
        ({ 'content-type': 'application/json', ...headers })[name.toLowerCase()] ?? null,
    },
    json: async () => body,
    arrayBuffer: async () => new ArrayBuffer(0),
  });
}

/**
 * A success reply: raw `image/webp` bytes plus X-CrypLounge-* provenance.
 *
 * This is the shape the deployed service actually returns. The client
 * originally called `response.json()` on it, which threw on binary and turned
 * every successful generation into a generic failure.
 */
function mockImageFetch(bytes = Buffer.from('fake-webp'), headers: Record<string, string> = {}) {
  const merged: Record<string, string> = {
    'content-type': 'image/webp',
    'x-cryplounge-provider': 'nvidia',
    'x-cryplounge-model': 'black-forest-labs/flux.2-klein-4b',
    'x-cryplounge-quality': '78',
    ...headers,
  };
  return jest.fn().mockResolvedValue({
    status: 200,
    ok: true,
    headers: { get: (name: string) => merged[name.toLowerCase()] ?? null },
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.length),
    json: async () => {
      throw new Error('body is binary, not JSON');
    },
  });
}

// Kept so the error-path tests have a body to parse.
const errorBody = { error: 'image generation failed' };

afterEach(() => jest.restoreAllMocks());

describe('configuration', () => {
  it('reports unconfigured when the URL or key is missing', () => {
    expect(client({ IMAGERY_API_URL: undefined }).configured).toBe(false);
    expect(client({ IMAGERY_API_KEY: undefined }).configured).toBe(false);
    expect(client().configured).toBe(true);
  });

  it('fails without calling out when unconfigured', async () => {
    const spy = jest.spyOn(global, 'fetch' as never);
    const result = await client({ IMAGERY_API_URL: undefined }).generate({ headline: 'h' });

    expect(result.approved).toBe(false);
    if (!result.approved) expect(result.failure).toBe('not_configured');
    expect(spy).not.toHaveBeenCalled();
  });
});

describe('a successful generation', () => {
  it('reads the binary image and its provenance headers', async () => {
    global.fetch = mockImageFetch(Buffer.from('fake-webp-bytes')) as never;
    const result = await client().generate({ headline: 'Bitcoin mining facility opens' });

    expect(result.approved).toBe(true);
    if (result.approved) {
      expect(result.candidate.mimeType).toBe('image/webp');
      expect(result.candidate.bytes).toBeInstanceOf(Buffer);
      expect(result.candidate.bytes.toString()).toBe('fake-webp-bytes');
      expect(result.provider).toBe('nvidia');
      expect(result.model).toContain('flux.2-klein-4b');
      expect(result.qualityScore).toBe(78);
    }
  });

  it('does not parse the image body as JSON', async () => {
    // The original defect: response.json() threw on binary, the catch
    // produced null, and a good image was reported as a generic failure.
    const fetchMock = mockImageFetch();
    global.fetch = fetchMock as never;

    const result = await client().generate({ headline: 'h' });
    expect(result.approved).toBe(true);
  });

  it('calls /generate, the path the deployed service exposes', async () => {
    const fetchMock = mockImageFetch();
    global.fetch = fetchMock as never;
    await client().generate({ headline: 'h' });

    expect((fetchMock.mock.calls[0] as [string, RequestInit])[0]).toBe(
      'http://127.0.0.1:4310/generate'
    );
  });

  it('sends the key as a header and never in the body', async () => {
    const fetchMock = mockImageFetch();
    global.fetch = fetchMock as never;
    await client().generate({ headline: 'h' });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${KEY}`);
    expect(init.body as string).not.toContain(KEY);
  });

  it('rejects an empty image body', async () => {
    global.fetch = mockImageFetch(Buffer.alloc(0)) as never;
    expect((await client().generate({ headline: 'h' })).approved).toBe(false);
  });

  it('rejects a 200 that is not an image at all', async () => {
    global.fetch = mockFetch(200, { success: true }) as never;
    expect((await client().generate({ headline: 'h' })).approved).toBe(false);
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
    global.fetch = mockFetch(200, errorBody, { 'content-length': String(50 * 1024 * 1024) }) as never;
    const result = await client().generate({ headline: 'h' });
    expect(result.approved).toBe(false);
  });
});
