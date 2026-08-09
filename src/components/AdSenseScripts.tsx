import Script from 'next/script';
import { adsenseConfig } from '@/config/adsense';

/**
 * Loads the AdSense tag and the Funding Choices consent manager.
 *
 * Renders nothing at all until `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is set, so
 * before the account exists no third-party script touches the page — which
 * also means no consent dialog is shown for cookies that are never set.
 *
 * Both use `afterInteractive`: they must run on every page view (the CMP has to
 * gate ad personalisation *before* an ad renders), but neither should block
 * first paint. `lazyOnload` would risk an ad request outrunning consent.
 */
export function AdSenseScripts() {
  if (!adsenseConfig.enabled) return null;

  return (
    <>
      {adsenseConfig.cmpEnabled && (
        // Funding Choices — collects TCF v2.2 consent, mandatory for EEA/UK
        // traffic under Google's EU User Consent Policy. Loaded before the ad
        // tag so consent is established first.
        <Script
          id="funding-choices"
          strategy="afterInteractive"
          src={`https://fundingchoicesmessages.google.com/i/${adsenseConfig.publisherId}?ers=1`}
        />
      )}

      <Script
        id="adsbygoogle"
        strategy="afterInteractive"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig.publisherId}`}
        crossOrigin="anonymous"
      />
    </>
  );
}
