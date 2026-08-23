import { Ga4AnalyticsService, precedingRange, sourceLabel, toGaRange } from './ga4-analytics.service';
import { toNumber } from './ga4.client';

/**
 * Google Analytics as the source of truth for visitor metrics.
 *
 * The risk this guards is not "does the SDK work" — it is that a number
 * arrives correct from Google and is then mangled on the way to the card:
 * a rate reported as 0.42 rendered as 0.42%, a metric read from the wrong
 * position in GA's parallel arrays, or a delta divided by zero and shown as
 * +100%. Every test below is about that translation.
 */

/** A GA client returning canned reports, keyed by the dimensions requested. */
function stubClient(reports: Record<string, { rows: unknown[]; totals?: Record<string, number> }>) {
  const calls: Record<string, unknown>[] = [];

  const flatten = (key: string) => {
    const report = reports[key] ?? { rows: [] };
    return { rows: report.rows as never[], totals: report.totals ?? {} };
  };

  return {
    calls,
    client: {
      configured: true,
      runReport: async (request: Record<string, unknown>) => {
        calls.push(request);
        return flatten(((request.dimensions as string[]) ?? []).join(',') || 'none');
      },
      runRealtimeReport: async (request: Record<string, unknown>) => {
        calls.push(request);
        return flatten(`rt:${((request.dimensions as string[]) ?? []).join(',') || 'none'}`);
      },
      logFailure: () => undefined,
      clearCache: () => undefined,
    },
  };
}

const row = (dimensions: Record<string, string>, metrics: Record<string, number>) => ({
  dimensions,
  metrics,
});

/* ------------------------------------------------------------ date ranges -- */

describe('translating the dashboard date filter to GA4', () => {
  it('converts an ISO range to the YYYY-MM-DD form GA wants', () => {
    const range = toGaRange({ from: '2026-08-01T00:00:00.000Z', to: '2026-08-07T23:59:59.999Z' });
    expect(range).toEqual({ startDate: '2026-08-01', endDate: '2026-08-07' });
  });

  it('accepts Date objects, which is what the query DTO produces', () => {
    const range = toGaRange({ from: new Date('2026-08-01T00:00:00Z'), to: new Date('2026-08-07T00:00:00Z') });
    expect(range).toEqual({ startDate: '2026-08-01', endDate: '2026-08-07' });
  });

  it('defaults to 28 days, matching GA4 own default', () => {
    // So an unfiltered dashboard and an unfiltered GA report agree. A
    // different default is the easiest way to make two correct systems
    // disagree.
    const range = toGaRange({});
    const start = new Date(`${range.startDate}T00:00:00Z`).getTime();
    const end = new Date(`${range.endDate}T00:00:00Z`).getTime();
    expect(Math.round((end - start) / 86_400_000)).toBe(27);
  });

  it('builds a preceding period of exactly equal length', () => {
    // 7 days (Aug 1-7 inclusive) must compare against 7 days (Jul 25-31),
    // ending the day before. An off-by-one here makes every delta wrong.
    expect(precedingRange('2026-08-01', '2026-08-07')).toEqual({
      startDate: '2026-07-25',
      endDate: '2026-07-31',
    });
  });

  it('handles a single-day range', () => {
    expect(precedingRange('2026-08-07', '2026-08-07')).toEqual({
      startDate: '2026-08-06',
      endDate: '2026-08-06',
    });
  });
});

/* ---------------------------------------------------------------- overview -- */

describe('the overview report', () => {
  const build = () => {
    const { client } = stubClient({
      dateRange: {
        rows: [
          row(
            { dateRange: 'date_range_0' },
            {
              totalUsers: 1200,
              activeUsers: 1100,
              newUsers: 800,
              sessions: 1500,
              screenPageViews: 4200,
              averageSessionDuration: 95.4,
              bounceRate: 0.42,
              engagementRate: 0.58,
            }
          ),
          row(
            { dateRange: 'date_range_1' },
            {
              totalUsers: 1000,
              activeUsers: 900,
              newUsers: 700,
              sessions: 1200,
              screenPageViews: 3000,
              averageSessionDuration: 88,
              bounceRate: 0.5,
              engagementRate: 0.5,
            }
          ),
        ],
      },
    });

    return new Ga4AnalyticsService(client as never);
  };

  it('reports the GA figures unchanged', async () => {
    const result = await build().overview({ from: '2026-08-01', to: '2026-08-07' });

    expect(result.current.visitors).toBe(1200);
    expect(result.current.sessions).toBe(1500);
    expect(result.current.pageViews).toBe(4200);
    expect(result.totalViews).toBe(4200);
  });

  it('converts GA rates from fractions to percentages', async () => {
    // GA returns 0.42; the card renders "42%". Passing it through unchanged
    // is the classic way a dashboard shows a 0.4% bounce rate.
    const result = await build().overview({});

    expect(result.current.bounceRate).toBeCloseTo(42);
    expect(result.current.engagementRate).toBeCloseTo(58);
  });

  it('computes deltas against the preceding period', async () => {
    const result = await build().overview({});
    // 1500 sessions vs 1200 => +25%
    expect(result.deltas.sessions).toBeCloseTo(25);
    // 4200 views vs 3000 => +40%
    expect(result.deltas.pageViews).toBeCloseTo(40);
  });

  it('returns null rather than a fabricated percentage when the base is zero', async () => {
    const { client } = stubClient({
      dateRange: {
        rows: [
          row({ dateRange: 'date_range_0' }, { totalUsers: 50, sessions: 60 }),
          row({ dateRange: 'date_range_1' }, { totalUsers: 0, sessions: 0 }),
        ],
      },
    });

    const result = await new Ga4AnalyticsService(client as never).overview({});
    // A rise from nothing has no percentage. +100% or +∞ would be a fiction.
    expect(result.deltas.visitors).toBeNull();
    expect(result.deltas.sessions).toBeNull();
  });

  it('reports zeros rather than throwing when GA returns no rows', async () => {
    const { client } = stubClient({});
    const result = await new Ga4AnalyticsService(client as never).overview({});

    expect(result.current.visitors).toBe(0);
    expect(result.current.pageViews).toBe(0);
  });

  it('asks GA for both periods in one request', async () => {
    const { client, calls } = stubClient({ dateRange: { rows: [] } });
    await new Ga4AnalyticsService(client as never).overview({ from: '2026-08-01', to: '2026-08-07' });

    expect((calls[0]!.dateRanges as unknown[]).length).toBe(2);
  });
});

/* ---------------------------------------------------------------- realtime -- */

describe('the realtime report', () => {
  it('returns active users, pages, countries and devices', async () => {
    const { client } = stubClient({
      'rt:none': { rows: [], totals: { activeUsers: 37 } },
      'rt:unifiedScreenName': { rows: [row({ unifiedScreenName: '/news/btc' }, { activeUsers: 12 })] },
      'rt:country': { rows: [row({ country: 'Pakistan' }, { activeUsers: 20 })] },
      'rt:deviceCategory': { rows: [row({ deviceCategory: 'mobile' }, { activeUsers: 25 })] },
    });

    const result = await new Ga4AnalyticsService(client as never).realtime();

    expect(result.activeNow).toBe(37);
    expect(result.activePages[0]).toEqual({ path: '/news/btc', viewers: 12 });
    expect(result.countries[0]).toEqual({ key: 'Pakistan', label: 'Pakistan', users: 20 });
    expect(result.devices[0]).toEqual({ key: 'mobile', label: 'Mobile', users: 25 });
  });

  it('reports the 30-minute window GA actually measures', async () => {
    // GA4 realtime covers one window. Interpolating 5- and 15-minute buckets
    // would be inventing numbers Google never reported.
    const { client } = stubClient({ 'rt:none': { rows: [], totals: { activeUsers: 8 } } });
    const result = await new Ga4AnalyticsService(client as never).realtime();

    expect(result.windows).toEqual([{ minutes: 30, users: 8 }]);
  });
});

/* ------------------------------------------------------------------- pages -- */

describe('the pages report', () => {
  it('returns path, title, views, users and per-user engagement time', async () => {
    const { client } = stubClient({
      'pagePath,pageTitle': {
        rows: [
          row(
            { pagePath: '/news/eth-upgrade', pageTitle: 'Ethereum upgrade ships' },
            { screenPageViews: 900, totalUsers: 300, userEngagementDuration: 15_000 }
          ),
        ],
      },
    });

    const [page] = await new Ga4AnalyticsService(client as never).pages({});

    expect(page).toEqual({
      path: '/news/eth-upgrade',
      title: 'Ethereum upgrade ships',
      views: 900,
      users: 300,
      // GA reports total engagement across users; the column means per user.
      engagementTime: 50,
    });
  });

  it('does not divide by zero when a page had no users', async () => {
    const { client } = stubClient({
      'pagePath,pageTitle': {
        rows: [row({ pagePath: '/x', pageTitle: 'X' }, { screenPageViews: 0, totalUsers: 0, userEngagementDuration: 0 })],
      },
    });

    const [page] = await new Ga4AnalyticsService(client as never).pages({});
    expect(page!.engagementTime).toBe(0);
  });
});

/* ----------------------------------------------------------------- sources -- */

describe('traffic source labels', () => {
  it('names the channels an editor recognises from GA', () => {
    expect(sourceLabel('google', 'organic')).toBe('Google Organic Search');
    expect(sourceLabel('(direct)', '(none)')).toBe('Direct');
    expect(sourceLabel('t.co', 'referral')).toBe('Twitter/X');
    expect(sourceLabel('x.com', 'referral')).toBe('Twitter/X');
    expect(sourceLabel('t.me', 'referral')).toBe('Telegram');
  });

  it('falls through to the raw pair rather than forcing a bucket', () => {
    // An unrecognised source must stay identifiable, not become "Other".
    expect(sourceLabel('some-blog.example', 'referral')).toBe('some-blog.example (Referral)');
    expect(sourceLabel('newsletter', 'email')).toBe('newsletter / email');
  });

  it('keeps source and medium distinct in the row key', async () => {
    const { client } = stubClient({
      'sessionSource,sessionMedium': {
        rows: [
          row(
            { sessionSource: 'google', sessionMedium: 'organic' },
            { totalUsers: 500, sessions: 620, screenPageViews: 1400, engagementRate: 0.6, averageSessionDuration: 70 }
          ),
        ],
      },
    });

    const [source] = await new Ga4AnalyticsService(client as never).sources({});

    expect(source!.key).toBe('google / organic');
    expect(source!.label).toBe('Google Organic Search');
    expect(source!.visitors).toBe(500);
    expect(source!.sessions).toBe(620);
    expect(source!.engagementRate).toBeCloseTo(60);
  });
});

/* ------------------------------------------------- geography and devices -- */

describe('geography and devices', () => {
  it('returns countries, regions and cities as available', async () => {
    const { client } = stubClient({
      country: {
        rows: [
          row(
            { country: 'Pakistan' },
            { totalUsers: 400, sessions: 500, screenPageViews: 900, engagementRate: 0.7, averageSessionDuration: 60 }
          ),
        ],
      },
      region: { rows: [] },
      city: { rows: [] },
    });

    const result = await new Ga4AnalyticsService(client as never).geography({});

    expect(result.available).toBe(true);
    expect(result.countries[0]!.label).toBe('Pakistan');
    expect(result.countries[0]!.visitors).toBe(400);
  });

  it('returns the three device categories with display labels', async () => {
    const { client } = stubClient({
      deviceCategory: {
        rows: [
          row({ deviceCategory: 'desktop' }, { totalUsers: 300, sessions: 340, screenPageViews: 800, engagementRate: 0.5, averageSessionDuration: 80 }),
          row({ deviceCategory: 'mobile' }, { totalUsers: 700, sessions: 820, screenPageViews: 1500, engagementRate: 0.6, averageSessionDuration: 55 }),
          row({ deviceCategory: 'tablet' }, { totalUsers: 40, sessions: 45, screenPageViews: 90, engagementRate: 0.4, averageSessionDuration: 65 }),
        ],
      },
    });

    const result = await new Ga4AnalyticsService(client as never).devices({});

    expect(result.map(device => device.label)).toEqual(['Desktop', 'Mobile', 'Tablet']);
    expect(result[1]!.visitors).toBe(700);
  });
});

/* ------------------------------------------------------------ availability -- */

describe('when Google Analytics is not configured', () => {
  it('reports itself unavailable so the controller falls back', async () => {
    const service = new Ga4AnalyticsService({ configured: false } as never);
    expect(service.available).toBe(false);
  });
});

/* -------------------------------------------------------------- primitives -- */

describe('reading GA metric values', () => {
  it('parses the strings GA returns, and treats absence as zero', () => {
    // Every GA metric arrives as a string, and a metric with no data is
    // simply absent — not "0".
    expect(toNumber('4200')).toBe(4200);
    expect(toNumber('0.4237')).toBeCloseTo(0.4237);
    expect(toNumber(undefined)).toBe(0);
    expect(toNumber(null)).toBe(0);
    expect(toNumber('not-a-number')).toBe(0);
  });
});
