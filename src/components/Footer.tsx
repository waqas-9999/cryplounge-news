'use client';

import Link from 'next/link';
import { Twitter, Shield, Send, Rss, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { subscribeToNewsletter } from '@/services/newsletter';
import { trackNewsletterSignup } from '@/utils/analytics';
import { pageKeyToHref } from '@/lib/navigation';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps = {}) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      toast.error('Email required', {
        description: 'Please enter your email address',
        duration: 3000,
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email', {
        description: 'Please enter a valid email address',
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await subscribeToNewsletter(email);
      if (result.alreadySubscribed) {
        toast.info('Already subscribed', {
          description: 'This email is already on our list.',
          duration: 5000,
        });
      } else {
        trackNewsletterSignup();
        toast.success('Successfully subscribed!', {
          description: 'Welcome to CrypLounge newsletter. Check your inbox for confirmation.',
          duration: 5000,
        });
      }
      setEmail('');
    } catch {
      toast.error('Subscription failed', {
        description: 'Could not subscribe right now. Please try again in a moment.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-50 dark:bg-[#161618] border-t border-gray-200 dark:border-white/[0.08] transition-colors">
      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About CrypLounge */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-800 dark:border-gray-200 flex items-center justify-center">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-800 dark:bg-gray-200 rounded-full"></div>
              </div>
              <span className="text-base sm:text-lg text-gray-800 dark:text-[#F3F3F5] font-medium">CrypLounge</span>
            </div>
            <p className="text-gray-500 dark:text-[#A0A0A5] text-sm sm:text-base mb-4 sm:mb-6">
              Your trusted source for cryptocurrency, blockchain, Web3, DeFi, and digital asset news.
            </p>
            <div className="flex gap-2 sm:gap-3">
              <a
                href="https://twitter.com/cryplounge"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:bg-[#F1EFA5] dark:hover:bg-[#FFD200]/20 hover:border-[#FFD200] transition-all group"
                aria-label="Follow CrypLounge on X (Twitter)"
              >
                <Twitter className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#FFD200]" />
              </a>
              <a
                href="https://t.me/cryplounge"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:bg-[#F1EFA5] dark:hover:bg-[#FFD200]/20 hover:border-[#FFD200] transition-all group"
                aria-label="Join CrypLounge on Telegram"
              >
                <Send className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#FFD200]" />
              </a>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] w-10 h-10 sm:w-11 sm:h-11 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg flex items-center justify-center hover:bg-[#F1EFA5] dark:hover:bg-[#FFD200]/20 hover:border-[#FFD200] transition-all group"
                aria-label="RSS Feed"
              >
                <Rss className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-[#FFD200]" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base sm:text-lg font-medium">Explore</h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: 'News', page: 'news' },
                { label: 'Ecosystem', page: 'ecosystem' },
                { label: 'Events', page: 'events' },
                { label: 'Founders', page: 'founders' },
                { label: 'Newsletter', page: 'newsletter' },
              ].map(({ label, page }) => (
                <li key={label}>
                  <Link
                    href={pageKeyToHref(page)}
                    className="text-gray-500 dark:text-[#A0A0A5] text-sm sm:text-base hover:text-[#FFD200] transition-colors text-left min-h-[44px] flex items-center"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-gray-800 dark:text-[#F3F3F5] mb-4 text-base sm:text-lg font-medium">Company</h3>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: 'About', page: 'about' },
                { label: 'Contact', page: 'contact' },
                { label: 'Advertise', page: 'advertise' },
                { label: 'Editorial Policy', page: 'editorial-policy' },
                { label: 'Fact-check Policy', page: 'fact-check-policy' },
                { label: 'Privacy', page: 'privacy' },
                { label: 'Terms', page: 'terms' },
              ].map(({ label, page }) => (
                <li key={label}>
                  <Link
                    href={pageKeyToHref(page)}
                    className="text-gray-500 dark:text-[#A0A0A5] text-sm sm:text-base hover:text-[#FFD200] transition-colors text-left min-h-[44px] flex items-center"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-gray-800 dark:text-[#F3F3F5] mb-4">Newsletter</h3>
            <p className="text-gray-500 dark:text-[#A0A0A5] text-sm mb-4">
              Stay updated with the latest crypto news delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit}>
              <div className="relative mb-4">
                <input 
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-lg text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-[#FFD200] pr-12 transition-all"
                  aria-label="Enter your email address to subscribe to our newsletter"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#FFD200] rounded-lg flex items-center justify-center hover:bg-black dark:hover:bg-white transition-colors group disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Submit newsletter subscription"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-black group-hover:text-[#FFD200]" />
                  ) : (
                    <span className="text-black group-hover:text-[#FFD200] text-sm">→</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-4">
          <p className="text-center text-xs text-gray-500 dark:text-[#A0A0A5]">
            © {new Date().getFullYear()} CrypLounge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}