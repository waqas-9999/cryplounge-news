import { ServiceUnavailableException } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';

/**
 * Falling back from Google Analytics to the internal counters.
 *
 * The fallback was removed once, for a good reason: internal event counts
 * were being presented as visitor analytics, so a broken GA integration
 * looked like a drop in traffic rather than a bug. Restoring it without
 * fixing that would recreate the problem.
 *
 * What makes it safe is the label. Both paths are tagged, so a number is
 * always attributable to the system that produced it. These tests hold the
 * labelling as tightly as the fallback itself — an unlabelled internal
 * response is the failure, not a missing one.
 */

const RANGE = { from: '2026-08-01', to: '2026-09-01' } as never;

const GA_REPORT = { from: new Date(), to: new Date(), totalViews: 42 };
const INTERNAL_REPORT = { from: new Date(), to: new Date(), totalViews: 24086 };

function build(options: {
  available?: boolean;
  gaFails?: boolean;
  internalFails?: boolean;
} = {}) {
  const logFailure = jest.fn();

  const analytics = {
    overview: jest.fn(async () => {
      if (options.internalFails) throw new Error('relation "AnalyticsEvent" does not exist');
      return INTERNAL_REPORT;
    }),
    realtime: jest.fn(async () => INTERNAL_REPORT),
  };

  const ga4 = {
    available: options.available ?? true,
    overview: jest.fn(async () => {
      if (options.gaFails) throw new Error('PERMISSION_DENIED on properties/549997990');
      return GA_REPORT;
    }),
    realtime: jest.fn(async () => GA_REPORT),
  };

  const controller = new AnalyticsController(
    analytics as never,
    { geography: jest.fn() } as never,
    ga4 as never,
    { logFailure } as never
  );

  return { controller, analytics, ga4, logFailure };
}

/* ------------------------------------------------------------ the happy -- */

describe('when Google Analytics answers', () => {
  it('uses GA and says so', async () => {
    const { controller, analytics } = build();
    const result = await controller.overview(RANGE);

    expect(result.source).toBe('ga4');
    expect(result.totalViews).toBe(42);
    // The internal query is not run when GA succeeds.
    expect(analytics.overview).not.toHaveBeenCalled();
  });
});

/* --------------------------------------------------------- the fallback -- */

describe('when Google Analytics cannot answer', () => {
  it('falls back to internal counters when GA is unconfigured', async () => {
    const { controller, ga4 } = build({ available: false });
    const result = await controller.overview(RANGE);

    expect(result.source).toBe('internal');
    expect(result.totalViews).toBe(24086);
    expect(ga4.overview).not.toHaveBeenCalled();
  });

  it('falls back when the GA call itself fails', async () => {
    const { controller, logFailure } = build({ gaFails: true });
    const result = await controller.overview(RANGE);

    expect(result.source).toBe('internal');
    // Still recorded: a failing integration must remain visible in the logs
    // even though the page no longer breaks.
    expect(logFailure).toHaveBeenCalled();
  });

  it('never labels internal figures as GA', async () => {
    // The whole point. 24,086 internal events must not read as 24,086
    // Google-measured pageviews.
    for (const options of [{ available: false }, { gaFails: true }]) {
      const { controller } = build(options);
      const result = await controller.overview(RANGE);

      expect(result.source).not.toBe('ga4');
      expect(result.source).toBe('internal');
    }
  });
});

/* ------------------------------------------------- what still fails loud -- */

describe('failures that must not be absorbed', () => {
  it('propagates an internal database error rather than inventing data', async () => {
    // A bug in our own query is not Google's problem, and hiding it would
    // replace one silent failure with another.
    const { controller } = build({ available: false, internalFails: true });

    await expect(controller.overview(RANGE)).rejects.toThrow(/AnalyticsEvent/);
  });

  it('still raises 503 for a GA-only report with no internal equivalent', async () => {
    const { controller } = build({ available: false });

    await expect(
      (controller as never as { fromGa: (r: string, run: () => Promise<object>) => Promise<object> })
        .fromGa('search', async () => ({}))
    ).rejects.toThrow(ServiceUnavailableException);
  });
});

/* ------------------------------------------------------------- secrets -- */

describe('what reaches the client', () => {
  it('carries no credential material', async () => {
    const { controller } = build({ available: false });
    const result = await controller.overview(RANGE);
    const body = JSON.stringify(result);

    for (const secret of ['private_key', 'BEGIN PRIVATE KEY', 'client_email', 'service_account']) {
      expect(body).not.toContain(secret);
    }
  });

  it('reports a GA failure without echoing Google\'s raw message', async () => {
    const { controller } = build({ gaFails: true });
    const result = await controller.overview(RANGE);

    // The upstream error mentioned the property id; the response must not.
    expect(JSON.stringify(result)).not.toContain('549997990');
  });
});
