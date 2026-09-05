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

interface Props {
  articleId: string;
  featuredImageId: string;
  onAttached: (media: { id: string; url: string; altText: string | null }) => void;
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

export function ImageStudio({ articleId, featuredImageId, onAttached }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [rejection, setRejection] = useState<string | null>(null);
  const [direction, setDirection] = useState('');

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
      toast.success('Image generated and passed editorial review');
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

  async function attach(candidate: Candidate) {
    if (status !== 'idle') return;
    setStatus('attaching');
    try {
      await apiClient.post(`articles/${articleId}/visual/attach`, { mediaId: candidate.id });
      onAttached({ id: candidate.id, url: candidate.url, altText: candidate.altText ?? null });
      toast.success('Featured image updated');
    } catch (error) {
      toast.error(readableError(error));
    } finally {
      setStatus('idle');
    }
  }

  const busy = status !== 'idle';

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
          Describes how the image should look. The story, and the editorial safety
          rules, always come from the article itself.
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

      {candidates.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Generated candidates
          </h4>

          <ul className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {candidates.map(candidate => {
              const attached = candidate.id === featuredImageId;

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

                    <button
                      type="button"
                      onClick={() => attach(candidate)}
                      disabled={busy || attached}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {attached ? 'In use' : 'Use this image'}
                    </button>
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
