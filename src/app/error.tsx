'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Newspaper } from 'lucide-react';

/**
 * Route-level error boundary. Replaces a hand-rolled ErrorBoundary class that
 * was never actually mounted, so runtime errors used to blank the page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to the error reporting service once the backend exists.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-3">
          Something went wrong
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          We hit an unexpected error loading this page. Trying again often resolves it.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mb-8">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-[#EFB81A] text-black text-sm font-medium hover:bg-[#F9D96A] transition-colors"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/news"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:border-[#EFB81A] transition-colors"
          >
            <Newspaper className="w-4 h-4" aria-hidden="true" />
            Back to news
          </Link>
        </div>
      </div>
    </main>
  );
}
