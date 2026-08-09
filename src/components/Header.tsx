'use client';

import Link from 'next/link';
import { Search, Menu, ChevronDown, Sun, Moon, X, TrendingUp, Rss } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { searchArticles } from '@/services/news';
import type { Article } from '@/types/article';
import { Badge } from './ui/badge';
import { pageKeyToHref } from '@/lib/navigation';

interface HeaderProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
}

/**
 * Primary navigation.
 *
 * Every entry resolves to a distinct URL. Topic entries use `?topic=` on their
 * section page: the section pages exist and render, whereas a bare
 * `/news/markets/bitcoin` would be parsed as an *article* slug and 404.
 * When topic landing pages are built, swap these for real paths.
 */
/**
 * Primary navigation — the six sections the platform is built around.
 *
 * Markets is intentionally absent: market coverage is editorial and lives at
 * /news/market. There are no prices, rankings, charts or dashboards.
 *
 * Only News carries a dropdown, and it lists desk-level categories only.
 * Niche topics (Bitcoin, DeFi, NFTs, ...) are reached through tags, filters
 * and search rather than the main nav.
 */
const NAV_ITEMS = [
  {
    name: 'News', slug: 'news', page: 'news',
    children: [
      { label: 'All News', page: 'news' },
      { label: 'Industry', page: 'news/industry' },
      { label: 'Business', page: 'news/business' },
      { label: 'Technology', page: 'news/technology' },
      { label: 'Security', page: 'news/security' },
      { label: 'Policy', page: 'news/policy' },
      { label: 'Adoption', page: 'news/adoption' },
      { label: 'Market', page: 'news/market' },
    ],
  },
  { name: 'Ecosystem', slug: 'ecosystem', page: 'ecosystem' },
  { name: 'Events', slug: 'events', page: 'events' },
  { name: 'Founders', slug: 'founders', page: 'founders' },
];

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'ES', label: 'Español' },
  { code: 'ZH', label: '中文' },
  { code: 'AR', label: 'العربية' },
  { code: 'HI', label: 'हिंदी' },
];

export function Header({ onNavigate, currentPage = 'home' }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setIsLangOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsSearchOpen(false); setIsMobileMenuOpen(false); }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const [searchResults, setSearchResults] = useState<Article[]>([]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    searchArticles(searchQuery, 6)
      .then(results => {
        if (!cancelled) setSearchResults(results);
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      });
    return () => {
      cancelled = true;
    };
  }, [searchQuery]);

  const isActive = (slug: string) => {
    // News is the parent of every /news/* URL, so it stays lit across the desk.
    if (slug === 'news') return currentPage === 'news' || currentPage.startsWith('news/');
    return currentPage === slug || currentPage.startsWith(`${slug}/`);
  };

  const handleNavHover = (slug: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredNav(slug);
  };

  const handleNavLeave = () => {
    hoverTimeout.current = setTimeout(() => setHoveredNav(null), 120);
  };

  const handleNavClick = (item: typeof NAV_ITEMS[0]) => {
    onNavigate?.(item.page);
    setHoveredNav(null);
  };

  return (
    <>
      <header className={`border-b px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#0F0F10]/95 backdrop-blur-sm shadow-md'
          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F0F10] shadow-sm'
      }`}>
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          {/* Logo + Desktop Nav */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[44px]"
              aria-label="Go to home page"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-800 dark:border-gray-200 flex items-center justify-center">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gray-800 dark:bg-gray-200 rounded-full" />
              </div>
              <span className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200">CrypLounge</span>
            </Link>

            {/* Desktop navigation with mega-menus */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {NAV_ITEMS.map(item => (
                <div
                  key={item.slug}
                  className="relative"
                  onMouseEnter={() => item.children ? handleNavHover(item.slug) : undefined}
                  onMouseLeave={item.children ? handleNavLeave : undefined}
                >
                  <Link
                    href={pageKeyToHref(item.page)}
                    onClick={() => setHoveredNav(null)}
                    className={`flex items-center gap-1 text-sm xl:text-base min-h-[44px] px-2.5 transition-all duration-200 ${
                      isActive(item.slug) ? 'text-[#FFD200]' : 'text-gray-600 dark:text-gray-400'
                    } hover:text-[#FFD200]`}
                    aria-label={item.name}
                    aria-haspopup={!!item.children}
                    aria-expanded={hoveredNav === item.slug}
                  >
                    {item.name}
                    {item.children && (
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${hoveredNav === item.slug ? 'rotate-180' : ''}`} />
                    )}
                  </Link>

                  {/* Dropdown */}
                  {item.children && hoveredNav === item.slug && (
                    <div
                      className="absolute left-0 top-full pt-1 z-50"
                      onMouseEnter={() => handleNavHover(item.slug)}
                      onMouseLeave={handleNavLeave}
                    >
                      <div className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl py-2 min-w-[200px]">
                        <p className="px-4 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{item.name}</p>
                        {item.children.map(child => (
                          <Link
                            key={child.label}
                            href={pageKeyToHref(child.page)}
                            onClick={() => setHoveredNav(null)}
                            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:text-[#FFD200] hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-800 dark:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setIsMobileMenuOpen(v => !v)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            {/* Language selector — desktop */}
            <div ref={langRef} className="relative hidden xl:block">
              <button
                onClick={() => setIsLangOpen(v => !v)}
                className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-[#FFD200] transition-colors px-3 py-2 text-sm min-h-[44px]"
                aria-label="Select language"
                aria-expanded={isLangOpen}
              >
                {selectedLang}
                <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>
              {isLangOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg py-1 min-w-[150px] z-50">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setSelectedLang(lang.code); setIsLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                        selectedLang === lang.code
                          ? 'text-[#FFD200] bg-[#FFD200]/5'
                          : 'text-gray-700 dark:text-gray-300 hover:text-[#FFD200] hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="text-xs text-gray-400 w-6">{lang.code}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(v => !v)}
              className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
                isSearchOpen
                  ? 'text-[#FFD200] bg-yellow-50 dark:bg-yellow-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-[#FFD200] hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-label="Toggle search"
            >
              {isSearchOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Search className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            {/* Theme toggle */}
            <button
              className="text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>

        {/* Search Panel */}
        {isSearchOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" style={{ top: '65px' }} onClick={() => setIsSearchOpen(false)} />
            <div ref={searchRef} className="absolute left-0 right-0 top-full mt-0 bg-white dark:bg-[#1A1A1A] border-t border-gray-200 dark:border-gray-800 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search news, markets, research…"
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200] text-lg"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {!searchQuery ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#FFD200]" />
                      <span className="text-gray-900 dark:text-white font-medium">Trending Searches</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Bitcoin', 'Ethereum', 'DeFi', 'ETF', 'Layer 2', 'Regulation', 'Web3', 'RWA'].map(term => (
                        <button
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          className="px-4 py-2 bg-gray-100 dark:bg-[#0D0D0D] border border-gray-200 dark:border-gray-800 rounded-full text-gray-700 dark:text-gray-300 hover:border-[#FFD200] hover:text-[#FFD200] transition-colors text-sm"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No results found for "{searchQuery}"</p>
                    <p className="text-sm text-gray-500 mt-2">Try different keywords or browse a category</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-900 dark:text-white font-medium">Articles</span>
                      <span className="text-sm text-gray-500">{searchResults.length} results</span>
                    </div>
                    <div className="space-y-2">
                      {searchResults.map(article => (
                        <button
                          key={article.id}
                          onClick={() => { onNavigate?.(`news/${article.category}/${article.slug || article.id}`); setIsSearchOpen(false); setSearchQuery(''); }}
                          className="w-full text-left bg-gray-50 dark:bg-[#0D0D0D] rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:border-[#FFD200] transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                            <span className="text-xs text-gray-500">{article.readTime}</span>
                          </div>
                          <p className="text-gray-900 dark:text-white text-sm line-clamp-1">{article.title}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </header>

      {/* Mobile Menu — full-screen drawer */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Drawer */}
        <div className={`absolute left-0 top-0 bottom-0 w-[85vw] max-w-[340px] bg-white dark:bg-[#0F0F10] flex flex-col transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <button onClick={() => { onNavigate?.(''); setIsMobileMenuOpen(false); }} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-gray-800 dark:border-gray-200 flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-800 dark:bg-gray-200 rounded-full" />
              </div>
              <span className="text-base font-medium text-gray-800 dark:text-gray-200">CrypLounge</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile search */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                onFocus={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-100 dark:bg-[#1A1A1A] border border-transparent rounded-lg text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFD200]"
              />
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-3">
            {NAV_ITEMS.map(item => (
              <div key={item.slug}>
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      if (!item.children) { onNavigate?.(item.page); setIsMobileMenuOpen(false); }
                      else setMobileExpanded(mobileExpanded === item.slug ? null : item.slug);
                    }}
                    className={`flex-1 text-left flex items-center justify-between px-5 py-3.5 min-h-[48px] text-base transition-colors ${
                      isActive(item.slug)
                        ? 'text-[#FFD200]'
                        : 'text-gray-800 dark:text-gray-200'
                    } hover:text-[#FFD200]`}
                  >
                    <span>{item.name}</span>
                    {item.children && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${mobileExpanded === item.slug ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  {item.children && (
                    <button
                      onClick={() => { onNavigate?.(item.page); setIsMobileMenuOpen(false); }}
                      className="px-3 py-3.5 text-xs text-gray-400 hover:text-[#FFD200] transition-colors"
                    >
                      All
                    </button>
                  )}
                </div>
                {/* Accordion sub-items */}
                {item.children && mobileExpanded === item.slug && (
                  <div className="bg-gray-50 dark:bg-white/[0.03] border-t border-b border-gray-100 dark:border-gray-800">
                    {item.children.map(child => (
                      <button
                        key={child.label}
                        onClick={() => { onNavigate?.(child.page); setIsMobileMenuOpen(false); }}
                        className="w-full text-left px-8 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#FFD200] transition-colors"
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Secondary links */}
          <div className="border-t border-gray-100 dark:border-gray-800 py-2">
            {[
              { label: 'Newsletter', page: 'newsletter' },
              { label: 'Submit a Story', page: 'submit-story' },
              { label: 'About', page: 'about' },
              { label: 'Contact', page: 'contact' },
            ].map(link => (
              <button
                key={link.page}
                onClick={() => { onNavigate?.(link.page); setIsMobileMenuOpen(false); }}
                className="w-full text-left px-5 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-[#FFD200] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Bottom controls */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-5 py-4 space-y-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-[#1A1A1A] rounded-xl text-sm text-gray-700 dark:text-gray-300"
            >
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              {theme === 'dark'
                ? <Moon className="w-4 h-4 text-[#FFD200]" />
                : <Sun className="w-4 h-4 text-[#FFD200]" />}
            </button>

            {/* Language */}
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLang(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedLang === lang.code
                      ? 'bg-[#FFD200] text-black'
                      : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 hover:text-[#FFD200]'
                  }`}
                >
                  {lang.code}
                </button>
              ))}
            </div>

            {/* RSS */}
            <a
              href="/rss.xml"
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-[#FFD200] transition-colors"
            >
              <Rss className="w-4 h-4" />
              RSS Feed
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
