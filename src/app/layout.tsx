import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { SiteShell } from './site-shell';
import { Toaster } from '@/components/ui/sonner';
import { AdSenseScripts } from '@/components/AdSenseScripts';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { adsenseConfig } from '@/config/adsense';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  // Absolute base for every canonical, OG and sitemap URL. Points at the
  // production domain, never the Vercel preview host.
  metadataBase: new URL(siteConfig.url),
  title: {
    default: 'CrypLounge — Crypto News, Markets, Research and Events',
    template: '%s | CrypLounge',
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  icons: {
    icon: '/logo/favicon.png',
    shortcut: '/logo/favicon.png',
    apple: '/logo/favicon.png',
  },
  // Tells Google the canonical version of the homepage; per-page metadata
  // overrides this with its own path.
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': `${siteConfig.url}/rss.xml` },
  },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
    url: siteConfig.url,
    title: 'CrypLounge — Crypto News, Markets, Research and Events',
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: '@cryplounge',
  },
  robots: {
    index: true,
    follow: true,
    // Lets Google show full-length previews and large thumbnails, which a news
    // site wants; the restrictive defaults suppress rich results.
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  // AdSense reads this during site verification.
  ...(adsenseConfig.publisherId
    ? { other: { 'google-adsense-account': adsenseConfig.publisherId } }
    : {}),
};

/**
 * Publisher-level structured data.
 *
 * `Organization` identifies who stands behind the reporting and `WebSite`
 * declares the search action — both are what Google looks for to treat a
 * domain as a publication rather than a collection of pages. Article-level
 * schema is emitted separately by the article pages.
 */
function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        email: siteConfig.email,
        sameAs: [siteConfig.social.x, siteConfig.social.telegram],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: { '@id': `${siteConfig.url}/#organization` },
        inLanguage: 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // Generated from static config, so there is no user input to escape.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }}
        />
      </head>
      <body className="antialiased">
        <Providers>
          <SiteShell>{children}</SiteShell>
          <Toaster position="bottom-right" />
        </Providers>
        <GoogleAnalytics />
        <AdSenseScripts />
      </body>
    </html>
  );
}
