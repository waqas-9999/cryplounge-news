'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { ImageStudio } from '@/components/admin/ImageStudio';
import { apiClient, errorMessage, mediaUrl } from '@/lib/api-client';
import { ArticleWorkspace } from '@/components/admin/article-workspace/ArticleWorkspace';
import {
  EMPTY_DRAFT,
  newKey,
  toLocalInput,
  type ArticleDraft,
  type ArticleStatus,
} from '@/components/admin/article-workspace/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface NewsEditPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  articleId?: string;
}

interface BackendArticleDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  status: ArticleStatus;
  scheduledFor: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  noindex: boolean;
  sources?: unknown;
  keyPoints?: unknown;
  category: { id: string } | null;
  author: { id: string } | null;
  featuredImage: { id: string; path: string; altText: string | null } | null;
  tags: { id: string; slug: string; name: string }[];
}

/** Stored article → workspace draft. Tolerates older rows without new fields. */
function toDraft(a: BackendArticleDetail): ArticleDraft {
  const sources = Array.isArray(a.sources) ? a.sources : [];
  const keyPoints = Array.isArray(a.keyPoints) ? a.keyPoints : [];
  return {
    ...EMPTY_DRAFT,
    title: a.title,
    summary: a.summary,
    content: a.content,
    slug: a.slug,
    status: a.status,
    scheduledLocal: toLocalInput(a.scheduledFor),
    categoryId: a.category?.id ?? '',
    authorId: a.author?.id ?? '',
    tagIds: a.tags.map(t => t.id),
    featuredImage: a.featuredImage
      ? { id: a.featuredImage.id, url: mediaUrl(a.featuredImage.path) ?? '', altText: a.featuredImage.altText }
      : null,
    sources: sources
      .filter((s): s is { name: string; url: string; note?: string } => Boolean(s && typeof s === 'object' && 'url' in s))
      .map(s => ({ key: newKey(), name: String(s.name ?? ''), url: String(s.url ?? ''), note: s.note ? String(s.note) : '' })),
    keyPoints: keyPoints
      .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
      .map(text => ({ key: newKey(), text: text.trim() })),
    seoTitle: a.seoTitle ?? '',
    seoDescription: a.seoDescription ?? '',
    canonicalUrl: a.canonicalUrl ?? '',
    noindex: Boolean(a.noindex),
  };
}

export function NewsEditPage({ currentPage, onNavigate, onLogout, articleId }: NewsEditPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [initial, setInitial] = useState<ArticleDraft | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!articleId) {
      setLoadState('error');
      return;
    }
    setLoadState('loading');
    apiClient
      .get<BackendArticleDetail>(`articles/${articleId}`)
      .then(article => {
        setInitial(toDraft(article));
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [articleId]);

  async function handleDelete() {
    if (!articleId) return;
    setDeleting(true);
    try {
      await apiClient.delete(`articles/${articleId}`);
      toast.success('Article deleted');
      onNavigate('admin/news');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to delete article'));
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-dvh bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="Edit Article" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {loadState === 'loading' ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            </div>
          ) : loadState === 'error' || !initial || !articleId ? (
            <div className="max-w-5xl mx-auto text-center py-24 text-sm text-gray-500 dark:text-gray-400">
              Couldn&apos;t load this article.
              <div className="mt-4">
                <button
                  onClick={() => onNavigate('admin/news')}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg"
                >
                  Back to articles
                </button>
              </div>
            </div>
          ) : (
            <ArticleWorkspace
              key={articleId}
              mode="edit"
              initial={initial}
              onSave={payload => apiClient.patch<{ id: string; slug: string }>(`articles/${articleId}`, payload)}
              onBack={() => onNavigate('admin/news')}
              headerActions={
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate(`admin/news/analytics/${articleId}`)}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800"
                    title="View analytics"
                  >
                    <BarChart3 className="w-4 h-4" aria-hidden="true" />
                    <span className="hidden lg:inline">Analytics</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete article"
                    aria-label="Delete article"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </>
              }
              featuredImageTools={(draft, set) => (
                // Generation reads the headline and summary from the saved
                // article, so it is offered on the edit page only.
                <ImageStudio
                  articleId={articleId}
                  article={{ title: draft.title, summary: draft.summary, category: draft.categoryId }}
                  featuredImageId={draft.featuredImage?.id ?? ''}
                  currentHero={draft.featuredImage}
                  onAttached={media => set({ featuredImage: { id: media.id, url: media.url, altText: media.altText } })}
                />
              )}
            />
          )}
        </main>
      </div>

      <Dialog open={confirmDelete} onOpenChange={open => !open && !deleting && setConfirmDelete(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this article?</DialogTitle>
            <DialogDescription>
              It is removed from the site and the article list. An administrator can restore it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button type="button" onClick={() => setConfirmDelete(false)} disabled={deleting} className="px-4 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="button" onClick={handleDelete} disabled={deleting} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-60">
              {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete article
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
