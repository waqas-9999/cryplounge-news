import { analyticsConfig } from '@/config/analytics';

/**
 * The Google tag (gtag.js) for GA4.
 *
 * Rendered inside the root layout's `<head>` as plain `<script>` tags, matching
 * the snippet Google's install instructions give. That puts the tag in the
 * server-rendered HTML, which is where Search Console's "Google Analytics"
 * ownership check looks for it — `next/script` with `afterInteractive` only
 * emits a preload hint there and injects the real tag after hydration.
 *
 * The root layout is never re-rendered on client-side navigation, so the tag
 * is loaded once per visit rather than once per route. Do not render this
 * anywhere else: Google warns against more than one Google tag per page.
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
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        id="gtag-init"
        // The ID comes from deploy config, not user input; JSON.stringify
        // still quotes and escapes it as a JS string literal.
        dangerouslySetInnerHTML={{
          __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${JSON.stringify(measurementId)});
        `,
        }}
      />
    </>
  );
}
