'use client';

import { Share2, Bookmark, Twitter, Facebook, Link2, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareSaveButtonsProps {
  title?: string;
  url?: string;
}

export function ShareSaveButtons({ title = 'Check this out!', url = '' }: ShareSaveButtonsProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url || window.location.href);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Share Button */}
      <div className="relative">
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
        >
          <Share2 className="w-4 h-4 text-gray-600" />
          <span className="hidden sm:inline text-gray-800">Share</span>
        </button>

        {showShareMenu && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <button
              onClick={handleCopyLink}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              {linkCopied ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-600">Link copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  Copy link
                </>
              )}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url || window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Twitter className="w-4 h-4" />
              Share on Twitter
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Facebook className="w-4 h-4" />
              Share on Facebook
            </a>
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
          isSaved
            ? 'bg-yellow-100 border-yellow-200 text-yellow-900'
            : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
        }`}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}
