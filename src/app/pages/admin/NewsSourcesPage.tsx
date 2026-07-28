import { useState } from 'react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { 
  Rss, 
  Plus, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Globe,
  Key,
  Save,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';

interface NewsSourcesPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface NewsSource {
  id: string;
  name: string;
  type: 'api' | 'rss' | 'webhook';
  url: string;
  apiKey?: string;
  enabled: boolean;
  lastFetch?: string;
  articlesCount: number;
  category: string;
  autoPublish: boolean;
  requiresApproval: boolean;
}

export function NewsSourcesPage({ currentPage, onNavigate, onLogout }: NewsSourcesPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sources, setSources] = useState<NewsSource[]>([
    {
      id: '1',
      name: 'Reuters Finance API',
      type: 'api',
      url: 'https://reuters.com/api/v1/',
      apiKey: 'your-api-key-here',
      enabled: true,
      lastFetch: '2025-11-13T10:30:00',
      articlesCount: 247,
      category: 'Finance',
      autoPublish: false,
      requiresApproval: true
    },
    {
      id: '2',
      name: 'Bloomberg RSS',
      type: 'rss',
      url: 'https://www.bloomberg.com/feeds/rss/',
      enabled: true,
      lastFetch: '2025-11-13T09:45:00',
      articlesCount: 156,
      category: 'Finance',
      autoPublish: false,
      requiresApproval: true
    },
    {
      id: '3',
      name: 'TechCrunch RSS',
      type: 'rss',
      url: 'https://techcrunch.com/rss',
      enabled: true,
      lastFetch: '2025-11-13T08:20:00',
      articlesCount: 189,
      category: 'Technology',
      autoPublish: false,
      requiresApproval: true
    },
    {
      id: '4',
      name: 'Financial Times API',
      type: 'api',
      url: 'https://ft.com/api/',
      apiKey: 'your-api-key-here',
      enabled: false,
      articlesCount: 0,
      category: 'Business',
      autoPublish: false,
      requiresApproval: true
    }
  ]);

  const [isAddingSource, setIsAddingSource] = useState(false);
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [newSource, setNewSource] = useState<Partial<NewsSource>>({
    name: '',
    type: 'rss',
    url: '',
    apiKey: '',
    enabled: true,
    category: 'All',
    autoPublish: false,
    requiresApproval: true
  });

  const handleToggleSource = (id: string) => {
    setSources(sources.map(source => 
      source.id === id ? { ...source, enabled: !source.enabled } : source
    ));
    const source = sources.find(s => s.id === id);
    toast.success(`${source?.name} ${source?.enabled ? 'disabled' : 'enabled'}`);
  };

  const handleDeleteSource = (id: string) => {
    const source = sources.find(s => s.id === id);
    if (confirm(`Are you sure you want to delete "${source?.name}"?`)) {
      setSources(sources.filter(s => s.id !== id));
      toast.success('Source deleted successfully');
    }
  };

  const handleAddSource = () => {
    if (!newSource.name || !newSource.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    const source: NewsSource = {
      id: Date.now().toString(),
      name: newSource.name,
      type: newSource.type || 'rss',
      url: newSource.url,
      apiKey: newSource.apiKey,
      enabled: newSource.enabled || true,
      articlesCount: 0,
      category: newSource.category || 'All',
      autoPublish: newSource.autoPublish || false,
      requiresApproval: newSource.requiresApproval !== false
    };

    setSources([...sources, source]);
    setIsAddingSource(false);
    setNewSource({
      name: '',
      type: 'rss',
      url: '',
      apiKey: '',
      enabled: true,
      category: 'All',
      autoPublish: false,
      requiresApproval: true
    });
    toast.success('Source added successfully');
  };

  const handleTestConnection = async (source: NewsSource) => {
    toast.info(`Testing connection to ${source.name}...`);
    // Simulate API test
    setTimeout(() => {
      toast.success(`Connection to ${source.name} successful!`);
    }, 1500);
  };

  const handleFetchNow = async (source: NewsSource) => {
    toast.info(`Fetching news from ${source.name}...`);
    // Simulate fetch
    setTimeout(() => {
      toast.success(`Fetched 12 new articles from ${source.name}`);
      setSources(sources.map(s => 
        s.id === source.id 
          ? { ...s, lastFetch: new Date().toISOString(), articlesCount: s.articlesCount + 12 }
          : s
      ));
    }, 2000);
  };

  const categories = [
    'All', 'Finance', 'Technology', 'Geopolitics', 'Business'
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar 
        currentPage={currentPage} 
        onNavigate={onNavigate} 
        onLogout={onLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader 
          title="News Sources"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Actions */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-gray-100 mb-2">External News Sources</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Configure external APIs, RSS feeds, and webhooks for automated news fetching
                </p>
              </div>
              <button
                onClick={() => setIsAddingSource(true)}
                className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Source
              </button>
            </div>

            {/* Add New Source Form */}
            {isAddingSource && (
              <div className="mb-6 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Add New Source</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Source Name *
                    </label>
                    <input
                      type="text"
                      value={newSource.name}
                      onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                      placeholder="e.g., CryptoPanic API"
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Source Type *
                    </label>
                    <select
                      value={newSource.type}
                      onChange={(e) => setNewSource({ ...newSource, type: e.target.value as 'api' | 'rss' | 'webhook' })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    >
                      <option value="rss">RSS Feed</option>
                      <option value="api">API</option>
                      <option value="webhook">Webhook</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      URL/Endpoint *
                    </label>
                    <input
                      type="url"
                      value={newSource.url}
                      onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                      placeholder="https://example.com/rss or https://api.example.com/"
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>

                  {newSource.type === 'api' && (
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={newSource.apiKey}
                        onChange={(e) => setNewSource({ ...newSource, apiKey: e.target.value })}
                        placeholder="Enter API key"
                        className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Default Category
                    </label>
                    <select
                      value={newSource.category}
                      onChange={(e) => setNewSource({ ...newSource, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-4">
                  <label className="flex items-center gap-2">
                    <Switch
                      checked={newSource.enabled}
                      onCheckedChange={(checked) => setNewSource({ ...newSource, enabled: checked })}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable immediately</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <Switch
                      checked={!newSource.requiresApproval}
                      onCheckedChange={(checked) => setNewSource({ ...newSource, requiresApproval: !checked })}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto-publish (skip moderation)</span>
                  </label>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setIsAddingSource(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddSource}
                    className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
              </div>
            )}

            {/* Sources List */}
            <div className="space-y-4">
              {sources.map(source => (
                <div
                  key={source.id}
                  className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${
                        source.type === 'api' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        source.type === 'rss' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        'bg-green-100 dark:bg-green-900/20'
                      }`}>
                        {source.type === 'api' ? (
                          <Key className={`w-5 h-5 ${
                            source.type === 'api' ? 'text-blue-600 dark:text-blue-400' : ''
                          }`} />
                        ) : source.type === 'rss' ? (
                          <Rss className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-900 dark:text-gray-100">{source.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            source.type === 'api' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
                            source.type === 'rss' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300' :
                            'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                          }`}>
                            {source.type.toUpperCase()}
                          </span>
                          {source.enabled ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{source.url}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>Category: <span className="text-gray-900 dark:text-gray-100">{source.category}</span></span>
                          <span>•</span>
                          <span>Articles: <span className="text-gray-900 dark:text-gray-100">{source.articlesCount}</span></span>
                          {source.lastFetch && (
                            <>
                              <span>•</span>
                              <span>Last fetch: <span className="text-gray-900 dark:text-gray-100">
                                {new Date(source.lastFetch).toLocaleString()}
                              </span></span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <label className="flex items-center gap-2 text-sm">
                            <Switch
                              checked={source.requiresApproval}
                              onCheckedChange={() => {
                                setSources(sources.map(s => 
                                  s.id === source.id ? { ...s, requiresApproval: !s.requiresApproval } : s
                                ));
                              }}
                            />
                            <span className="text-gray-700 dark:text-gray-300">Require approval</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={source.enabled}
                        onCheckedChange={() => handleToggleSource(source.id)}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => handleTestConnection(source)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Test Connection
                    </button>
                    
                    <button
                      onClick={() => handleFetchNow(source)}
                      disabled={!source.enabled}
                      className="px-3 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Fetch Now
                    </button>

                    <button
                      onClick={() => setEditingSource(source.id)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {sources.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800">
                  <Rss className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">No Sources Configured</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Add your first news source to start automated fetching
                  </p>
                  <button
                    onClick={() => setIsAddingSource(true)}
                    className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Source
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}