'use client';

import React, { useState } from 'react';
import Image from 'next/image';

/**
 * Content image with a graceful fallback.
 *
 * Backed by `next/image` rather than a bare `<img>`, which gives the whole
 * site three things it previously had none of:
 *  - AVIF/WebP derivatives and a responsive `srcset`, the biggest single lever
 *    on LCP for an image-heavy news site;
 *  - reserved layout space, so images no longer cause cumulative layout shift;
 *  - lazy loading below the fold by default.
 *
 * The public API is unchanged, so no call site needed editing. Every existing
 * caller sizes the image with `w-full h-full object-cover` or
 * `w-full aspect-video object-cover` — that is, the image fills a box the
 * parent has already sized. `fill` is exactly that mode, so `className` is
 * applied to a positioned wrapper (which is what `fill` requires) and the
 * image covers it.
 */

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

/**
 * Default responsive hint. Images sit in a max-1400px shell, usually one or
 * two per row, so this is a reasonable estimate for every current call site.
 * Pass `sizes` explicitly where a caller knows better.
 */
const DEFAULT_SIZES = '(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 700px';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Responsive size hint passed to `next/image`. */
  sizes?: string;
}

export function ImageWithFallback(props: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  // `width`/`height`/`srcSet` are pulled out and discarded: they are invalid
  // alongside `fill`, and the wrapper already carries the caller's sizing.
  const { src, alt, style, className, sizes, loading, width, height, srcSet, ...rest } = props;
  void width;
  void height;
  void srcSet;

  if (didError || !src) {
    return (
      <div
        className={`inline-block bg-gray-100 dark:bg-gray-800 text-center align-middle ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-center justify-center w-full h-full">
          {/* Inline data URI: not a content image, and never worth optimizing. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ERROR_IMG_SRC} alt={alt ? `${alt} (unavailable)` : 'Image unavailable'} data-original-url={typeof src === 'string' ? src : undefined} />
        </div>
      </div>
    );
  }

  // `loading="eager"` at a call site means the image is above the fold, which
  // in next/image terms is `priority` — it also preloads, improving LCP.
  const isPriority = loading === 'eager';

  return (
    <span className={`relative block overflow-hidden ${className ?? ''}`} style={style}>
      <Image
        src={typeof src === 'string' ? src : ''}
        // An empty string is the correct value for a decorative image; it tells
        // screen readers to skip it rather than announce a filename.
        alt={alt ?? ''}
        fill
        sizes={sizes ?? DEFAULT_SIZES}
        className="object-cover"
        priority={isPriority}
        loading={isPriority ? undefined : 'lazy'}
        onError={() => setDidError(true)}
        {...rest}
      />
    </span>
  );
}
