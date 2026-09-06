import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * The CMS side of the imagery boundary.
 *
 * ## Why the CMS does not generate images itself
 *
 * Every part of image generation — the visual brief, the prompt layers,
 * `safety.ts`, the NVIDIA provider, the Gemini reviewer and the deterministic
 * `decideReview` — lives in `cryplounge-ai`. Porting any of it here would
 * create a second safety layer, and the two would drift silently: a CMS copy
 * missing the evidence rules still returns images, and nothing would fail.
 *
 * So this class does no imagery work at all. It is a transport client with a
 * timeout and an error taxonomy, and that is deliberately all it is.
 *
 * ## The credential never reaches a browser
 *
 * `IMAGE_INTERNAL_API_KEY` is read through `ConfigService` inside a Nest
 * provider, so it exists only in the server process. There is no
 * `NEXT_PUBLIC_` equivalent and there must never be one — the browser calls
 * this CMS, and the CMS calls the imagery service.
 */

export type ImageryFailure =
  | 'not_configured'
  | 'unauthorized'
  | 'invalid_request'
  | 'rejected'
  | 'rate_limited'
  | 'timeout'
  | 'unavailable'
  | 'unknown';

export interface ImageryCandidate {
  /**
   * The image itself.
   *
   * Bytes rather than base64: the service returns binary and the media layer
   * wants binary, so encoding in between would cost a third more memory per
   * image to arrive back where it started.
   */
  bytes: Buffer;
  mimeType: string;
}

export type ImageryResult =
  | {
      approved: true;
      candidate: ImageryCandidate;
      provider: string;
      model: string;
      qualityScore: number;
      durationMs: number;
    }
  | { approved: false; failure: ImageryFailure; reasons: string[] };

export interface ImageryRequest {
  headline: string;
  summary?: string;
  category?: string;
  articleId?: string;
  visualSubject?: string;
  /** Why that subject helps, passed through to the service for tone. */
  visualReason?: string;
}

/**
 * Generous on purpose.
 *
 * A single request runs NVIDIA generation, technical validation, quality
 * scoring and a Gemini vision review. Measured end to end that is roughly
 * 5-25 seconds, and a tight timeout would discard work that was about to
 * succeed. Bounded all the same: nothing hangs.
 */
const TIMEOUT_MS = 120_000;

/** Refuse a response large enough to be a problem rather than an image. */
const MAX_RESPONSE_BYTES = 12 * 1024 * 1024;

@Injectable()
export class ImageryClient {
  private readonly logger = new Logger(ImageryClient.name);

  constructor(private readonly config: ConfigService) {}

  get configured(): boolean {
    return Boolean(this.baseUrl && this.apiKey);
  }

  private get baseUrl(): string | undefined {
    return this.config.get<string>('IMAGERY_API_URL');
  }

  private get apiKey(): string | undefined {
    return this.config.get<string>('IMAGERY_API_KEY');
  }


  /**
   * Strips the internal key out of anything about to be logged.
   *
   * Found by a test that injected the key into a connection error: the
   * message was written to the log verbatim. A provider or DNS error can
   * legitimately echo a URL, and a URL can carry a credential, so redacting
   * at the log boundary is cheaper than trusting every error source not to.
   */
  private redact(message: string): string {
    const key = this.apiKey;
    return key ? message.split(key).join('[REDACTED]') : message;
  }

  async generate(request: ImageryRequest): Promise<ImageryResult> {
    if (!this.configured) {
      return { approved: false, failure: 'not_configured', reasons: ['imagery service is not configured'] };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const startedAt = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: 'POST',
        headers: {
          // Header, never body: an echoed request cannot carry the key.
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'image/webp, application/json',
        },
        /*
         * Mapped at the boundary, not renamed throughout: the CMS calls it a
         * headline and the imagery service calls it a title. Translating here
         * keeps the service's vocabulary out of the article model, and the
         * mismatch cost a real 400 ("title is required") before it was caught.
         */
        body: JSON.stringify({
          articleId: request.articleId,
          title: request.headline,
          category: request.category,
          summary: request.summary,
          visualSubject: request.visualSubject,
          visualReason: request.visualReason,
        }),
        signal: controller.signal,
      });

      const length = Number(response.headers.get('content-length') ?? 0);
      if (length > MAX_RESPONSE_BYTES) {
        return { approved: false, failure: 'unavailable', reasons: ['imagery response was too large'] };
      }

      const contentType = response.headers.get('content-type') ?? '';

      /*
       * The service answers with the image itself, not JSON describing one.
       * Success is `image/webp` bytes; everything about the generation —
       * provider, model, quality, attempts — rides in X-CrypLounge-* headers.
       *
       * Reading this as JSON was the original defect: `response.json()` threw
       * on binary, the catch produced `null`, and every generation surfaced as
       * a generic failure with the image discarded.
       */
      if (response.ok && contentType.startsWith('image/')) {
        const bytes = Buffer.from(await response.arrayBuffer());

        if (bytes.length === 0) {
          return { approved: false, failure: 'unknown', reasons: ['imagery returned an empty image'] };
        }

        const header = (name: string) => response.headers.get(name) ?? undefined;

        this.logger.log(
          `imagery approved provider=${header('x-cryplounge-provider') ?? 'unknown'} ` +
            `quality=${header('x-cryplounge-quality') ?? 'n/a'} in ${Date.now() - startedAt}ms`
        );

        return {
          approved: true,
          candidate: { bytes, mimeType: contentType.split(';')[0]!.trim() },
          provider: header('x-cryplounge-provider') ?? 'unknown',
          model: header('x-cryplounge-model') ?? 'unknown',
          qualityScore: Number(header('x-cryplounge-quality') ?? 0),
          durationMs: Date.now() - startedAt,
        };
      }

      // Anything else is an error, and the service reports those as JSON.
      const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

      /*
       * 422 is an editorial verdict, not an outage: the pipeline ran and no
       * candidate survived review. Kept distinct from 5xx so the UI can say
       * "try a different direction" rather than "the service is down", and so
       * a rejection is never retried as though it were a transient failure.
       */
      const failure = this.classify(response.status);
      const reasons = Array.isArray(payload?.reasons)
        ? (payload.reasons as unknown[]).map(String).slice(0, 6)
        : [String(payload?.error ?? payload?.message ?? 'image generation failed')];

      this.logger.warn(`imagery ${failure} (HTTP ${response.status}) in ${Date.now() - startedAt}ms`);
      return { approved: false, failure, reasons };
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      // The message can name a host; it never carries the key.
      this.logger.warn(
        this.redact(
          `imagery request failed: ${aborted ? 'timeout' : String(error instanceof Error ? error.message : error).slice(0, 160)}`
        )
      );
      return {
        approved: false,
        failure: aborted ? 'timeout' : 'unavailable',
        reasons: [aborted ? 'image generation timed out' : 'imagery service is unreachable'],
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private classify(status: number): ImageryFailure {
    if (status === 401 || status === 403) return 'unauthorized';
    if (status === 400 || status === 413) return 'invalid_request';
    if (status === 422) return 'rejected';
    if (status === 429) return 'rate_limited';
    if (status >= 500) return 'unavailable';
    return 'unknown';
  }
}
