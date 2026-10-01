'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  ImagePlus,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Tag as TagIcon,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, errorMessage } from '@/lib/api-client';
import { slugify } from '@/lib/slug';
import { MediaPickerDialog } from '@/components/admin/article-editor/MediaPickerDialog';
import {
  NEEDS_PUBLISH_RIGHTS,
  STATUS_LABELS,
  STATUS_TRANSITIONS,
  type ArticleStatus,
  type FeaturedImage,
  type Option,
} from './types';

export const card = 'bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800';
export const field =
  'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60';
export const label = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5';
/**
 * TechiArena's `.ae-icon-btn` / `.ae-danger` from its article-editor stylesheet,
 * expressed in Tailwind: CrypLounge has no such stylesheet, and adding a global
 * one for two buttons would reach every admin page.
 */
export const iconBtn =
  'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30';
export const dangerBtn = `${iconBtn} !text-red-700 dark:!text-red-400`;

export function PanelHeading({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{children}</h2>
      {hint && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

/* ----------------------------------------------------------- publishing --- */

export function PublishingPanel({
  savedStatus,
  status,
  scheduledLocal,
  canPublish,
  onStatus,
  onSchedule,
}: {
  /** The status currently stored (DRAFT for a new article). */
  savedStatus: ArticleStatus;
  status: ArticleStatus;
  scheduledLocal: string;
  canPublish: boolean;
  onStatus: (s: ArticleStatus) => void;
  onSchedule: (local: string) => void;
}) {
  const options: ArticleStatus[] = [savedStatus, ...STATUS_TRANSITIONS[savedStatus]];
  const scheduleInPast = status === 'SCHEDULED' && scheduledLocal !== '' && new Date(scheduledLocal).getTime() <= Date.now();

  return (
    <section className={`${card} p-5`} aria-labelledby="ws-publishing">
      <PanelHeading hint="Where this article is in the workflow.">
        <span id="ws-publishing">Publishing</span>
      </PanelHeading>
      <fieldset>
        <legend className="sr-only">Status</legend>
        <div className="grid gap-1.5">
          {options.map(option => {
            const locked = NEEDS_PUBLISH_RIGHTS.includes(option) && !canPublish && option !== savedStatus;
            return (
              <label
                key={option}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                  status === option
                    ? 'border-[#EFB81A] bg-[#EFB81A]/10 text-gray-900 dark:text-gray-100'
                    : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                } ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="ws-status"
                  className="accent-[#EFB81A]"
                  checked={status === option}
                  disabled={locked}
                  onChange={() => onStatus(option)}
                />
                <span className="flex-1">{STATUS_LABELS[option]}</span>
                {option === savedStatus && <span className="text-[11px] text-gray-500">current</span>}
                {locked && <Lock className="w-3.5 h-3.5" aria-label="Requires publish permission" />}
              </label>
            );
          })}
        </div>
      </fieldset>

      {status === 'SCHEDULED' && (
        <div className="mt-4">
          <label htmlFor="ws-schedule" className={label}>
            <CalendarClock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" aria-hidden="true" />
            Publish at (your local time)
          </label>
          <input
            id="ws-schedule"
            type="datetime-local"
            className={field}
            value={scheduledLocal}
            onChange={e => onSchedule(e.target.value)}
          />
          {scheduleInPast && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Choose a time in the future.</p>}
        </div>
      )}

      {!canPublish && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          Publishing and scheduling need the publish permission. Submit for review and an editor will take it from there.
        </p>
      )}
      {savedStatus === 'PUBLISHED' && status === 'DRAFT' && (
        <p className="mt-4 flex gap-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
          Saving as a draft takes this article off the site until it is published again.
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------- settings --- */

export function SettingsPanel({
  categories,
  authors,
  authorsState = 'ready',
  tags,
  categoryId,
  authorId,
  tagIds,
  slug,
  slugLocked,
  canCreateTags,
  onChange,
  onTagCreated,
}: {
  categories: Option[];
  authors: Option[];
  /** Lookup state for the author list, so the hint never flashes and a failed
   *  request is never reported as "no authors". */
  authorsState?: 'loading' | 'ready' | 'failed';
  tags: Option[];
  categoryId: string;
  authorId: string;
  tagIds: string[];
  slug: string;
  /** True for a saved article: changing a live URL breaks inbound links. */
  slugLocked: boolean;
  canCreateTags: boolean;
  onChange: (patch: { categoryId?: string; authorId?: string; tagIds?: string[]; slug?: string; slugTouched?: boolean }) => void;
  onTagCreated: (tag: Option) => void;
}) {
  const [tagQuery, setTagQuery] = useState('');
  const [creating, setCreating] = useState(false);
  const [editSlug, setEditSlug] = useState(false);

  const selected = tags.filter(t => tagIds.includes(t.id));
  const q = tagQuery.trim().toLowerCase();
  const suggestions = q
    ? tags.filter(t => !tagIds.includes(t.id) && t.name.toLowerCase().includes(q)).slice(0, 6)
    : [];
  const exact = tags.some(t => t.name.toLowerCase() === q || t.slug === slugify(q));

  async function createTag() {
    const name = tagQuery.trim();
    if (!name) return;
    setCreating(true);
    try {
      const tag = await apiClient.post<Option>('taxonomy/tags', { name, slug: slugify(name) });
      onTagCreated(tag);
      onChange({ tagIds: [...tagIds, tag.id] });
      setTagQuery('');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not create tag'));
    } finally {
      setCreating(false);
    }
  }

  const slugValid = slug === '' || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

  return (
    <section className={`${card} p-5 space-y-4`} aria-labelledby="ws-settings">
      <PanelHeading>
        <span id="ws-settings">Article settings</span>
      </PanelHeading>

      <div>
        <label htmlFor="ws-category" className={label}>Category</label>
        <select id="ws-category" className={field} value={categoryId} onChange={e => onChange({ categoryId: e.target.value })}>
          <option value="">Select a category…</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="ws-author" className={label}>Author</label>
        <select id="ws-author" className={field} value={authorId} onChange={e => onChange({ authorId: e.target.value })}>
          <option value="">Select an author…</option>
          {authors.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {authorsState === 'failed' && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
            Couldn’t load the author list. Reload the page; the article can still be saved without one.
          </p>
        )}
        {authorsState === 'ready' && authors.length === 0 && (
          <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-500">
            No authors yet. Add one from Admin → Authors.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="ws-tags" className={label}>Tags</label>
        {selected.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mb-2">
            {selected.map(tag => (
              <li key={tag.id}>
                <span className="inline-flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  {tag.name}
                  <button
                    type="button"
                    className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label={`Remove tag ${tag.name}`}
                    onClick={() => onChange({ tagIds: tagIds.filter(id => id !== tag.id) })}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="relative">
          <input
            id="ws-tags"
            className={field}
            value={tagQuery}
            placeholder="Search tags…"
            autoComplete="off"
            onChange={e => setTagQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (suggestions[0]) {
                  onChange({ tagIds: [...tagIds, suggestions[0].id] });
                  setTagQuery('');
                } else if (canCreateTags && !exact) void createTag();
              }
            }}
          />
          {q && (suggestions.length > 0 || (canCreateTags && !exact)) && (
            <ul className="absolute z-20 mt-1 w-full bg-white dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              {suggestions.map(t => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ tagIds: [...tagIds, t.id] });
                      setTagQuery('');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <TagIcon className="w-3 h-3" aria-hidden="true" /> {t.name}
                  </button>
                </li>
              ))}
              {canCreateTags && !exact && (
                <li>
                  <button
                    type="button"
                    disabled={creating}
                    onClick={createTag}
                    className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 border-t border-gray-100 dark:border-gray-800"
                  >
                    {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" aria-hidden="true" />}
                    Create tag “{tagQuery.trim()}”
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-gray-500">Tags are topics; the category is the desk.</p>
      </div>

      <div>
        <label htmlFor="ws-slug" className={label}>URL slug</label>
        {slugLocked && !editSlug ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate px-3 py-2 text-xs rounded-lg bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200">
              {slug}
            </code>
            <button type="button" onClick={() => setEditSlug(true)} className="text-xs text-gray-700 dark:text-gray-300 underline shrink-0">
              Change
            </button>
          </div>
        ) : (
          <input
            id="ws-slug"
            className={`${field} font-mono text-xs`}
            value={slug}
            placeholder="Generated from the title"
            onChange={e => onChange({ slug: slugify(e.target.value), slugTouched: true })}
          />
        )}
        {!slugValid && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Lowercase letters, numbers and single hyphens only.</p>}
        {slugLocked && editSlug && (
          <p className="mt-1.5 flex gap-1.5 text-[11px] text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" aria-hidden="true" />
            Changing a published URL breaks existing links and search results. There is no automatic redirect.
          </p>
        )}
        {!slugLocked && <p className="mt-1.5 text-[11px] text-gray-500">If it is already taken, a number is added when you save.</p>}
      </div>
    </section>
  );
}

/* ------------------------------------------------------- featured image --- */

export function FeaturedImagePanel({
  image,
  onChange,
  children,
}: {
  image: FeaturedImage | null;
  onChange: (image: FeaturedImage | null) => void;
  /** Extra tools under the image, e.g. the AI Image Studio on saved articles. */
  children?: React.ReactNode;
}) {
  const [picking, setPicking] = useState(false);

  async function saveAlt() {
    if (!image) return;
    try {
      await apiClient.patch(`media/${image.id}`, { altText: image.altText ?? '' });
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to save alt text'));
    }
  }

  return (
    <section className={`${card} p-5`} aria-labelledby="ws-featured">
      <PanelHeading hint="The lead image on cards, the article header and social shares. Images inside the story are added from the body toolbar.">
        <span id="ws-featured">Featured image</span>
      </PanelHeading>

      {image ? (
        <>
          <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt={image.altText ?? ''} className="w-full h-full object-cover" />
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setPicking(true)} className={iconBtn}>
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Replace
            </button>
            <button type="button" onClick={() => onChange(null)} className={dangerBtn}>
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" /> Remove
            </button>
          </div>
          <label htmlFor="ws-featured-alt" className={`${label} mt-3`}>Alt text</label>
          <input
            id="ws-featured-alt"
            className={field}
            value={image.altText ?? ''}
            placeholder="What the image shows"
            onChange={e => onChange({ ...image, altText: e.target.value })}
            onBlur={saveAlt}
          />
          <p className="mt-1 text-[11px] text-gray-500">Saved to the media library, so it applies wherever this image is used.</p>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 py-8 flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600"
        >
          <ImagePlus className="w-6 h-6" aria-hidden="true" />
          Choose or upload an image
        </button>
      )}

      {children}

      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        onPick={picked => {
          onChange({ id: picked.id, url: picked.url, altText: picked.altText });
          setPicking(false);
        }}
      />
    </section>
  );
}

/* -------------------------------------------------------------- sources --- */

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value.trim());
    return (u.protocol === 'http:' || u.protocol === 'https:') && Boolean(u.hostname);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ SEO --- */

export function SeoPanel({
  title,
  summary,
  seoTitle,
  seoDescription,
  canonicalUrl,
  noindex,
  onChange,
  children,
}: {
  title: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  noindex: boolean;
  onChange: (patch: { seoTitle?: string; seoDescription?: string; canonicalUrl?: string; noindex?: boolean }) => void;
  children?: React.ReactNode;
}) {
  const shownTitle = seoTitle.trim() || title.trim();
  const shownDescription = seoDescription.trim() || summary.trim();
  const canonicalError = canonicalUrl.trim() !== '' && !isHttpUrl(canonicalUrl);

  return (
    <section className={`${card} p-5 md:p-6`} aria-labelledby="ws-seo">
      <PanelHeading hint="How the article appears in search and when shared. Leave blank to use the headline and standfirst.">
        <span id="ws-seo">Search &amp; sharing</span>
      </PanelHeading>
      {/* minmax(0,1fr): the truncated search preview must not widen the track. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
        <div>
          <div className="flex justify-between">
            <label htmlFor="ws-seo-title" className={label}>Meta title</label>
            <span className="text-[11px] tabular-nums text-gray-500">{shownTitle.length} · aim 50–60</span>
          </div>
          <input
            id="ws-seo-title"
            className={field}
            value={seoTitle}
            maxLength={200}
            placeholder={title || 'Defaults to the headline'}
            onChange={e => onChange({ seoTitle: e.target.value })}
          />
        </div>
        <div>
          <div className="flex justify-between">
            <label htmlFor="ws-seo-desc" className={label}>Meta description</label>
            <span className="text-[11px] tabular-nums text-gray-500">{shownDescription.length}/400 · aim 120–160</span>
          </div>
          <textarea
            id="ws-seo-desc"
            className={`${field} min-h-[72px]`}
            value={seoDescription}
            maxLength={400}
            placeholder={summary || 'Defaults to the standfirst'}
            onChange={e => onChange({ seoDescription: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="ws-canonical" className={label}>Canonical URL (optional)</label>
          <input
            id="ws-canonical"
            className={field}
            value={canonicalUrl}
            inputMode="url"
            placeholder="Only if this story was first published elsewhere"
            aria-invalid={canonicalError}
            onChange={e => onChange({ canonicalUrl: e.target.value })}
          />
          {canonicalError && <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">Use a full web address starting with https://</p>}
        </div>
        <label className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" className="mt-0.5 w-4 h-4 accent-[#EFB81A]" checked={noindex} onChange={e => onChange({ noindex: e.target.checked })} />
          <span>
            Hide this article from search engines
            <span className="block text-xs text-gray-500">Adds noindex to this page only. Site-wide indexing is set in Settings → Publication.</span>
          </span>
        </label>

        <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-3">
          <p className="text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Search preview</p>
          <p className="text-[15px] text-[#1a0dab] dark:text-[#8ab4f8] truncate">{shownTitle || 'Article headline'} | CrypLounge</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">{shownDescription || 'The standfirst appears here.'}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
