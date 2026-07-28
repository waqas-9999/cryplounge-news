import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2, Zap, TrendingUp, BookOpen, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface NewsletterPageProps {
  onNavigate: (page: string) => void;
}

type State = 'idle' | 'loading' | 'success' | 'already-subscribed' | 'error';

const benefits = [
  { icon: TrendingUp, title: 'Market Alerts', desc: 'Daily crypto market summaries and price movements' },
  { icon: Zap, title: 'Breaking News', desc: 'Instant alerts for major industry developments' },
  { icon: BookOpen, title: 'Research Digests', desc: 'Weekly deep dives and analysis from our editors' },
  { icon: Globe, title: 'Regulation Updates', desc: 'Global regulatory news affecting crypto markets' },
];

export default function NewsletterPage({ onNavigate }: NewsletterPageProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [state, setState] = useState<State>('idle');
  const [touched, setTouched] = useState({ email: false, name: false });

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = touched.email && !email ? 'Email is required' : touched.email && !isValidEmail ? 'Enter a valid email address' : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, name: true });
    if (!isValidEmail) return;

    setState('loading');
    setTimeout(() => {
      // Simulate already-subscribed for demo
      if (email.toLowerCase().includes('test@')) {
        setState('already-subscribed');
      } else {
        setState('success');
        toast.success('Subscribed!', { description: "You're on the list. Check your inbox for confirmation." });
      }
    }, 1400);
  };

  if (state === 'success') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl md:text-3xl text-gray-900 dark:text-white mb-3">You're subscribed!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Welcome{name ? `, ${name}` : ''}. We sent a confirmation to <strong className="text-gray-900 dark:text-white">{email}</strong>.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Check your inbox and click the link to confirm your subscription.</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-[#FFD200] text-black rounded-xl hover:bg-[#F1EFA5] transition-colors font-medium"
          >
            Back to Homepage
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left — copy */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FFD200]/10 border border-[#FFD200]/30 rounded-full mb-6">
            <Mail className="w-3.5 h-3.5 text-[#FFD200]" />
            <span className="text-xs text-[#FFD200] font-medium">Free Newsletter</span>
          </div>
          <h1 className="text-3xl md:text-5xl text-gray-900 dark:text-white mb-4 leading-tight">
            Stay ahead of the<br />
            <span className="text-[#FFD200]">crypto curve</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mb-10 max-w-md">
            Join 50,000+ readers who get the most important crypto, DeFi, and blockchain news — curated and delivered to their inbox.
          </p>

          <div className="space-y-5">
            {benefits.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-[#FFD200]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#FFD200]" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white font-medium text-sm">{title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl md:rounded-3xl border border-gray-200 dark:border-gray-800 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl text-gray-900 dark:text-white mb-2">Subscribe for free</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">No spam. Unsubscribe anytime.</p>

          {state === 'already-subscribed' && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-6">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">Already subscribed</p>
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">This email is already on our list. Check your inbox for past issues.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                First name <span className="text-gray-400 dark:text-gray-500 text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your first name"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200] text-sm transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1.5">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 bg-gray-50 dark:bg-[#0D0D0D] border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200] text-sm transition-all ${
                  emailError ? 'border-red-400 dark:border-red-600' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {emailError && (
                <p className="flex items-center gap-1 mt-1.5 text-xs text-red-500">
                  <AlertCircle className="w-3 h-3" /> {emailError}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={state === 'loading'}
              className="w-full py-3.5 bg-[#FFD200] text-black rounded-xl font-medium hover:bg-[#F1EFA5] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {state === 'loading' ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Subscribing…</>
              ) : (
                'Subscribe for free'
              )}
            </button>
          </form>

          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
            By subscribing you agree to our{' '}
            <button onClick={() => onNavigate('privacy')} className="underline hover:text-[#FFD200] transition-colors">Privacy Policy</button>.
          </p>
        </div>
      </div>
    </main>
  );
}
