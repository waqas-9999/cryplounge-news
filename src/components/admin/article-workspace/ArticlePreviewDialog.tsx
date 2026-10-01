'use client';

import DOMPurify from 'dompurify';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

/**
 * Unsaved preview of the article.
 *
 * The body is sanitized and styled exactly as `ArticleDetailPage` renders it —
 * DOMPurify, then `prose dark:prose-invert` — so what the editor sees is what
 * readers get. TechiArena's version draws with its own public-site tokens
 * (`ta-site`, `ta-display`); CrypLounge's public site does not use them, and a
 * preview in another site's typography would be a preview of nothing.
 */
export function ArticlePreviewDialog({
  open,
  onClose,
  title,
  summary,
  content,
  category,
  author,
  readMinutes,
  image,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  summary: string;
  content: string;
  category?: string;
  author?: string;
  readMinutes: number;
  image: { url: string; altText: string | null } | null;
}) {
  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent className="!max-w-none w-[100vw] h-[100dvh] sm:w-[96vw] sm:h-[94dvh] p-0 gap-0 overflow-hidden flex flex-col bg-white dark:bg-[#0F0F10] [&>button:last-child]:hidden">
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="min-w-0">
            <DialogTitle className="text-sm font-semibold text-gray-900 dark:text-gray-100">Preview</DialogTitle>
            <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
              Unsaved changes included. This is how the article reads on cryplounge.com.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <article className="mx-auto max-w-[52rem] px-4 sm:px-6 py-8 md:py-12">
            <header className="max-w-[46rem]">
              {category && (
                <p className="text-xs font-semibold uppercase tracking-wide text-[#EFB81A]">{category}</p>
              )}
              <h1 className="mt-3 text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100">
                {title || 'Untitled article'}
              </h1>
              {summary && <p className="mt-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{summary}</p>}
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                {author || 'CrypLounge'}
                <span className="mx-2" aria-hidden="true">·</span>
                {readMinutes} min read
              </p>
            </header>

            {image && (
              <figure className="mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.altText ?? ''} className="w-full h-full object-cover" />
              </figure>
            )}

            <div className="mt-8">
              {content ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                />
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">The article body is empty.</p>
              )}
            </div>
          </article>
        </div>
      </DialogContent>
    </Dialog>
  );
}
