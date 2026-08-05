/**
 * Server-side enrichment for analytics events.
 *
 * The browser is not asked for geography or device details — it would be
 * both slower and easy to forge. Instead every event is enriched here from
 * request metadata the edge already provides.
 *
 * Privacy: the raw IP is *never* read, stored, or returned. Geography comes
 * from headers the CDN has already resolved to a coarse country/region/city,
 * which is what `docs`' privacy rule ("aggregated, no PII") requires.
 */

/** Coarse location, as resolved by the CDN edge. All fields optional. */
export interface GeoContext {
  country?: string;
  region?: string;
  city?: string;
}

/** Device shape, parsed from the User-Agent string. */
export interface DeviceContext {
  deviceType?: string;
  browser?: string;
  os?: string;
}

export type RequestContext = GeoContext & DeviceContext;

/** Minimal shape we need — avoids coupling to express's `Request` type. */
export interface HeaderCarrier {
  headers: Record<string, string | string[] | undefined>;
}

function header(req: HeaderCarrier, name: string): string | undefined {
  const raw = req.headers[name] ?? req.headers[name.toLowerCase()];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 120) : undefined;
}

/**
 * City headers arrive percent-encoded (Vercel sends `San%20Francisco`).
 * A malformed value must not throw — analytics never breaks a request.
 */
function decode(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Geography from edge headers.
 *
 * Vercel is the deployment target (`server/api/index.ts`), so its headers are
 * checked first; Cloudflare's are accepted as a fallback so a proxy change
 * doesn't silently zero out the geography reports.
 */
export function geoFrom(req: HeaderCarrier): GeoContext {
  const country =
    header(req, 'x-vercel-ip-country') ?? header(req, 'cf-ipcountry') ?? header(req, 'x-geo-country');
  const region =
    header(req, 'x-vercel-ip-country-region') ??
    header(req, 'cf-region-code') ??
    header(req, 'x-geo-region');
  const city = decode(
    header(req, 'x-vercel-ip-city') ?? header(req, 'cf-ipcity') ?? header(req, 'x-geo-city')
  );

  // "XX" is Vercel's placeholder for an unresolvable country. Storing it would
  // create a fake country in the reports, so it is dropped.
  const clean = (v?: string) => (v && v !== 'XX' && v !== 'T1' ? v : undefined);

  return { country: clean(country), region: clean(region), city: clean(city) };
}

/* ------------------------------------------------------------ user agent -- */

/**
 * Order matters throughout: the specific token must be tested before the
 * generic one it contains. Every Chromium browser claims "Chrome", Edge also
 * claims "Chrome" and "Safari", and Safari claims "Safari" only.
 */
const BROWSERS: Array<{ name: string; test: RegExp }> = [
  { name: 'Edge', test: /\bEdgA?i?\/|\bEdg\// },
  { name: 'Opera', test: /\bOPR\/|\bOpera\// },
  { name: 'Samsung Internet', test: /SamsungBrowser\// },
  { name: 'Firefox', test: /\bFxiOS\/|\bFirefox\// },
  { name: 'Chrome', test: /\bCriOS\/|\bChrome\// },
  { name: 'Safari', test: /\bSafari\// },
];

const OPERATING_SYSTEMS: Array<{ name: string; test: RegExp }> = [
  // iPadOS 13+ reports "Macintosh", so iPad must be matched on its own token first.
  { name: 'iOS', test: /\biPhone\b|\biPad\b|\biPod\b/ },
  { name: 'Android', test: /\bAndroid\b/ },
  { name: 'Windows', test: /\bWindows\b/ },
  { name: 'macOS', test: /\bMac OS X\b|\bMacintosh\b/ },
  { name: 'Linux', test: /\bLinux\b|\bX11\b/ },
];

/** Crawlers would otherwise inflate every visitor and session count. */
const BOT = /bot|crawler|spider|crawling|slurp|bingpreview|headless|lighthouse|pingdom|monitor/i;

export function isBot(userAgent: string | undefined): boolean {
  return !!userAgent && BOT.test(userAgent);
}

function deviceTypeFrom(ua: string): string {
  if (/\biPad\b|\bTablet\b|Android(?!.*\bMobile\b)/.test(ua)) return 'tablet';
  if (/\bMobi\b|\bMobile\b|\biPhone\b|\biPod\b|\bAndroid\b/.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Device, browser and OS from the User-Agent header.
 *
 * Deliberately a small hand-rolled matcher rather than a UA-parsing
 * dependency: the reports only ever bucket into the handful of families
 * above, so a full database of device models would be dead weight.
 */
export function deviceFrom(userAgent: string | undefined): DeviceContext {
  if (!userAgent) return {};
  const ua = userAgent.slice(0, 512);

  return {
    deviceType: deviceTypeFrom(ua),
    browser: BROWSERS.find(b => b.test.test(ua))?.name ?? 'Other',
    os: OPERATING_SYSTEMS.find(o => o.test.test(ua))?.name ?? 'Other',
  };
}

/** Everything the server can add to an incoming event. */
export function contextFrom(req: HeaderCarrier): RequestContext {
  return { ...geoFrom(req), ...deviceFrom(header(req, 'user-agent')) };
}

export function userAgentOf(req: HeaderCarrier): string | undefined {
  const raw = req.headers['user-agent'];
  return Array.isArray(raw) ? raw[0] : raw;
}
