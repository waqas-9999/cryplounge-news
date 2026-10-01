'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ImageIcon, Loader2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, errorMessage } from '@/lib/api-client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { PickedImage } from './FigureImage';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  mimeType: string;
}

const PER_PAGE = 24;

/**
 * Article artwork is WebP only.
 *
 * `accept` filters the picker, but it is a hint — a file can still arrive by
 * drag-and-drop or by switching the dialog's filter to "all files" — so the
 * same rule is applied again here, and a third time by the API. This check
 * exists to give immediate feedback, not to be the boundary.
 */
export const ARTICLE_IMAGE_ACCEPT = 'image/webp,.webp';

export function rejectNonWebp(file: File): string | null {
  const byType = file.type === 'image/webp';
  const byExtension = /\.webp$/i.test(file.name);
  if (byType && byExtension) return null;
  return 'Only WebP images are supported. Convert the image to .webp and try again.';
}

/**
 * Picks an image for the article body from the existing media library
 * (`GET /media`), or uploads one through the existing upload endpoint
 * (`POST /media`, folder "articles"). No new storage or endpoints.
 */
export function MediaPickerDialog({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (image: PickedImage) => void;
}) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (nextPage: number, search: string, append: boolean) => {
    setState('loading');
    try {
      const result = await apiClient.getPaginated<MediaItem>('media', {
        query: { page: nextPage, perPage: PER_PAGE, mimeType: 'image/', search: search || undefined },
      });
      setItems(prev => (append ? [...prev, ...result.items] : result.items));
      setPage(nextPage);
      setTotalPages(result.pagination?.totalPages ?? 1);
      setState('idle');
    } catch {
      setState('error');
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    const t = setTimeout(() => load(1, query.trim(), false), query ? 250 : 0);
    return () => clearTimeout(t);
  }, [open, query, load]);

  async function upload(file: File) {
    const rejection = rejectNonWebp(file);
    if (rejection) {
      // No request, so no media record is created for a rejected file.
      toast.error(rejection);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('folder', 'articles');
      const asset = await apiClient.upload<MediaItem>('media', form);
      setItems(prev => [asset, ...prev]);
      setSelected(asset);
    } catch (err) {
      toast.error(errorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function confirm() {
    if (!selected) return;
    onPick({
      id: selected.id,
      url: selected.url,
      altText: selected.altText,
      width: selected.width,
      height: selected.height,
    });
  }

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90dvh] flex flex-col gap-4 p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5">
          <DialogTitle>Insert image</DialogTitle>
          <DialogDescription>Choose from the media library or upload a new image. Supported format: WebP.</DialogDescription>
        </DialogHeader>

        <div className="px-5 flex flex-col sm:flex-row gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search media</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by filename, title or alt text"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-[#0D0D0E] border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </label>
          <input
            ref={fileRef}
            type="file"
            accept={ARTICLE_IMAGE_ACCEPT}
            className="hidden"
            onChange={e => e.target.files?.[0] && upload(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Upload
          </button>
        </div>

        <div className="flex-1 min-h-[240px] overflow-y-auto px-5">
          {state === 'error' && (
            <p className="py-12 text-center text-sm text-gray-500">Couldn&apos;t load the media library.</p>
          )}
          {state !== 'error' && items.length === 0 && state !== 'loading' && (
            <div className="py-12 text-center text-sm text-gray-500">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              {query ? 'No images match that search.' : 'No images yet. Upload one to get started.'}
            </div>
          )}
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-2">
            {items.map(item => {
              const isSelected = selected?.id === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    onDoubleClick={() => {
                      setSelected(item);
                      onPick({ id: item.id, url: item.url, altText: item.altText, width: item.width, height: item.height });
                    }}
                    aria-pressed={isSelected}
                    className={`group relative block w-full text-left rounded-md overflow-hidden border-2 transition-colors ${
                      isSelected ? 'border-yellow-400' : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="block aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url} alt={item.altText ?? ''} loading="lazy" className="w-full h-full object-cover" />
                    </span>
                    <span className="block px-1.5 py-1 text-[11px] text-gray-600 dark:text-gray-400 truncate">{item.filename}</span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center">
                        <Check className="w-4 h-4" aria-hidden="true" />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {state === 'loading' && (
            <div className="py-6 flex justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
            </div>
          )}
          {state === 'idle' && page < totalPages && (
            <div className="py-3 flex justify-center">
              <button type="button" onClick={() => load(page + 1, query.trim(), true)} className="text-sm text-gray-700 dark:text-gray-300 underline">
                Load more
              </button>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500 truncate">{selected ? selected.filename : 'Select an image'}</p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={!selected}
              className="px-4 py-2 text-sm rounded-md bg-[#EFB81A] hover:bg-[#d9a617] text-gray-900 disabled:opacity-40"
            >
              Insert image
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
