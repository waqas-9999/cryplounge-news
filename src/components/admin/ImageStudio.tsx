'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

/**
 * The Image Studio.
 *
 * ## What is deliberately absent
 *
 * There is no prompt field, no provider selector and no model picker. The
 * generation request is an article id: the CMS reads the headline, summary and
 * category from the database and `cryplounge-ai` owns everything about what
 * gets drawn. A prompt box here would let the browser reach the model directly
 * and route around the safety layer, which is the one thing this boundary
 * exists to prevent.
 *
 * ## Why the loading state names the stages
 *
 * A real generation takes 30-60 seconds — NVIDIA, then quality scoring, then a
 * Gemini vision review. A spinner for a minute reads as a hang. The stages are
 * shown as a checklist rather than a percentage because the backend reports no
 * progress, and inventing one would be a lie the UI cannot back up.
 */

type Status = 'idle' | 'generating' | 'attaching';

interface Candidate {
  id: string;
  url: string;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  isAiGenerated?: boolean;
  generationProvider?: string | null;
  generationModel?: string | null;
  reviewScore?: number | null;
  reviewStatus?: string | null;
  createdAt?: string;
}

/** One point in the hero image's history. */
interface HeroEntry {
  id: string;
  url: string;
  altText: string | null;
}

interface Props {
  articleId: string;
  featuredImageId: string;
  /** The hero as it stands, so undo can return to it. */
  currentHero: HeroEntry | null;
  onAttached: (media: HeroEntry) => void;
}

/** Maps a failure to something an editor can act on, never a stack trace. */
function readableError(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  const reasons = (error as { response?: { data?: { reasons?: string[] } } })?.response?.data?.reasons;

  if (status === 401 || status === 403) return 'You are not authorized to generate images.';
  if (status === 400) return 'This article does not have enough information to generate an image.';
  if (status === 404) return 'This article could not be found.';
  if (status === 422) {
    const detail = reasons?.length ? ` (${reasons.slice(0, 3).join('; ')})` : '';
    return `The image did not pass editorial visual review${detail}. Try generating another.`;
  }
  if (status === 503) return 'Image generation is temporarily unavailable. Please try again.';
  return 'Image generation took too long or failed. Please try again.';
}

export function ImageStudio({ articleId, featuredImageId, currentHero, onAttached }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rejection, setRejection] = useState<string | null>(null);
  const [direction, setDirection] = useState('');

  /*
   * Hero history.
   *
   * Every entry is a media id that already exists in the CMS, so stepping
   * through it is a real attach call and a real database change — not a
   * client-side illusion that a refresh would undo. Seeded lazily on the
   * first apply, because until then there is nothing to step back to.
   */
  /**
   * The direction that produced the newest candidate.
   *
   * Held in state rather than persisted: it explains the image currently on
   * screen, and once the editor moves on it has served its purpose. Storing
   * it would need a Media column for a caption that only matters for a few
   * seconds.
   */
  const [lastDirection, setLastDirection] = useState<string | null>(null);
  const [discarded, setDiscarded] = useState<Set<string>>(new Set());

  const [history, setHistory] = useState<HeroEntry[]>([]);
  const [cursor, setCursor] = useState(-1);

  const loadCandidates = useCallback(async () => {
    try {
      const response = await apiClient.get<{ data: Candidate[] }>(
        `articles/${articleId}/visual/candidates`
      );
      setCandidates(response.data ?? []);
    } catch {
      // A failed history load must not break the editor; the Generate button
      // still works without it.
      setCandidates([]);
    }
  }, [articleId]);

  useEffect(() => {
    void loadCandidates();
  }, [loadCandidates]);

  async function generate() {
    if (status !== 'idle') return; // guards double submission
    setStatus('generating');
    setRejection(null);

    try {
      await apiClient.post(`articles/${articleId}/visual/generate`, {
        // Guidance only. It is appended to the article-derived brief in
        // cryplounge-ai and the assembled prompt is still safety-checked
        // there, so this steers the picture without steering the model.
        visualSubject: direction.trim() || undefined,
      });
      setLastDirection(direction.trim() || null);
      toast.success('New hero image ready to preview');
      await loadCandidates();
    } catch (error) {
      const message = readableError(error);
      const status422 = (error as { response?: { status?: number } })?.response?.status === 422;
      // A rejection is an editorial outcome worth keeping on screen; an outage
      // is transient and belongs in a toast.
      if (status422) setRejection(message);
      else toast.error(message);
    } finally {
      setStatus('idle');
    }
  }

  /** Persists one hero and tells the editor, without touching history. */
  async function applyHero(entry: HeroEntry): Promise<boolean> {
    try {
      await apiClient.post(`articles/${articleId}/visual/attach`, { mediaId: entry.id });
      onAttached(entry);
      return true;
    } catch (error) {
      toast.error(readableError(error));
      return false;
    }
  }

  async function attach(candidate: Candidate) {
    if (status !== 'idle') return;
    setStatus('attaching');

    const entry: HeroEntry = {
      id: candidate.id,
      url: candidate.url,
      altText: candidate.altText ?? null,
    };

    if (await applyHero(entry)) {
      setHistory(previous => {
        /*
         * Seed with whatever the hero was before this apply, so the first
         * undo returns to the image the editor started with rather than to
         * nothing. Applying after an undo truncates the forward entries, the
         * ordinary behaviour of an editing history.
         */
        const base = previous.length === 0 && currentHero ? [currentHero] : previous;
        const kept = base.slice(0, cursor >= 0 ? cursor + 1 : base.length);
        const next = [...kept, entry];
        setCursor(next.length - 1);
        return next;
      });
      toast.success('Hero image updated');
    }

    setStatus('idle');
  }

  /**
   * Removes a candidate from view without touching anything durable.
   *
   * The media row stays: it may already be the hero, or become it later via
   * redo, and deleting an asset an article might reference is the one
   * irreversible mistake available here. Discard is a view decision.
   */
  function discard(candidate: Candidate) {
    setDiscarded(previous => new Set(previous).add(candidate.id));
    if (candidate.id === candidates[0]?.id) setLastDirection(null);
    toast.info('Candidate discarded — the hero image is unchanged');
  }

  /** Steps through applied heroes. `delta` is -1 for undo, +1 for redo. */
  async function step(delta: number) {
    const target = cursor + delta;
    if (status !== 'idle' || target < 0 || target >= history.length) return;

    setStatus('attaching');
    if (await applyHero(history[target]!)) {
      setCursor(target);
      toast.success(delta < 0 ? 'Reverted to the previous hero image' : 'Restored the later hero image');
    }
    setStatus('idle');
  }

  const busy = status !== 'idle';
  // Enabled only where a real step exists, so the controls never suggest a
  // history the editor does not have.
  const visible = candidates.filter(candidate => !discarded.has(candidate.id));
  const canUndo = cursor > 0;
  const canRedo = cursor >= 0 && cursor < history.length - 1;

  return (
    <section
      aria-labelledby="image-studio-heading"
      className="mt-6 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3
            id="image-studio-heading"
            className="text-sm font-semibold text-gray-900 dark:text-gray-100"
          >
            Image Studio
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Generates a photorealistic editorial illustration from this article.
          </p>
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'generating' ? 'Generating…' : 'Generate AI image'}
        </button>

        {history.length > 1 && (
          <div className="flex items-center gap-1" role="group" aria-label="Hero image history">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={busy || !canUndo}
              aria-label="Undo hero image change"
              className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ↶ Undo
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={busy || !canRedo}
              aria-label="Redo hero image change"
              className="px-3 py-2 text-sm bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Redo ↷
            </button>
            <span className="ml-1 text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {cursor + 1} of {history.length}
            </span>
          </div>
        )}

        {candidates.length > 0 && (
          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Regenerate
          </button>
        )}
      </div>

      <div className="mt-4">
        <label
          htmlFor="image-direction"
          className="block text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          Direction <span className="font-normal text-gray-500 dark:text-gray-400">(optional)</span>
        </label>
        <textarea
          id="image-direction"
          value={direction}
          onChange={event => setDirection(event.target.value)}
          disabled={busy}
          rows={2}
          maxLength={300}
          placeholder="e.g. a wider composition, fewer people, a darker room"
          className="mt-1 w-full px-3 py-2 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-50"
        />
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          Tell the AI how you would like this version to look. The article title,
          summary and category are always used automatically — this only refines
          them.
        </p>
      </div>

      {status === 'generating' && (
        // aria-live so the wait is announced rather than silently spinning.
        <div
          role="status"
          aria-live="polite"
          className="mt-4 rounded-lg bg-gray-50 dark:bg-gray-800 p-4 text-sm text-gray-700 dark:text-gray-300"
        >
          <p className="font-medium">Generating your editorial image…</p>
          <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <li>Creating the visual</li>
            <li>Checking image quality</li>
            <li>Running the visual safety review</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            This usually takes 30–60 seconds.
          </p>
        </div>
      )}

      {rejection && (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 p-4"
        >
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            Generation rejected
          </p>
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-300">{rejection}</p>
          <p className="mt-2 text-[11px] text-amber-700 dark:text-amber-400">
            Adjust the direction above and generate again — for example, ask for a
            room without screens.
          </p>
        </div>
      )}

      {visible.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Generated candidates
          </h4>

          <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map(candidate => {
              const attached = candidate.id === featuredImageId;
              const newest = candidate.id === visible[0]?.id;

              return (
                <li
                  key={candidate.id}
                  className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-50 dark:bg-gray-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={candidate.url}
                    alt={candidate.altText ?? 'AI-generated editorial illustration'}
                    className="w-full aspect-video object-cover"
                  />

                  <div className="p-3 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* Disclosure is metadata, never drawn into the pixels. */}
                      <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                        AI-generated illustration
                      </span>
                      {attached && (
                        <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                          ✓ Current image
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      {candidate.generationProvider ?? 'unknown'}
                      {candidate.reviewScore != null && ` · quality ${candidate.reviewScore}/100`}
                      {candidate.width && ` · ${candidate.width}×${candidate.height}`}
                    </p>

                    {/* Only the newest candidate carries a remembered direction. */}
                    {newest && lastDirection && (
                      <p className="text-[11px] italic text-gray-600 dark:text-gray-400 line-clamp-2">
                        Direction: “{lastDirection}”
                      </p>
                    )}

                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => attach(candidate)}
                        disabled={busy || attached}
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {attached ? 'In use' : 'Use as hero image'}
                      </button>

                      {!attached && (
                        <button
                          type="button"
                          onClick={() => discard(candidate)}
                          disabled={busy}
                          aria-label="Discard this candidate"
                          className="px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-50"
                        >
                          Discard
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
