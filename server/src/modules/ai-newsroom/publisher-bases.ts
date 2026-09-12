/**
 * Where a source publisher is based — and nothing more.
 *
 * The newsroom records no geography for a story. It knows which publishers
 * reported it, by domain. So the intelligence globe places a story at the base
 * of its lead source: the jurisdiction of a regulator, or the headquarters of
 * a publication. That is a true statement about the source, and it is labelled
 * as exactly that in the UI — "publisher base", never "story location". An SEC
 * release is placed in Washington because the SEC is there, not because the
 * event happened there.
 *
 * Deliberately incomplete. A domain whose base is unclear — distributed
 * outlets, aggregators, platforms like medium.com or github.com — is absent,
 * and its stories are counted as "unmapped" rather than dropped at a guessed
 * point. Adding an entry is a factual claim; keep it to publishers whose base
 * is well established.
 */

export type NewsRegion = 'AMERICAS' | 'EUROPE' | 'MIDDLE_EAST' | 'ASIA' | 'OTHER';

export interface PublisherBase {
  /** Stable key for grouping, e.g. "washington". */
  key: string;
  label: string;
  region: NewsRegion;
  lat: number;
  lon: number;
  basis: 'REGULATOR_JURISDICTION' | 'PUBLISHER_HEADQUARTERS';
}

const WASHINGTON = { key: 'washington', label: 'Washington', region: 'AMERICAS', lat: 38.9072, lon: -77.0369 } as const;
const NEW_YORK = { key: 'new-york', label: 'New York', region: 'AMERICAS', lat: 40.7128, lon: -74.006 } as const;
const LONDON = { key: 'london', label: 'London', region: 'EUROPE', lat: 51.5072, lon: -0.1276 } as const;
const ZUG = { key: 'zug', label: 'Zug', region: 'EUROPE', lat: 47.1662, lon: 8.5155 } as const;

const regulator = (base: Omit<PublisherBase, 'basis'>): PublisherBase => ({
  ...base,
  basis: 'REGULATOR_JURISDICTION',
});
const headquarters = (base: Omit<PublisherBase, 'basis'>): PublisherBase => ({
  ...base,
  basis: 'PUBLISHER_HEADQUARTERS',
});

export const PUBLISHER_BASES: Readonly<Record<string, PublisherBase>> = {
  'sec.gov': regulator(WASHINGTON),
  'cftc.gov': regulator(WASHINGTON),
  'justice.gov': regulator(WASHINGTON),
  'treasury.gov': regulator(WASHINGTON),
  'federalreserve.gov': regulator(WASHINGTON),
  'bls.gov': regulator(WASHINGTON),
  'fca.org.uk': regulator(LONDON),

  'coindesk.com': headquarters(NEW_YORK),
  'theblock.co': headquarters(NEW_YORK),
  'blockworks.co': headquarters(NEW_YORK),
  'decrypt.co': headquarters(NEW_YORK),
  'chainalysis.com': headquarters(NEW_YORK),
  'uniswap.org': headquarters(NEW_YORK),
  'bitcoinmagazine.com': headquarters({
    key: 'nashville',
    label: 'Nashville',
    region: 'AMERICAS',
    lat: 36.1627,
    lon: -86.7816,
  }),
  'pymnts.com': headquarters({ key: 'boston', label: 'Boston', region: 'AMERICAS', lat: 42.3601, lon: -71.0589 }),
  'kraken.com': headquarters({
    key: 'san-francisco',
    label: 'San Francisco',
    region: 'AMERICAS',
    lat: 37.7749,
    lon: -122.4194,
  }),
  'dlnews.com': headquarters(LONDON),
  'aave.com': headquarters(LONDON),
  'coinshares.com': headquarters({ key: 'jersey', label: 'Jersey', region: 'EUROPE', lat: 49.1868, lon: -2.107 }),
  'glassnode.com': headquarters(ZUG),
  'ethereum.org': headquarters(ZUG),
  'solana.com': headquarters(ZUG),
};

/** Base of a domain, tolerating a `www.` prefix. Null when the base is not established. */
export function publisherBase(domain: string | null | undefined): PublisherBase | null {
  if (!domain) return null;
  const normalised = domain.trim().toLowerCase().replace(/^www\./, '');
  return PUBLISHER_BASES[normalised] ?? null;
}
