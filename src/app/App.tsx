import { useEffect, useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AdminAuthService } from './utils/adminAuth';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SEOHead, generateSEO } from './components/SEOHead';
import { ThemeProvider } from './contexts/ThemeContext';
import { CategoriesProvider } from './contexts/CategoriesContext';
import { HomePage } from './pages/HomePage';
import { LatestPage } from './pages/LatestPage';
import { MarketsPage } from './pages/MarketsPage';
import { EcosystemPage } from './pages/EcosystemPage';
import { RegulationPage } from './pages/RegulationPage';
import { ResearchPage } from './pages/ResearchPage';
import { CategoryPage } from './pages/CategoryPage';
import { LearnPage } from './pages/LearnPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import EditorialPolicyPage from './pages/EditorialPolicyPage';
import FactCheckPolicyPage from './pages/FactCheckPolicyPage';
import CorrectionsPolicyPage from './pages/CorrectionsPolicyPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';
import NewsletterPage from './pages/NewsletterPage';
import AuthorPage from './pages/AuthorPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { NewsListPage } from './pages/admin/NewsListPage';
import { NewsCreatePage } from './pages/admin/NewsCreatePage';
import { NewsEditPage } from './pages/admin/NewsEditPage';
import { NewsAnalyticsPage } from './pages/admin/NewsAnalyticsPage';
import { NewsDetailAnalyticsPage } from './pages/admin/NewsDetailAnalyticsPage';
import { NewsSourcesPage } from './pages/admin/NewsSourcesPage';
import { NewsModerationQueuePage } from './pages/admin/NewsModerationQueuePage';
import { NewsAISettingsPage } from './pages/admin/NewsAISettingsPage';
import { NewsAutoFetchPage } from './pages/admin/NewsAutoFetchPage';
import { NewsCommentsPage } from './pages/admin/NewsCommentsPage';
import { ReportsExportPage } from './pages/admin/ReportsExportPage';
import { NewsCategoriesPage } from './pages/admin/NewsCategoriesPage';
import { RolesPermissionsPage } from './pages/admin/RolesPermissionsPage';
import { AdminProfilePage } from './pages/admin/AdminProfilePage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';
import { GeneralSettingsPage } from './pages/admin/settings/GeneralSettingsPage';
import { AppearanceSettingsPage } from './pages/admin/settings/AppearanceSettingsPage';
import { EmailSettingsPage } from './pages/admin/settings/EmailSettingsPage';
import { SecuritySettingsPage } from './pages/admin/settings/SecuritySettingsPage';
import { SEOSettingsPage } from './pages/admin/settings/SEOSettingsPage';
import { APISettingsPage } from './pages/admin/settings/APISettingsPage';
import { APIIntegrationsPage } from './pages/admin/settings/APIIntegrationsPage';
import { BackupSettingsPage } from './pages/admin/settings/BackupSettingsPage';
import { BehaviorTrackingPage } from './pages/admin/BehaviorTrackingPage';
import { RouteMatche } from './utils/routes';
import { updateDocumentHead, getPageSEO } from './utils/seo';
import { initializeAIOptimizations, smartPrefetcher, recommendationEngine } from './utils/ai-optimization';
import { analytics } from './utils/analytics';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [previousPage, setPreviousPage] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    // Check if admin is already authenticated
    return AdminAuthService.isAuthenticated();
  });

  const vrImage = "https://images.unsplash.com/photo-1675668408848-47504a82b002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzb24lMjBnbGFzc2VzJTIwVlIlMjBoZWFkc2V0fGVufDF8fHx8MTc2MjkyNTkxMXww&ixlib=rb-4.1.0&q=80&w=1080";
  const businessmanImage = "https://images.unsplash.com/photo-1627199219038-e8263f729e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzc21hbiUyMHNtaWxpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzYyOTI1OTExfDA&ixlib=rb-4.1.0&q=80&w=1080";
  const solanaImage = "https://images.unsplash.com/photo-1614853316657-84cba51df68c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhbmElMjBjcnlwdG8lMjBibHVlJTIwZ3JhZGllbnR8ZW58MXx8fHwxNzYyOTI1OTExfDA&ixlib=rb-4.1.0&q=80&w=1080";
  const phoneImage = "https://images.unsplash.com/photo-1621691187532-bbeb671757ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaG9uZSUyMHNjcmVlbiUyMGFwcCUyMGhvbmdrb25nfGVufDF8fHx8MTc2MjkyNTkxMnww&ixlib=rb-4.1.0&q=80&w=1080";
  const speakerImage = "https://images.unsplash.com/photo-1712971404080-87271ce2e473?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25mZXJlbmNlJTIwc3BlYWtlciUyMHB1cnBsZSUyMHN0YWdlfGVufDF8fHx8MTc2MjkyNTkxM3ww&ixlib=rb-4.1.0&q=80&w=1080";
  const documentImage = "https://images.unsplash.com/photo-1527874594978-ee4f8a05b4c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxGVFglMjBiYW5rcnVwdGN5JTIwZG9jdW1lbnR8ZW58MXx8fHwxNzYyOTI1OTEzfDA&ixlib=rb-4.1.0&q=80&w=1080";
  const asianBusinessmanImage = "https://images.unsplash.com/photo-1758691737278-3af15b37af48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGJ1c2luZXNzbWFuJTIwZ2xhc3NlcyUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NjI5MjU5MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080";

  const images = {
    vrImage,
    businessmanImage,
    solanaImage,
    phoneImage,
    speakerImage,
    documentImage,
    asianBusinessmanImage
  };

  // Initialize AI optimizations on mount
  useEffect(() => {
    initializeAIOptimizations();
  }, []);

  // Update SEO metadata and track analytics when page changes
  useEffect(() => {
    // Update SEO
    const seoConfig = getPageSEO(currentPage);
    updateDocumentHead(seoConfig);

    // Track page view
    analytics.trackPageView(currentPage, seoConfig.title, `/${currentPage}`);

    // Record navigation pattern for AI predictions
    if (previousPage) {
      smartPrefetcher.recordNavigation(previousPage, currentPage);
    }

    // Prefetch predicted next pages
    smartPrefetcher.prefetchPredictedPages(currentPage);

    // Update user interests based on page type
    if (currentPage.startsWith('news/')) {
      const category = currentPage.split('/')[1];
      if (category) {
        recommendationEngine.updateInterest('category', category, 0.1);
      }
    } else if (currentPage.startsWith('learn/')) {
      const parts = currentPage.split('/');
      if (parts[1] && parts[1] !== 'crypto' && parts[1] !== 'ecosystem') {
        recommendationEngine.updateInterest('ecosystem', parts[1], 0.15);
      }
      if (parts[2]) {
        recommendationEngine.updateInterest('category', parts[2], 0.1);
      }
    }
  }, [currentPage, previousPage]);

  const handleNavigate = (page: string) => {
    // Check if navigating to protected admin page
    if (page.startsWith('admin/') && page !== 'admin/login') {
      if (!AdminAuthService.isAuthenticated()) {
        // Redirect to admin login
        setPreviousPage(currentPage);
        setCurrentPage('admin/login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    setPreviousPage(currentPage);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    AdminAuthService.clearSession();
    setIsAdminAuthenticated(false);
    setCurrentPage('home');
  };

  const renderPage = () => {
    // Admin pages
    if (currentPage === 'admin/login') {
      return <AdminLoginPage onNavigate={handleNavigate} onAdminLogin={handleAdminLogin} />;
    }

    if (currentPage.startsWith('admin/')) {
      // Redirect to login if not authenticated
      if (!isAdminAuthenticated) {
        return <AdminLoginPage onNavigate={handleNavigate} onAdminLogin={handleAdminLogin} />;
      }

      // Admin dashboard
      if (currentPage === 'admin/dashboard') {
        return <AdminDashboardPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }

      // News management
      if (currentPage === 'admin/news') {
        return <NewsListPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/news/create') {
        return <NewsCreatePage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/news/comments') {
        return <NewsCommentsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage.startsWith('admin/news/edit/')) {
        const articleId = currentPage.split('/').pop();
        return <NewsEditPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} articleId={articleId} />;
      }
      if (currentPage === 'admin/news/analytics') {
        return <NewsAnalyticsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage.startsWith('admin/news/analytics/')) {
        const articleId = currentPage.split('/').pop();
        return <NewsDetailAnalyticsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} articleId={articleId} />;
      }
      if (currentPage === 'admin/news/categories') {
        return <NewsCategoriesPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/news/sources') {
        return <NewsSourcesPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/news/moderation') {
        return <NewsModerationQueuePage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/news/ai-settings') {
        return <NewsAISettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/news/auto-fetch') {
        return <NewsAutoFetchPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }

      // Reports & Export
      if (currentPage === 'admin/reports-export') {
        return <ReportsExportPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }

      // Roles & Permissions
      if (currentPage === 'admin/roles-permissions') {
        return <RolesPermissionsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }

      // Admin Profile
      if (currentPage === 'admin/profile') {
        return <AdminProfilePage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }

      // System Settings
      if (currentPage === 'admin/system-settings') {
        return <SystemSettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/general') {
        return <GeneralSettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/api-integrations') {
        return <APIIntegrationsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/appearance') {
        return <AppearanceSettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/email') {
        return <EmailSettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/security') {
        return <SecuritySettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/seo') {
        return <SEOSettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/api') {
        return <APISettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }
      if (currentPage === 'admin/settings/backup') {
        return <BackupSettingsPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }

      // Behavior Tracking
      if (currentPage === 'admin/tracking') {
        return <BehaviorTrackingPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
      }

      // Default admin page
      return <AdminDashboardPage currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleAdminLogout} />;
    }
    
    // Home page
    if (currentPage === 'home') {
      return <HomePage images={images} onNavigate={handleNavigate} />;
    }

    // Learn page (top-level route)
    if (currentPage === 'learn') {
      return <LearnPage images={images} onNavigate={handleNavigate} />;
    }

    // News routing using centralized RouteMatche
    const newsMatch = RouteMatche.matchNewsRoute(currentPage);
    if (newsMatch.type) {
      switch (newsMatch.type) {
        case 'article':
          return <ArticleDetailPage 
            category={newsMatch.category!} 
            categorySlug={newsMatch.category!}
            articleSlug={newsMatch.slug!}
            images={images} 
            onNavigate={handleNavigate}
          />;
        
        case 'category':
          if (newsMatch.category === 'latest') {
            return <LatestPage images={images} onNavigate={handleNavigate} />;
          }
          if (newsMatch.category === 'markets') {
            return <MarketsPage images={images} onNavigate={handleNavigate} />;
          }
          if (newsMatch.category === 'ecosystem') {
            return <EcosystemPage images={images} onNavigate={handleNavigate} />;
          }
          if (newsMatch.category === 'regulation') {
            return <RegulationPage images={images} onNavigate={handleNavigate} />;
          }
          if (newsMatch.category === 'research') {
            return <ResearchPage images={images} onNavigate={handleNavigate} />;
          }
          return <CategoryPage category={newsMatch.category!} images={images} onNavigate={handleNavigate} />;
      }
    }
    
    // Company pages
    if (currentPage === 'about') {
      return <AboutPage onNavigate={handleNavigate} />;
    }
    
    if (currentPage === 'contact') {
      return <ContactPage onNavigate={handleNavigate} />;
    }
    
    if (currentPage === 'editorial-policy') {
      return <EditorialPolicyPage onNavigate={handleNavigate} />;
    }
    
    if (currentPage === 'fact-check-policy') {
      return <FactCheckPolicyPage onNavigate={handleNavigate} />;
    }
    
    if (currentPage === 'corrections-policy') {
      return <CorrectionsPolicyPage onNavigate={handleNavigate} />;
    }
    
    if (currentPage === 'terms') {
      return <TermsPage onNavigate={handleNavigate} />;
    }
    
    if (currentPage === 'privacy') {
      return <PrivacyPage onNavigate={handleNavigate} />;
    }
    
    // Search page
    if (currentPage === 'search' || currentPage.startsWith('search/')) {
      const searchQuery = currentPage.startsWith('search/')
        ? decodeURIComponent(currentPage.split('/')[1])
        : '';
      return <SearchPage onNavigate={handleNavigate} initialQuery={searchQuery} />;
    }

    // Newsletter page
    if (currentPage === 'newsletter') {
      return <NewsletterPage onNavigate={handleNavigate} />;
    }

    // Author page
    if (currentPage === 'author' || currentPage.startsWith('author/')) {
      const authorSlug = currentPage.startsWith('author/') ? currentPage.split('/')[1] : undefined;
      return <AuthorPage onNavigate={handleNavigate} authorSlug={authorSlug} />;
    }

    // 404 for unknown routes
    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  // Check if current page is an auth page or admin page
  const isAuthPage = ['signup', 'login', 'forgot-password'].includes(currentPage);
  const isAdminPage = currentPage.startsWith('admin/');

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CategoriesProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <SEOHead {...getPageSEO(currentPage)} />
            {!isAuthPage && !isAdminPage && <Header onNavigate={handleNavigate} currentPage={currentPage} />}
            {renderPage()}
            {!isAuthPage && !isAdminPage && <Footer onNavigate={handleNavigate} />}
            <Toaster position="bottom-right" />
          </div>
        </CategoriesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}