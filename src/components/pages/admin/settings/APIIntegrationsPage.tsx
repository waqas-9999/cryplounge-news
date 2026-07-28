'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { 
  Key, 
  Save, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Copy,
  Plus,
  Trash2,
  Activity,
  Zap,
  Image as ImageIcon,
  Newspaper,
  Mail,
  Database,
  Cloud,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface APIIntegrationsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface APIKey {
  id: string;
  name: string;
  category: 'news' | 'ai-llm' | 'image' | 'email' | 'analytics' | 'storage' | 'other';
  provider: string;
  apiKey: string;
  endpoint?: string;
  enabled: boolean;
  lastUsed?: string;
  requestsToday: number;
  monthlyLimit: number;
  status: 'active' | 'inactive' | 'error' | 'warning';
  description: string;
}

const API_CATEGORIES = {
  'news': { label: 'News APIs', icon: Newspaper, color: 'text-blue-600 dark:text-blue-400' },
  'ai-llm': { label: 'AI & LLM', icon: Zap, color: 'text-purple-600 dark:text-purple-400' },
  'image': { label: 'Image Generation', icon: ImageIcon, color: 'text-pink-600 dark:text-pink-400' },
  'email': { label: 'Email Services', icon: Mail, color: 'text-green-600 dark:text-green-400' },
  'analytics': { label: 'Analytics', icon: Activity, color: 'text-orange-600 dark:text-orange-400' },
  'storage': { label: 'Storage & CDN', icon: Cloud, color: 'text-cyan-600 dark:text-cyan-400' },
  'other': { label: 'Other Services', icon: Settings, color: 'text-gray-600 dark:text-gray-400' }
};

const POPULAR_PROVIDERS = {
  'news': [
    { name: 'CryptoPanic', endpoint: 'https://cryptopanic.com/api/v1/', docUrl: 'https://cryptopanic.com/developers/api/' },
    { name: 'CoinGecko', endpoint: 'https://api.coingecko.com/api/v3/', docUrl: 'https://www.coingecko.com/en/api' },
    { name: 'NewsAPI', endpoint: 'https://newsapi.org/v2/', docUrl: 'https://newsapi.org/docs' },
    { name: 'Blockchain.news', endpoint: 'https://blockchain.news/api/', docUrl: 'https://blockchain.news/api-docs' }
  ],
  'ai-llm': [
    { name: 'OpenAI', endpoint: 'https://api.openai.com/v1/', docUrl: 'https://platform.openai.com/docs' },
    { name: 'Anthropic Claude', endpoint: 'https://api.anthropic.com/v1/', docUrl: 'https://docs.anthropic.com/' },
    { name: 'Google Gemini', endpoint: 'https://generativelanguage.googleapis.com/v1/', docUrl: 'https://ai.google.dev/docs' },
    { name: 'Mistral AI', endpoint: 'https://api.mistral.ai/v1/', docUrl: 'https://docs.mistral.ai/' }
  ],
  'image': [
    { name: 'DALL-E (OpenAI)', endpoint: 'https://api.openai.com/v1/', docUrl: 'https://platform.openai.com/docs/guides/images' },
    { name: 'Stable Diffusion', endpoint: 'https://api.stability.ai/v1/', docUrl: 'https://platform.stability.ai/docs' },
    { name: 'Midjourney', endpoint: 'https://api.midjourney.com/v1/', docUrl: 'https://docs.midjourney.com/' },
    { name: 'Replicate', endpoint: 'https://api.replicate.com/v1/', docUrl: 'https://replicate.com/docs' }
  ],
  'email': [
    { name: 'SendGrid', endpoint: 'https://api.sendgrid.com/v3/', docUrl: 'https://docs.sendgrid.com/' },
    { name: 'Mailgun', endpoint: 'https://api.mailgun.net/v3/', docUrl: 'https://documentation.mailgun.com/' },
    { name: 'AWS SES', endpoint: 'https://email.us-east-1.amazonaws.com/', docUrl: 'https://docs.aws.amazon.com/ses/' }
  ],
  'analytics': [
    { name: 'Google Analytics', endpoint: 'https://www.googleapis.com/analytics/v3/', docUrl: 'https://developers.google.com/analytics' },
    { name: 'Mixpanel', endpoint: 'https://api.mixpanel.com/', docUrl: 'https://developer.mixpanel.com/docs' },
    { name: 'PostHog', endpoint: 'https://app.posthog.com/api/', docUrl: 'https://posthog.com/docs/api' }
  ],
  'storage': [
    { name: 'AWS S3', endpoint: 'https://s3.amazonaws.com/', docUrl: 'https://docs.aws.amazon.com/s3/' },
    { name: 'Cloudinary', endpoint: 'https://api.cloudinary.com/v1_1/', docUrl: 'https://cloudinary.com/documentation' },
    { name: 'Cloudflare R2', endpoint: 'https://api.cloudflare.com/client/v4/', docUrl: 'https://developers.cloudflare.com/r2/' }
  ]
};

export function APIIntegrationsPage({ currentPage, onNavigate, onLogout }: APIIntegrationsPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: '1',
      name: 'OpenAI GPT-4',
      category: 'ai-llm',
      provider: 'OpenAI',
      apiKey: 'sk-proj-abc123...xyz789',
      endpoint: 'https://api.openai.com/v1/',
      enabled: true,
      lastUsed: '2025-11-13T10:30:00',
      requestsToday: 1247,
      monthlyLimit: 100000,
      status: 'active',
      description: 'Used for AI content processing, summarization, and categorization'
    },
    {
      id: '2',
      name: 'CryptoPanic News API',
      category: 'news',
      provider: 'CryptoPanic',
      apiKey: 'cp_abc123...xyz789',
      endpoint: 'https://cryptopanic.com/api/v1/',
      enabled: true,
      lastUsed: '2025-11-13T09:15:00',
      requestsToday: 342,
      monthlyLimit: 50000,
      status: 'active',
      description: 'Automated news fetching from CryptoPanic'
    },
    {
      id: '3',
      name: 'DALL-E Image Generation',
      category: 'image',
      provider: 'OpenAI',
      apiKey: 'sk-img-abc123...xyz789',
      endpoint: 'https://api.openai.com/v1/',
      enabled: false,
      requestsToday: 0,
      monthlyLimit: 1000,
      status: 'inactive',
      description: 'Generate article hero images automatically'
    }
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showApiKey, setShowApiKey] = useState<{ [key: string]: boolean }>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newAPIKey, setNewAPIKey] = useState<Partial<APIKey>>({
    name: '',
    category: 'ai-llm',
    provider: '',
    apiKey: '',
    endpoint: '',
    enabled: true,
    monthlyLimit: 10000,
    description: ''
  });

  const handleToggleKey = (id: string) => {
    setApiKeys(apiKeys.map(key => 
      key.id === id ? { ...key, enabled: !key.enabled } : key
    ));
    const key = apiKeys.find(k => k.id === id);
    toast.success(`${key?.name} ${key?.enabled ? 'disabled' : 'enabled'}`);
  };

  const handleDeleteKey = (id: string) => {
    const key = apiKeys.find(k => k.id === id);
    if (confirm(`Are you sure you want to delete "${key?.name}"?`)) {
      setApiKeys(apiKeys.filter(k => k.id !== id));
      toast.success('API key deleted');
    }
  };

  const handleTestConnection = async (key: APIKey) => {
    toast.info(`Testing connection to ${key.provider}...`);
    
    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        toast.success(`Connection to ${key.provider} successful!`);
        setApiKeys(apiKeys.map(k => 
          k.id === key.id ? { ...k, status: 'active' as const } : k
        ));
      } else {
        toast.error(`Connection to ${key.provider} failed. Check your API key.`);
        setApiKeys(apiKeys.map(k => 
          k.id === key.id ? { ...k, status: 'error' as const } : k
        ));
      }
    }, 2000);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleAddAPIKey = () => {
    if (!newAPIKey.name || !newAPIKey.provider || !newAPIKey.apiKey) {
      toast.error('Please fill in all required fields');
      return;
    }

    const apiKey: APIKey = {
      id: Date.now().toString(),
      name: newAPIKey.name!,
      category: newAPIKey.category || 'other',
      provider: newAPIKey.provider!,
      apiKey: newAPIKey.apiKey!,
      endpoint: newAPIKey.endpoint,
      enabled: newAPIKey.enabled !== false,
      requestsToday: 0,
      monthlyLimit: newAPIKey.monthlyLimit || 10000,
      status: 'inactive',
      description: newAPIKey.description || ''
    };

    setApiKeys([...apiKeys, apiKey]);
    setIsAddingNew(false);
    setNewAPIKey({
      name: '',
      category: 'ai-llm',
      provider: '',
      apiKey: '',
      endpoint: '',
      enabled: true,
      monthlyLimit: 10000,
      description: ''
    });
    toast.success('API key added successfully');
  };

  const handleQuickAdd = (category: string, provider: any) => {
    setNewAPIKey({
      ...newAPIKey,
      name: provider.name,
      category: category as any,
      provider: provider.name,
      endpoint: provider.endpoint
    });
    setIsAddingNew(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('add-api-form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredKeys = selectedCategory === 'all' 
    ? apiKeys 
    : apiKeys.filter(key => key.category === selectedCategory);

  const getUsagePercentage = (key: APIKey) => {
    return Math.round((key.requestsToday / (key.monthlyLimit / 30)) * 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300';
      case 'inactive': return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
      case 'error': return 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300';
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

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
          title="API Integrations"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Key className="w-6 h-6 text-[#EFB81A]" />
                    <h1 className="text-2xl text-gray-900 dark:text-gray-100">API Integration Management</h1>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Manage all your API keys for news sources, AI models, image generators, and third-party services
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingNew(!isAddingNew)}
                  className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add API Key
                </button>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#EFB81A] text-gray-900'
                      : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                  }`}
                >
                  All ({apiKeys.length})
                </button>
                {Object.entries(API_CATEGORIES).map(([key, cat]) => {
                  const Icon = cat.icon;
                  const count = apiKeys.filter(k => k.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-2 ${
                        selectedCategory === key
                          ? 'bg-[#EFB81A] text-gray-900'
                          : 'bg-white dark:bg-[#1A1A1C] text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add New API Key Form */}
            {isAddingNew && (
              <div id="add-api-form" className="mb-6 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Add New API Key</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      value={newAPIKey.name}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, name: e.target.value })}
                      placeholder="e.g., OpenAI GPT-4"
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={newAPIKey.category}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, category: e.target.value as any })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    >
                      {Object.entries(API_CATEGORIES).map(([key, cat]) => (
                        <option key={key} value={key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Provider *
                    </label>
                    <input
                      type="text"
                      value={newAPIKey.provider}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, provider: e.target.value })}
                      placeholder="e.g., OpenAI"
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      API Endpoint
                    </label>
                    <input
                      type="url"
                      value={newAPIKey.endpoint}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, endpoint: e.target.value })}
                      placeholder="https://api.example.com/v1/"
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={newAPIKey.apiKey}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, apiKey: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Monthly Limit (requests)
                    </label>
                    <input
                      type="number"
                      value={newAPIKey.monthlyLimit}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, monthlyLimit: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={newAPIKey.enabled}
                        onCheckedChange={(checked) => setNewAPIKey({ ...newAPIKey, enabled: checked })}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enable immediately</span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newAPIKey.description}
                      onChange={(e) => setNewAPIKey({ ...newAPIKey, description: e.target.value })}
                      placeholder="What is this API key used for?"
                      rows={2}
                      className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAPIKey}
                    className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Add API Key
                  </button>
                </div>
              </div>
            )}

            {/* Quick Add Popular APIs */}
            {isAddingNew && newAPIKey.category && POPULAR_PROVIDERS[newAPIKey.category as keyof typeof POPULAR_PROVIDERS] && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-3">Popular {API_CATEGORIES[newAPIKey.category as keyof typeof API_CATEGORIES].label}:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {POPULAR_PROVIDERS[newAPIKey.category as keyof typeof POPULAR_PROVIDERS].map((provider) => (
                    <button
                      key={provider.name}
                      onClick={() => handleQuickAdd(newAPIKey.category!, provider)}
                      className="p-3 bg-white dark:bg-[#1A1A1C] border border-gray-200 dark:border-gray-800 rounded-lg hover:border-[#EFB81A] transition-colors text-left"
                    >
                      <div className="text-sm text-gray-900 dark:text-gray-100 mb-1">{provider.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{provider.endpoint}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* API Keys List */}
            <div className="space-y-4">
              {filteredKeys.map(key => {
                const CategoryIcon = API_CATEGORIES[key.category].icon;
                const usagePercent = getUsagePercentage(key);
                
                return (
                  <div
                    key={key.id}
                    className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${
                          key.category === 'news' ? 'bg-blue-100 dark:bg-blue-900/20' :
                          key.category === 'ai-llm' ? 'bg-purple-100 dark:bg-purple-900/20' :
                          key.category === 'image' ? 'bg-pink-100 dark:bg-pink-900/20' :
                          key.category === 'email' ? 'bg-green-100 dark:bg-green-900/20' :
                          key.category === 'analytics' ? 'bg-orange-100 dark:bg-orange-900/20' :
                          key.category === 'storage' ? 'bg-cyan-100 dark:bg-cyan-900/20' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <CategoryIcon className={`w-5 h-5 ${API_CATEGORIES[key.category].color}`} />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg text-gray-900 dark:text-gray-100">{key.name}</h3>
                            <Badge className={getStatusColor(key.status)}>
                              {key.status}
                            </Badge>
                            {key.enabled ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{key.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <span>Provider: <span className="text-gray-900 dark:text-gray-100">{key.provider}</span></span>
                            {key.endpoint && (
                              <>
                                <span>•</span>
                                <span className="truncate">{key.endpoint}</span>
                              </>
                            )}
                            {key.lastUsed && (
                              <>
                                <span>•</span>
                                <span>Last used: {new Date(key.lastUsed).toLocaleString()}</span>
                              </>
                            )}
                          </div>

                          {/* API Key */}
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 bg-gray-50 dark:bg-[#0F0F10] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-gray-100 font-mono">
                              {showApiKey[key.id] ? key.apiKey : '•'.repeat(32)}
                            </div>
                            <button
                              onClick={() => setShowApiKey({ ...showApiKey, [key.id]: !showApiKey[key.id] })}
                              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              {showApiKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleCopyKey(key.apiKey)}
                              className="p-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Usage Stats */}
                          {key.enabled && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">
                                  Usage Today: {key.requestsToday.toLocaleString()} / {Math.round(key.monthlyLimit / 30).toLocaleString()} requests
                                </span>
                                <span className={`${
                                  usagePercent >= 90 ? 'text-red-600 dark:text-red-400' :
                                  usagePercent >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-green-600 dark:text-green-400'
                                }`}>
                                  {usagePercent}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    usagePercent >= 90 ? 'bg-red-500' :
                                    usagePercent >= 70 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Switch
                          checked={key.enabled}
                          onCheckedChange={() => handleToggleKey(key.id)}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => handleTestConnection(key)}
                        disabled={!key.enabled}
                        className="px-3 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Test Connection
                      </button>
                      
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="px-3 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredKeys.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 dark:text-gray-100 mb-2">No API Keys Found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {selectedCategory === 'all' 
                      ? 'Add your first API key to get started with integrations' 
                      : `No API keys in the ${API_CATEGORIES[selectedCategory as keyof typeof API_CATEGORIES]?.label} category`}
                  </p>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add API Key
                  </button>
                </div>
              )}
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm text-gray-900 dark:text-gray-100 mb-1">Security Best Practices</h4>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    <li>• API keys are encrypted and stored securely</li>
                    <li>• Rotate your API keys regularly (every 90 days recommended)</li>
                    <li>• Set appropriate rate limits to prevent abuse</li>
                    <li>• Monitor usage patterns for unusual activity</li>
                    <li>• Never share API keys publicly or commit them to version control</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}