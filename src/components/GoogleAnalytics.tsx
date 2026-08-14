import Script from 'next/script';
import { analyticsConfig } from '@/config/analytics';

/**
 * The Google tag (gtag.js) for GA4.
 *
 * Google's install instructions say to paste this immediately after `<head>`.
 * In the App Router the equivalent is `next/script` with `afterInteractive`:
 * Next injects it into the document itself, and it runs on every page view
 * without blocking first paint. Putting raw `<script>` tags in `<head>` would
 * load gtag.js twice on client-side navigation, which is exactly the "don't
 * add more than one Google tag to each page" case Google warns about.
 *
 * `send_page_view` is left on. This is a multi-page App Router site where each
 * route is a real navigation, and GA4's enhanced measurement picks up
 * subsequent History API navigations on its own.
 */
export function GoogleAnalytics() {
  if (!analyticsConfig.enabled) return null;

  const { measurementId } = analyticsConfig;

  return (
    <>
      <Script
        id="gtag-js"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
