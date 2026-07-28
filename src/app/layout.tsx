import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { SiteShell } from './site-shell';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cryplounge.com'),
  title: {
    default: 'CrypLounge — Crypto News, Markets, Research and Education',
    template: '%s | CrypLounge',
  },
  description:
    'Independent crypto journalism: market coverage, regulation, ecosystem research, founder profiles, events and structured education.',
  openGraph: {
    type: 'website',
    siteName: 'CrypLounge',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          <SiteShell>{children}</SiteShell>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
