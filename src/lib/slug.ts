/**
 * Client-side mirror of the backend's `SlugService.slugify` (server/src/modules/content-core/slug.service.ts).
 * Keep these in sync — this one only drives live input normalization; the
 * backend regex (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) is the actual source of truth.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/['’,]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
