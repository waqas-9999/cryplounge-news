/**
 * Single source of truth for site-level configuration.
 *
 * Anything that differs between environments comes from NEXT_PUBLIC_* env
 * vars with a safe default, so nothing here is a secret. Server-only secrets
 * must never be added to this file — it is bundled for the client.
 */
export const siteConfig = {
  name: 'CrypLounge',
  /**
   * The canonical public origin — the *only* domain that should ever appear in
   * a canonical tag, sitemap entry or feed URL.
   *
   * The default is the production domain rather than the Vercel deployment
   * URL. The site is reachable at both, and defaulting to the preview host is
   * what previously made every page declare its canonical to be on
   * `*.vercel.app`, which tells Google to index that copy instead of this one.
   * Non-canonical hosts are marked `noindex` in `src/middleware.ts`.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.cryplounge.com').replace(/\/+$/, ''),
  description:
    'Independent crypto journalism: news, project discovery, research, regulation, events and the people building the industry.',
  /** The one address CrypLounge is reachable at, for every inquiry type. */
  email: 'cryploungeofficial@gmail.com',
  locale: 'en',
  social: {
    x: 'https://twitter.com/cryplounge',
    telegram: 'https://t.me/cryplounge',
  },
} as const;

export type SiteConfig = typeof siteConfig;
