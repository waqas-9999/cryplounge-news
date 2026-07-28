'use client';

import { useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Clock, Play, Pause, Settings, Save, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

interface NewsAutoFetchPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface FetchSchedule {
  id: string;
  name: string;
  enabled: boolean;
  interval: number; // in minutes
  sources: string[];
  lastRun?: string;
  nextRun?: string;
  articlesFound: number;
}

export function NewsAutoFetchPage({ currentPage, onNavigate, onLogout }: NewsAutoFetchPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [schedules, setSchedules] = useState<FetchSchedule[]>([
    {
      id: '1',
      name: 'High Priority Sources',
      enabled: true,
      interval: 15,
      sources: ['Reuters Finance API', 'Bloomberg RSS'],
      lastRun: '2025-11-13T10:30:00',
      nextRun: '2025-11-13T10:45:00',
      articlesFound: 247
    },
    {
      id: '2',
      name: 'Standard Sources',
      enabled: true,
      interval: 60,
      sources: ['TechCrunch RSS', 'Financial Times API'],
      lastRun: '2025-11-13T09:00:00',
      nextRun: '2025-11-13T10:00:00',
      articlesFound: 156
    },
    {
      id: '3',
      name: 'Low Priority Sources',
      enabled: false,
      interval: 240,
      sources: ['Industry News RSS', 'Global Market Wire'],
      articlesFound: 89
    }
  ]);

  // Fetch Settings
  const [batchSize, setBatchSize] = useState('50');
  const [maxArticlesPerSource, setMaxArticlesPerSource] = useState('20');
  const [fetchOnlyNew, setFetchOnlyNew] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  
  // Processing Settings
  const [processImmediately, setProcessImmediately] = useState(true);
  const [queueForModeration, setQueueForModeration] = useState(true);
  const [notifyOnFetch, setNotifyOnFetch] = useState(false);

  const handleToggleSchedule = (id: string) => {
    setSchedules(schedules.map(schedule => 
      schedule.id === id ? { ...schedule, enabled: !schedule.enabled } : schedule
    ));
    const schedule = schedules.find(s => s.id === id);
    toast.success(`${schedule?.name} ${schedule?.enabled ? 'paused' : 'activated'}`);
  };

  const handleRunNow = (id: string) => {
    const schedule = schedules.find(s => s.id === id);
    toast.info(`Running ${schedule?.name}...`);
    
    setTimeout(() => {
      toast.success(`Fetched 12 new articles from ${schedule?.name}`);
      setSchedules(schedules.map(s => 
        s.id === id 
          ? { 
              ...s, 
              lastRun: new Date().toISOString(), 
              nextRun: new Date(Date.now() + s.interval * 60000).toISOString(),
              articlesFound: s.articlesFound + 12
            }
          : s
      ));
    }, 2000);
  };

  const handleSave = () => {
    toast.success('Auto-fetch settings saved successfully!');
  };

  const getNextRunTime = (schedule: FetchSchedule) => {
    if (!schedule.enabled) return 'Paused';
    if (!schedule.nextRun) return 'Not scheduled';
    
    const now = new Date();
    const next = new Date(schedule.nextRun);
    const diff = next.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 0) return 'Running...';
    if (minutes < 60) return `in ${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `in ${hours}h ${minutes % 60}m`;
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
          title="Auto-Fetch Configuration"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="w-6 h-6 text-[#EFB81A]" />
                    <h1 className="text-2xl text-gray-900 dark:text-gray-100">Automated News Fetching</h1>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure automated schedules for fetching news from external sources
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 dark:text-gray-300">Global Auto-Fetch</label>
                    <Switch 
                      checked={globalEnabled} 
                      onCheckedChange={(checked) => {
                        setGlobalEnabled(checked);
                        toast.success(`Auto-fetch ${checked ? 'enabled' : 'disabled'} globally`);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              {globalEnabled && (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600 dark:text-green-500" />
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Auto-fetch is active. News is being fetched automatically from configured sources.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Fetch Schedules */}
            <div className="mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Fetch Schedules</h2>
              
              <div className="space-y-4">
                {schedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-900 dark:text-gray-100">{schedule.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs ${
                            schedule.enabled
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                          }`}>
                            {schedule.enabled ? 'Active' : 'Paused'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Every {schedule.interval} minutes
                          </span>
                          <span>•</span>
                          <span>{schedule.sources.length} sources</span>
                          <span>•</span>
                          <span>{schedule.articlesFound} articles found</span>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {schedule.sources.map(source => (
                            <span
                              key={source}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              {source}
                            </span>
                          ))}
                        </div>

                        {schedule.enabled && (
                          <div className="flex items-center gap-4 text-sm">
                            {schedule.lastRun && (
                              <span className="text-gray-600 dark:text-gray-400">
                                Last run: <span className="text-gray-900 dark:text-gray-100">
                                  {new Date(schedule.lastRun).toLocaleString()}
                                </span>
                              </span>
                            )}
                            {schedule.nextRun && (
                              <>
                                <span>•</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  Next run: <span className="text-[#EFB81A]">
                                    {getNextRunTime(schedule)}
                                  </span>
                                </span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={() => handleToggleSchedule(schedule.id)}
                          disabled={!globalEnabled}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <button
                        onClick={() => handleRunNow(schedule.id)}
                        disabled={!schedule.enabled || !globalEnabled}
                        className="px-3 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Run Now
                      </button>
                      
                      <button
                        className="px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Settings className="w-4 h-4" />
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fetch Settings */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Fetch Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Number of articles to fetch per request
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Max Articles Per Source
                  </label>
                  <input
                    type="number"
                    value={maxArticlesPerSource}
                    onChange={(e) => setMaxArticlesPerSource(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Maximum articles to fetch from each source
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Fetch Only New Articles</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Skip articles already in database</p>
                  </div>
                  <Switch checked={fetchOnlyNew} onCheckedChange={setFetchOnlyNew} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Skip Duplicates</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Detect and skip duplicate content</p>
                  </div>
                  <Switch checked={skipDuplicates} onCheckedChange={setSkipDuplicates} />
                </div>
              </div>
            </div>

            {/* Processing Settings */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Processing Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Process Immediately</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Run AI processing on fetched articles</p>
                  </div>
                  <Switch checked={processImmediately} onCheckedChange={setProcessImmediately} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Queue for Moderation</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Add to moderation queue after processing</p>
                  </div>
                  <Switch checked={queueForModeration} onCheckedChange={setQueueForModeration} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Notify on Fetch</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Send notification when new articles are fetched</p>
                  </div>
                  <Switch checked={notifyOnFetch} onCheckedChange={setNotifyOnFetch} />
                </div>
              </div>
            </div>

            {/* Workflow Summary */}
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
              <h3 className="text-gray-900 dark:text-gray-100 mb-3">Automated Workflow</h3>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EFB81A] text-gray-900 flex items-center justify-center text-xs">1</span>
                  <span>Fetch articles from external sources based on schedule</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EFB81A] text-gray-900 flex items-center justify-center text-xs">2</span>
                  <span>AI processes content (summarization, categorization, tagging, SEO)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EFB81A] text-gray-900 flex items-center justify-center text-xs">3</span>
                  <span>Quality score is calculated and duplicate detection runs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EFB81A] text-gray-900 flex items-center justify-center text-xs">4</span>
                  <span>High-quality articles (85%+) are auto-published or queued for moderation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EFB81A] text-gray-900 flex items-center justify-center text-xs">5</span>
                  <span>Lower quality articles require manual review in moderation queue</span>
                </li>
              </ol>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Auto-Fetch Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}