'use client';

/**
 * Last-resort boundary for errors thrown by the root layout itself. It must
 * render its own <html>/<body> because the layout is what failed, and it
 * cannot rely on Tailwind having loaded.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            textAlign: 'center',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              CrypLounge is temporarily unavailable
            </h1>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              A critical error prevented the page from loading.
            </p>
            {error.digest && (
              <p style={{ color: '#999', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                Reference: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: '#EFB81A',
                color: '#000',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
