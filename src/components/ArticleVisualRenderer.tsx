import type { ArticleVisual } from '@/types/article';

/**
 * One inline visual in an article body.
 *
 * ## Why every type renders the same way
 *
 * A chart, an infographic and a timeline all arrive as PNGs the newsroom
 * already rendered server-side. Reconstructing a chart in React would mean
 * shipping the data to the browser and drawing it again — two renderers to
 * keep in agreement, and a published figure that could change if the client
 * code changed. The server-generated image is the record of what was
 * published, so this component displays it and does not redraw it.
 *
 * The `type` still matters for the wrapper: a chart gets a border and a light
 * ground because it is a document, while a photograph does not.
 *
 * ## What it refuses to invent
 *
 * No fallback alt text, no generated caption, no source line. Alt text that
 * says "chart" tells a screen reader nothing and is worse than silence,
 * because it announces something is there without describing it. If the
 * newsroom did not produce alt text, the image is marked decorative and
 * skipped by assistive technology — which is the honest answer, and visible
 * to anyone auditing accessibility.
 *
 * A CrypLounge chart already carries its own source line inside the PNG, so
 * adding one here would either duplicate it or contradict it.
 */

interface Props {
  visual: ArticleVisual;
}

const FRAMED: Record<string, boolean> = {
  CHART: true,
  INFOGRAPHIC: true,
  TIMELINE: true,
  PHOTO: false,
};

export function ArticleVisualRenderer({ visual }: Props) {
  const { media, type } = visual;

  // No file, nothing to show. Rendering an <img> with no src produces a broken
  // image icon and a failed request.
  if (!media?.url) return null;

  const framed = FRAMED[type] ?? false;

  /*
   * Dimensions are used only when both are present.
   *
   * They reserve space and prevent the page jumping as the image loads. Half a
   * pair is worse than neither: a width with no height gives the browser an
   * aspect ratio of nothing to work with. Assets uploaded before dimension
   * extraction existed have neither, and those fall back to natural sizing.
   */
  const hasDimensions = Boolean(media.width && media.height);

  return (
    <figure className="my-8 not-prose">
      <img
        src={media.url}
        // Empty alt marks the image decorative. Only reached when the newsroom
        // produced no alt text; never a generic placeholder.
        alt={media.altText ?? ''}
        {...(hasDimensions ? { width: media.width, height: media.height } : {})}
        loading="lazy"
        decoding="async"
        className={[
          'w-full h-auto max-w-full rounded-lg',
          framed ? 'bg-white border border-gray-200 dark:border-gray-700' : 'object-cover',
        ].join(' ')}
        style={hasDimensions ? { aspectRatio: `${media.width} / ${media.height}` } : undefined}
      />

      {/* No caption, no container. An empty <figcaption> is markup a screen
          reader still announces. */}
      {media.caption ? (
        <figcaption className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-[#9A9AA5]">
          {media.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Every inline visual for an article, in the order the API gave them.
 *
 * The API orders by `placement` then `position`; that ordering is editorial and
 * is preserved exactly. Hero visuals are filtered out rather than reordered —
 * the hero is `featuredImageId` and is rendered by the page, and drawing it
 * again here would show the reader the same picture twice.
 */
export function ArticleVisuals({ visuals }: { visuals?: ArticleVisual[] }) {
  const inline = (visuals ?? []).filter(visual => visual.placement === 'INLINE');
  if (inline.length === 0) return null;

  return (
    <>
      {inline.map(visual => (
        <ArticleVisualRenderer key={visual.id} visual={visual} />
      ))}
    </>
  );
}
