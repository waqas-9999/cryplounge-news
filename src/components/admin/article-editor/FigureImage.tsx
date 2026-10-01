'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { AlertTriangle, GripVertical, RefreshCw, Trash2 } from 'lucide-react';
import {
  IMAGE_ALIGNMENTS,
  IMAGE_ALIGNMENT_LABELS,
  isSafeImageUrl,
  type ImageAlignment,
} from '@/lib/article-body';

export interface PickedImage {
  id: string;
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
}

export interface FigureImageOptions {
  /** Opens the media picker; resolves with the chosen image, or null if cancelled. */
  pickImage: () => Promise<PickedImage | null>;
}

export interface FigureImageAttrs {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  align: ImageAlignment;
  mediaId: string | null;
  width: number | null;
  height: number | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    figureImage: {
      insertFigureImage: (attrs: Partial<FigureImageAttrs> & { src: string }) => ReturnType;
    };
  }
}

function toInt(value: string | null | undefined): number | null {
  if (!value || !/^\d{1,5}$/.test(value)) return null;
  return Number(value);
}

/** Reads a stored <figure>/<img> back into block attributes (also legacy bodies). */
function attrsFromElement(el: HTMLElement): Partial<FigureImageAttrs> | false {
  const img = el.tagName === 'IMG' ? (el as HTMLImageElement) : el.querySelector('img');
  const src = img?.getAttribute('src') ?? '';
  if (!img || !isSafeImageUrl(src)) return false;

  const caption =
    el.querySelector('[data-role="caption"]')?.textContent ??
    // Legacy <figcaption>plain text</figcaption> without role spans.
    (el.querySelector('figcaption [data-role]') ? '' : el.querySelector('figcaption')?.textContent ?? '');
  const align = el.getAttribute('data-align');

  return {
    src,
    alt: img.getAttribute('alt') ?? '',
    caption: caption.trim(),
    credit: (el.querySelector('[data-role="credit"]')?.textContent ?? '').trim(),
    align: (IMAGE_ALIGNMENTS as readonly string[]).includes(align ?? '') ? (align as ImageAlignment) : 'wide',
    mediaId: img.getAttribute('data-media-id'),
    width: toInt(img.getAttribute('width')),
    height: toInt(img.getAttribute('height')),
  };
}

/**
 * A body image: a structured block referencing a media-library item, with
 * alt text, caption, credit and alignment. Serializes to
 * `<figure data-type="image" data-align>…</figure>` (see HtmlSanitizerService).
 */
export const FigureImage = Node.create<FigureImageOptions>({
  name: 'figureImage',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return { pickImage: async () => null };
  },

  addAttributes() {
    const attr = (d: unknown) => ({ default: d, rendered: false });
    return {
      src: attr(''),
      alt: attr(''),
      caption: attr(''),
      credit: attr(''),
      align: attr('wide'),
      mediaId: attr(null),
      width: attr(null),
      height: attr(null),
    };
  },

  parseHTML() {
    return [
      { tag: 'figure', getAttrs: el => attrsFromElement(el as HTMLElement) },
      // Legacy bodies: a bare <img>, usually wrapped in a <p>.
      { tag: 'img[src]', priority: 40, getAttrs: el => attrsFromElement(el as HTMLElement) },
    ];
  },

  renderHTML({ node }) {
    const a = node.attrs as FigureImageAttrs;
    const img = [
      'img',
      mergeAttributes(
        { src: a.src, alt: a.alt ?? '', loading: 'lazy' },
        a.width ? { width: String(a.width) } : {},
        a.height ? { height: String(a.height) } : {},
        a.mediaId ? { 'data-media-id': a.mediaId } : {}
      ),
    ];
    const captionParts = [
      ...(a.caption?.trim() ? [['span', { 'data-role': 'caption' }, a.caption.trim()]] : []),
      ...(a.credit?.trim() ? [['span', { 'data-role': 'credit' }, a.credit.trim()]] : []),
    ];
    return [
      'figure',
      { 'data-type': 'image', 'data-align': a.align || 'wide' },
      img,
      ...(captionParts.length ? [['figcaption', {}, ...captionParts]] : []),
    ] as never;
  },

  addCommands() {
    return {
      insertFigureImage:
        attrs =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { align: 'wide', ...attrs } }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(FigureImageView);
  },
});

const field =
  'w-full px-3 py-2 text-sm bg-white dark:bg-[#0D0D0E] border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400';

function FigureImageView({ node, updateAttributes, deleteNode, selected, extension }: NodeViewProps) {
  const a = node.attrs as FigureImageAttrs;
  const missingAlt = !a.alt?.trim();

  async function replace() {
    const picked = await (extension.options as FigureImageOptions).pickImage();
    if (!picked) return;
    updateAttributes({
      src: picked.url,
      mediaId: picked.id,
      width: picked.width,
      height: picked.height,
      // A different photo: the old alt text and credit described the old one.
      // Alt comes from the new library entry (or is left empty so the missing
      // alt warning prompts the editor); the credit is never carried over, so
      // a photo is not attributed to someone else. The caption stays — it
      // usually speaks to the story rather than the picture.
      alt: picked.altText ?? '',
      credit: '',
    });
  }

  return (
    <NodeViewWrapper
      as="figure"
      data-align={a.align}
      className={`ae-figure ${selected ? 'is-selected' : ''}`}
      contentEditable={false}
    >
      <div className="ae-figure-bar">
        <span className="ae-drag" data-drag-handle title="Drag to move">
          <GripVertical className="w-4 h-4" aria-hidden="true" />
          Image
        </span>
        <div className="ae-seg" role="group" aria-label="Image alignment">
          {IMAGE_ALIGNMENTS.map(value => (
            <button
              key={value}
              type="button"
              aria-pressed={a.align === value}
              onClick={() => updateAttributes({ align: value })}
            >
              {IMAGE_ALIGNMENT_LABELS[value]}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" className="ae-icon-btn" onClick={replace} title="Replace image">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Replace</span>
          </button>
          <button type="button" className="ae-icon-btn ae-danger" onClick={deleteNode} title="Remove image">
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      <div className="ae-figure-preview">
        {/* Editor preview of a media-library image; next/image adds nothing here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a.src} alt={a.alt || ''} width={a.width ?? undefined} height={a.height ?? undefined} />
      </div>

      <div className="grid gap-2 p-3 sm:grid-cols-2">
        <label className="sm:col-span-2 block">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Alt text <span className="text-red-500" aria-hidden="true">*</span>
            {missingAlt && (
              <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-3 h-3" aria-hidden="true" /> Describe the image for screen readers
              </span>
            )}
          </span>
          <input
            className={field}
            value={a.alt ?? ''}
            maxLength={300}
            placeholder="What the image shows, e.g. “Rows of mining rigs in a Texas facility”"
            onChange={e => updateAttributes({ alt: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Caption (optional)</span>
          <input
            className={field}
            value={a.caption ?? ''}
            maxLength={300}
            placeholder="Shown under the image"
            onChange={e => updateAttributes({ caption: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Credit (optional)</span>
          <input
            className={field}
            value={a.credit ?? ''}
            maxLength={160}
            placeholder="e.g. Photo: Reuters — leave empty if unknown"
            onChange={e => updateAttributes({ credit: e.target.value })}
          />
        </label>
      </div>
    </NodeViewWrapper>
  );
}
