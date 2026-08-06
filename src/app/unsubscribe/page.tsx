'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, MailMinus } from 'lucide-react';
import { unsubscribeFromNewsletter } from '@/services/newsletter';
import { errorMessage } from '@/lib/api-client';

type State = 'loading' | 'success' | 'already' | 'error';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [state, setState] = useState<State>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('This unsubscribe link is missing its token and cannot be used.');
      return;
    }
    unsubscribeFromNewsletter(token)
      .then(result => {
        setState(result.alreadyUnsubscribed ? 'already' : 'success');
        setMessage(result.message);
      })
      .catch(err => {
        setState('error');
        setMessage(errorMessage(err, 'Could not process the unsubscribe request. The link may be invalid or expired.'));
      });
  }, [token]);

  const icon =
    state === 'loading' ? (
      <Loader2 className="w-8 h-8 animate-spin text-[#EFB81A]" />
    ) : state === 'error' ? (
      <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
    ) : (
      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
    );

  const heading =
    state === 'loading'
      ? 'Unsubscribing…'
      : state === 'error'
        ? 'Something went wrong'
        : state === 'already'
          ? 'Already unsubscribed'
          : "You've been unsubscribed";

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
            state === 'loading'
              ? 'bg-amber-100 dark:bg-amber-900/20'
              : state === 'error'
                ? 'bg-red-100 dark:bg-red-900/20'
                : 'bg-green-100 dark:bg-green-900/30'
          }`}
        >
          {icon}
        </div>
        <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-3">{heading}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">{message}</p>
        {state === 'success' && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            You won't receive future newsletters from CrypLounge. You can subscribe again any time from the site.
          </p>
        )}
        {state === 'error' && (
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
            If this keeps happening, use the contact form and our team will remove you manually.
          </p>
        )}
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EFB81A] text-gray-900 text-sm font-semibold hover:bg-[#f0c445]"
        >
          <MailMinus className="w-4 h-4" />
          Back to CrypLounge
        </Link>
      </div>
    </main>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#EFB81A]" /></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
