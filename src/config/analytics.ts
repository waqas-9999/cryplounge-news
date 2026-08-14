/**
 * Google Analytics 4 configuration.
 *
 * Inert until `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set: no script loads and no
 * cookie is set, so preview deployments and local development do not pollute
 * the production property with traffic that is not real readers.
 *
 * The measurement ID is public by design — it ships in the tag on every page —
 * so it belongs in a NEXT_PUBLIC_ variable, not a secret.
 */

/** e.g. `G-XXXXXXXXXX`. Found in GA4 under Admin → Data streams. */
const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;

export const analyticsConfig = {
  measurementId,
  enabled: Boolean(measurementId),
} as const;
