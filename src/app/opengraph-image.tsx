import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

/**
 * Default social preview image.
 *
 * The site previously had none, so every link shared to X, Telegram, Slack or
 * surfaced in Google Discover rendered without an image — which for a news
 * publication is a direct click-through cost.
 *
 * Generated rather than a checked-in asset so it always matches the brand, and
 * so there is no binary to keep in sync. Routes that have a more specific image
 * (an article's featured image) override this via their own metadata.
 */
export const alt = `${siteConfig.name} — independent crypto journalism`;

/** 1200×630 is the ratio X, Facebook and LinkedIn all crop to. */
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0F0F10',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: '#EFB81A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
              color: '#0F0F10',
            }}
          >
            C
          </div>
          <span style={{ fontSize: 40, fontWeight: 600, color: '#F3F3F5' }}>
            {siteConfig.name}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ fontSize: 62, fontWeight: 700, color: '#F3F3F5', lineHeight: 1.15 }}>
            Crypto News, Markets,
          </span>
          <span style={{ fontSize: 62, fontWeight: 700, color: '#EFB81A', lineHeight: 1.15 }}>
            Research &amp; Events
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 120, height: 6, background: '#EFB81A', borderRadius: 3 }} />
          <span style={{ fontSize: 26, color: '#A0A0A5' }}>
            {siteConfig.url.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>
    ),
    size
  );
}
