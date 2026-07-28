/**
 * @deprecated SEO is handled by the Next.js Metadata API.
 *
 * This component used to imperatively rewrite `document.title` and the meta
 * tags from a `useEffect` on the client. Under the App Router that fights the
 * `metadata` / `generateMetadata` exports in the route files, which are the
 * single source of truth and — unlike this — appear in the server-rendered
 * HTML that crawlers actually read.
 *
 * It is kept as an inert shim so the pages that still render it compile.
 * Remove the `<SEOHead />` usages as those pages are converted, then delete
 * this file.
 */

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  image?: string;
  url?: string;
  canonical?: string;
  type?: 'website' | 'article';
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  twitterCard?: string;
  publishedTime?: string;
  author?: string;
  category?: string;
  noindex?: boolean;
  nofollow?: boolean;
  article?: Record<string, unknown>;
  [key: string]: unknown;
}

export function SEOHead(_props: SEOHeadProps) {
  return null;
}

/**
 * @deprecated Use the `metadata` export on the relevant route instead.
 */
export function generateSEO(_page: string, _params?: unknown): SEOHeadProps {
  return {};
}
