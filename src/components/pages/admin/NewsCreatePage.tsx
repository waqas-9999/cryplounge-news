'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient } from '@/lib/api-client';
import { ArticleWorkspace } from '@/components/admin/article-workspace/ArticleWorkspace';
import { EMPTY_DRAFT } from '@/components/admin/article-workspace/types';

interface NewsCreatePageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewsCreatePage({ currentPage, onNavigate, onLogout }: NewsCreatePageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-dvh bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="New Article" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <ArticleWorkspace
            mode="create"
            initial={EMPTY_DRAFT}
            onSave={payload => apiClient.post<{ id: string; slug: string }>('articles', payload)}
            // Continue in the editor for the saved article, so the next save
            // updates it rather than creating a duplicate.
            onSaved={result => onNavigate(`admin/news/edit/${result.id}`)}
            onBack={() => onNavigate('admin/news')}
          />
        </main>
      </div>
    </div>
  );
}
