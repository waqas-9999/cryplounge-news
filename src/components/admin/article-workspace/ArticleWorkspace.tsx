'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, errorMessage } from '@/lib/api-client';
import { slugify } from '@/lib/slug';
import { isBodyEmpty } from '@/lib/article-body';
import { AdminAuthService } from '@/utils/adminAuth';
import { ArticleBodyEditor } from '@/components/admin/article-editor/ArticleBodyEditor';
import { SeoChecklist } from '@/components/admin/SeoChecklist';
import { ArticlePreviewDialog } from './ArticlePreviewDialog';
import {
  FeaturedImagePanel,
  PublishingPanel,
  SeoPanel,
  SettingsPanel,
  KeyPointsPanel,
  SourcesPanel,
  card,
  isHttpUrl,
} from './WorkspacePanels';
import {
  STATUS_LABELS,
  readingMinutes,
  wordCount,
  type ArticleDraft,
  type ArticleStatus,
  type Option,
} from './types';

export interface SaveResult {
  id: string;
  slug: string;
}

interface ArticleWorkspaceProps {
  mode: 'create' | 'edit';
  /** Stored values for an existing article, or the empty draft. */
  initial: ArticleDraft;
  /** Persists the payload; the workspace owns validation and messaging. */
  onSave: (payload: Record<string, unknown>) => Promise<SaveResult>;
  /** Called after a successful save (create navigates to the edit page). */
  onSaved?: (result: SaveResult, draft: ArticleDraft) => void;
  onBack: () => void;
  /** Extra header actions (analytics, delete) for a saved article. */
  headerActions?: React.ReactNode;
  /** Extra tools under the featured image (AI Image Studio). */
  featuredImageTools?: (draft: ArticleDraft, set: (patch: Partial<ArticleDraft>) => void) => React.ReactNode;
}

const TITLE_SOFT_MAX = 110;

/**
 * The newsroom writing workspace for creating and editing an article: the
 * writing column (headline, standfirst, body, key points, sources, SEO)
 * beside the settings column (publishing, taxonomy, featured image), with the
 * primary action and the article's vital signs pinned to the top.
 *
 * Ported from TechiArena so the two admins share one layout and workflow.
 * Two CrypLounge differences:
 *  - Authors come from the `authors` list, as before; CrypLounge has no
 *    `authors/byline-options` route.
 *  - Sources are editorial-only: saved and reloaded here, but not shown in the
 *    preview, because the public article does not show them.
 */
export function ArticleWorkspace({
  mode,
  initial,
  onSave,
  onSaved,
  onBack,
  headerActions,
  featuredImageTools,
}: ArticleWorkspaceProps) {
  const [draft, setDraft] = useState<ArticleDraft>(initial);
  const [saved, setSaved] = useState<ArticleDraft>(initial);
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const [categories, setCategories] = useState<Option[]>([]);
  const [authors, setAuthors] = useState<Option[]>([]);
  const [authorsState, setAuthorsState] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [tags, setTags] = useState<Option[]>([]);

  const canPublish = AdminAuthService.hasPermission('news.publish');
  const canCreateTags = AdminAuthService.hasPermission('taxonomy.manage');

  const set = useCallback((patch: Partial<ArticleDraft>) => setDraft(d => ({ ...d, ...patch })), []);

  // Taxonomy comes from the API, never a hardcoded list.
  useEffect(() => {
    apiClient
      .get<Option[]>('taxonomy/categories', { query: { kind: 'NEWS' }, auth: false })
      .then(setCategories)
      .catch(() => setCategories([]));
    // CrypLounge's author source: the Author list, as the previous Create
    // page used. There is no `authors/byline-options` route here.
    apiClient
      .getPaginated<Option>('authors', { query: { perPage: 100 }, auth: false })
      .then(({ items }) => {
        setAuthors(items);
        setAuthorsState('ready');
      })
      // A failed lookup and an empty list are different problems and need
      // different messages — an editor should not be told there are no
      // authors when the request never arrived.
      .catch(() => {
        setAuthors([]);
        setAuthorsState('failed');
      });
    apiClient
      .getPaginated<Option>('taxonomy/tags', { query: { perPage: 200 }, auth: false })
      .then(({ items }) => setTags(items))
      .catch(() => setTags([]));
  }, []);

  // A new article's slug follows the headline until the editor sets one.
  useEffect(() => {
    if (slugTouched) return;
    setDraft(d => ({ ...d, slug: slugify(d.title) }));
  }, [draft.title, slugTouched]);

  const words = useMemo(() => wordCount(draft.content), [draft.content]);
  const minutes = readingMinutes(words);
  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  // Warn before leaving with unsaved work (tab close, reload, external link).
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /* ------------------------------------------------------ validation --- */

  const filledSources = draft.sources.filter(s => s.name.trim() || s.url.trim() || (s.note ?? '').trim());
  // Blank rows are an editor mid-thought, not content: dropped rather than flagged.
  const filledKeyPoints = draft.keyPoints.map(p => p.text.trim()).filter(Boolean);
  const problems: string[] = [];
  if (!draft.title.trim()) problems.push('Add a headline.');
  if (!draft.summary.trim()) problems.push('Add a standfirst.');
  if (isBodyEmpty(draft.content)) problems.push('Write the article body.');
  if (filledSources.some(s => !s.name.trim() || !isHttpUrl(s.url))) problems.push('Every source needs a name and a full https:// URL.');
  if (draft.canonicalUrl.trim() && !isHttpUrl(draft.canonicalUrl)) problems.push('The canonical URL must be a full https:// address.');
  if (draft.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(draft.slug)) problems.push('Fix the URL slug.');
  if (draft.status === 'SCHEDULED') {
    const at = draft.scheduledLocal ? new Date(draft.scheduledLocal).getTime() : NaN;
    if (!Number.isFinite(at)) problems.push('Choose when the article should publish.');
    else if (at <= Date.now()) problems.push('The scheduled time must be in the future.');
  }

  /* ------------------------------------------------------------ save --- */

  const primaryLabel = (() => {
    if (mode === 'edit' && draft.status === saved.status) return 'Save changes';
    switch (draft.status) {
      case 'DRAFT':
        return saved.status === 'PUBLISHED' && mode === 'edit' ? 'Unpublish & save draft' : 'Save draft';
      case 'REVIEW':
        return 'Submit for review';
      case 'SCHEDULED':
        return 'Schedule';
      case 'PUBLISHED':
        return 'Publish';
      case 'ARCHIVED':
        return 'Archive';
    }
  })();

  const save = useCallback(async () => {
    if (saving) return;
    if (problems.length) {
      setShowErrors(true);
      toast.error(problems[0]);
      return;
    }
    setSaving(true);
    const clear = mode === 'edit' ? null : undefined;
    const payload: Record<string, unknown> = {
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      content: draft.content,
      slug: draft.slug || undefined,
      status: draft.status,
      ...(draft.status === 'SCHEDULED' ? { scheduledFor: new Date(draft.scheduledLocal).toISOString() } : {}),
      categoryId: draft.categoryId || clear,
      authorId: draft.authorId || clear,
      tagIds: draft.tagIds,
      featuredImageId: draft.featuredImage?.id ?? clear,
      seoTitle: draft.seoTitle.trim() || clear,
      seoDescription: draft.seoDescription.trim() || clear,
      canonicalUrl: draft.canonicalUrl.trim() || clear,
      noindex: draft.noindex,
      readMinutes: minutes,
      sources: filledSources.map(({ name, url, note }) => ({
        name: name.trim(),
        url: url.trim(),
        ...(note?.trim() ? { note: note.trim() } : {}),
      })),
      keyPoints: filledKeyPoints,
    };
    try {
      const result = await onSave(payload);
      const next = { ...draft, slug: result.slug };
      if (draft.slug && result.slug !== draft.slug) {
        toast.info(`“${draft.slug}” was already in use — saved as “${result.slug}”.`);
      }
      setDraft(next);
      setSaved(next);
      setShowErrors(false);
      toast.success(
        draft.status === 'PUBLISHED' && saved.status !== 'PUBLISHED'
          ? 'Article published'
          : draft.status === 'SCHEDULED' && saved.status !== 'SCHEDULED'
            ? 'Article scheduled'
            : draft.status === 'REVIEW' && saved.status !== 'REVIEW'
              ? 'Submitted for review'
              : 'Saved'
      );
      onSaved?.(result, next);
    } catch (err) {
      toast.error(errorMessage(err, 'Could not save the article'));
    } finally {
      setSaving(false);
    }
  }, [draft, saved, saving, problems, mode, minutes, filledSources, onSave, onSaved]);

  // Ctrl/Cmd+S saves with the chosen status.
  const saveRef = useRef(save);
  saveRef.current = save;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const categoryName = categories.find(c => c.id === draft.categoryId)?.name;
  const authorName = authors.find(a => a.id === draft.authorId)?.name;

  return (
    <div className="pb-16">
      {/* Sticky action bar */}
      <div className="sticky top-0 z-30 -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8 mb-6 px-4 md:px-6 lg:px-8 py-3 bg-gray-50/95 dark:bg-[#0F0F10]/95 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-x-4 gap-y-2">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Articles
          </button>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 min-w-0">
            <span className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide text-[10px] ${saved.status === 'PUBLISHED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : saved.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
              {mode === 'create' ? 'New' : STATUS_LABELS[saved.status]}
            </span>
            <span className="tabular-nums">{words.toLocaleString()} words · {minutes} min read</span>
            {dirty && <span className="text-amber-700 dark:text-amber-400">· Unsaved changes</span>}
          </div>
          <div className="ml-auto flex items-center gap-2">
            {headerActions}
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
            >
              <Eye className="w-4 h-4" aria-hidden="true" /> Preview
            </button>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              title="Ctrl+S"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#EFB81A] hover:bg-[#d9a617] text-gray-900 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {primaryLabel}
            </button>
          </div>
        </div>
      </div>

      {showErrors && problems.length > 0 && (
        <div role="alert" className="max-w-[1400px] mx-auto mb-6 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-800 dark:text-red-300">
          <p className="font-medium">Before saving:</p>
          <ul className="mt-1 list-disc pl-5">
            {problems.map(p => <li key={p}>{p}</li>)}
          </ul>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
        {/* ------------------------------------------------ writing column */}
        <div className="min-w-0 space-y-6">
          <section className={`${card} p-5 md:p-8`} aria-label="Article content">
            <label htmlFor="ws-title" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Headline
            </label>
            <textarea
              id="ws-title"
              rows={2}
              value={draft.title}
              onChange={e => set({ title: e.target.value.replace(/\n/g, ' ') })}
              placeholder="Write the headline"
              aria-invalid={showErrors && !draft.title.trim()}
              className="mt-2 w-full resize-none bg-transparent border-0 p-0 text-2xl md:text-[2rem] leading-tight font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
            <p className={`mt-1 text-xs tabular-nums ${draft.title.length > TITLE_SOFT_MAX ? 'text-amber-700 dark:text-amber-400' : 'text-gray-500'}`}>
              {draft.title.length} characters{draft.title.length > TITLE_SOFT_MAX ? ' — long headlines get cut off in cards and search' : ''}
            </p>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <label htmlFor="ws-standfirst" className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Standfirst
              </label>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                One or two sentences under the headline that tell the reader what happened and why it matters. Also used on cards and in search.
              </p>
              <textarea
                id="ws-standfirst"
                rows={3}
                value={draft.summary}
                onChange={e => set({ summary: e.target.value })}
                placeholder="What happened, and why it matters"
                aria-invalid={showErrors && !draft.summary.trim()}
                className="mt-2 w-full resize-y bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-base leading-relaxed text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <p className="mt-1 text-xs tabular-nums text-gray-500">{draft.summary.length} characters · aim for 150–250</p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Article body</p>
              <ArticleBodyEditor value={draft.content} onChange={content => set({ content })} />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Aim for clear paragraphs, useful subheadings and properly attributed sources.
              </p>
            </div>
          </section>

          <KeyPointsPanel points={draft.keyPoints} onChange={keyPoints => set({ keyPoints })} />

          <SourcesPanel sources={draft.sources} onChange={sources => set({ sources })} />

          <SeoPanel
            title={draft.title}
            summary={draft.summary}
            seoTitle={draft.seoTitle}
            seoDescription={draft.seoDescription}
            canonicalUrl={draft.canonicalUrl}
            noindex={draft.noindex}
            onChange={patch => set(patch)}
          />

          <SeoChecklist
            title={draft.title}
            slug={draft.slug}
            summary={draft.summary}
            content={draft.content}
            categoryId={draft.categoryId}
            featuredImageId={draft.featuredImage?.id ?? ''}
            featuredImageAltText={draft.featuredImage?.altText}
            seoTitle={draft.seoTitle}
            seoDescription={draft.seoDescription}
          />
        </div>

        {/* ----------------------------------------------- settings column */}
        <aside className="min-w-0 space-y-6 xl:sticky xl:top-20" aria-label="Article settings">
          <PublishingPanel
            savedStatus={saved.status}
            status={draft.status}
            scheduledLocal={draft.scheduledLocal}
            canPublish={canPublish}
            onStatus={(status: ArticleStatus) => set({ status })}
            onSchedule={scheduledLocal => set({ scheduledLocal })}
          />
          <SettingsPanel
            categories={categories}
            authors={authors}
            authorsState={authorsState}
            tags={tags}
            categoryId={draft.categoryId}
            authorId={draft.authorId}
            tagIds={draft.tagIds}
            slug={draft.slug}
            slugLocked={mode === 'edit' && saved.status === 'PUBLISHED'}
            canCreateTags={canCreateTags}
            onChange={({ slugTouched: touched, ...patch }) => {
              if (touched) setSlugTouched(true);
              set(patch);
            }}
            onTagCreated={tag => setTags(prev => [...prev, tag])}
          />
          <FeaturedImagePanel image={draft.featuredImage} onChange={featuredImage => set({ featuredImage })}>
            {featuredImageTools?.(draft, set)}
          </FeaturedImagePanel>
        </aside>
      </div>

      <ArticlePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={draft.title}
        summary={draft.summary}
        content={draft.content}
        category={categoryName}
        author={authorName}
        readMinutes={minutes}
        image={draft.featuredImage}
        keyPoints={filledKeyPoints}
      />
    </div>
  );
}
