import { ImageResponse } from 'next/og';

/**
 * `/logo.png` — the publisher logo referenced by `NewsArticle.publisher.logo`.
 *
 * The article schema already pointed at this URL, but no such file existed, so
 * every article shipped structured data with a broken logo. Google requires a
 * fetchable raster logo for news results and Discover; a 404 there invalidates
 * the publisher block.
 *
 * Generated as a PNG rather than committed as a binary so it stays in step with
 * the brand colours and there is no asset to maintain.
 *
 * Kept within Google's guidance: a rectangular raster, no wider than 600px and
 * no taller than 60px.
 */
/**
 * Not exported: a Route Handler may only export HTTP verbs and route config.
 * `size`/`contentType` exports are the image-convention API (`opengraph-image`
 * and friends) and are rejected here by the type checker.
 */
const SIZE = { width: 600, height: 60 };

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          background: '#0F0F10',
          padding: '0 16px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: '#EFB81A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 700,
            color: '#0F0F10',
          }}
        >
          C
        </div>
        <span style={{ fontSize: 30, fontWeight: 600, color: '#F3F3F5' }}>CrypLounge</span>
      </div>
    ),
    SIZE
  );
}
