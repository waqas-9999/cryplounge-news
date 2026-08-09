/**
 * Google AdSense configuration.
 *
 * Everything here is inert until `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` is set, so
 * this ships safely before the account exists: no scripts load, no consent
 * dialog appears, and `/ads.txt` 404s rather than serving a wrong record.
 *
 * The publisher ID is public by design — it appears in the ad tag on every
 * page — so it belongs in a NEXT_PUBLIC_ variable, not a secret.
 */

/** e.g. `pub-1234567890123456`. Found in AdSense under Account → Settings. */
const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID?.trim() || null;

export const adsenseConfig = {
  publisherId,
  enabled: Boolean(publisherId),

  /**
   * Google Funding Choices — the CMP that collects TCF v2.2 consent, which
   * Google requires for traffic from the EEA and UK. It is provisioned from
   * the same publisher ID, so no separate key is needed.
   *
   * Set `NEXT_PUBLIC_ADSENSE_CMP=false` if you switch to another certified CMP
   * (Cookiebot, Sourcepoint, …) so the two do not both try to render.
   */
  cmpEnabled: publisherId !== null && process.env.NEXT_PUBLIC_ADSENSE_CMP !== 'false',
} as const;
