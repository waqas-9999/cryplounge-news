'use client';

import { SLUG_PATTERN, slugify } from '@/lib/slug';

interface SlugFieldProps {
  value: string;
  onChange: (next: string, touchedByUser: boolean) => void;
}

/**
 * URL slug input — normalizes on every keystroke (lowercase, hyphenated,
 * URL-safe) so an invalid slug can never sit in the field. The backend
 * (`SlugService`) re-validates and de-dupes on save regardless.
 */
export function SlugField({ value, onChange }: SlugFieldProps) {
  const isValid = value === '' || SLUG_PATTERN.test(value);

  return (
    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">URL Slug</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(slugify(e.target.value), true)}
        placeholder="Derived from title when left blank"
        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Lowercase letters, numbers and single hyphens only — e.g. <code>bitcoin-price-update</code>.
      </p>
      {!isValid && (
        <p className="mt-1 text-xs text-red-500">Invalid slug format.</p>
      )}
    </div>
  );
}
