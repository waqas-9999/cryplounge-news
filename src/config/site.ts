/**
 * Single source of truth for site-level configuration.
 *
 * Anything that differs between environments comes from NEXT_PUBLIC_* env
 * vars with a safe default, so nothing here is a secret. Server-only secrets
 * must never be added to this file — it is bundled for the client.
 */
export const siteConfig = {
  name: 'CrypLounge',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryplounge.com',
  description:
    'Independent crypto journalism: news, project discovery, research, regulation, events and the people building the industry.',
  locale: 'en',
  social: {
    x: 'https://twitter.com/cryplounge',
    telegram: 'https://t.me/cryplounge',
  },
} as const;

export type SiteConfig = typeof siteConfig;
