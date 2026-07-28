import { useState } from 'react';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { Sparkles, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '../../components/ui/switch';
import { Slider } from '../../components/ui/slider';

interface NewsAISettingsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function NewsAISettingsPage({ currentPage, onNavigate, onLogout }: NewsAISettingsPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // AI Processing Settings
  const [enableAI, setEnableAI] = useState(true);
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [apiKey, setApiKey] = useState('');
  
  // Content Processing
  const [autoSummarize, setAutoSummarize] = useState(true);
  const [summaryLength, setSummaryLength] = useState([150]);
  const [autoCategorize, setAutoCategorize] = useState(true);
  const [autoTag, setAutoTag] = useState(true);
  const [maxTags, setMaxTags] = useState([5]);
  
  // SEO Optimization
  const [autoSEO, setAutoSEO] = useState(true);
  const [generateMetaDesc, setGenerateMetaDesc] = useState(true);
  const [generateSEOTitle, setGenerateSEOTitle] = useState(true);
  const [optimizeKeywords, setOptimizeKeywords] = useState(true);
  
  // Quality Control
  const [qualityThreshold, setQualityThreshold] = useState([70]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(true);
  const [duplicateDetection, setDuplicateDetection] = useState(true);
  const [factChecking, setFactChecking] = useState(false);
  
  // Auto Publishing
  const [autoPublishHighQuality, setAutoPublishHighQuality] = useState(false);
  const [autoPublishThreshold, setAutoPublishThreshold] = useState([85]);
  const [requireHumanReview, setRequireHumanReview] = useState(true);
  
  // Image Processing
  const [autoSelectImages, setAutoSelectImages] = useState(true);
  const [imageOptimization, setImageOptimization] = useState(true);
  const [altTextGeneration, setAltTextGeneration] = useState(true);

  const handleSave = () => {
    toast.success('AI settings saved successfully!');
  };

  const handleTestAI = async () => {
    if (!apiKey) {
      toast.error('Please enter an API key first');
      return;
    }
    
    toast.info('Testing AI connection...');
    
    // Simulate API test
    setTimeout(() => {
      toast.success('AI connection successful! All systems operational.');
    }, 2000);
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
          title="AI Settings"
          onMenuClick={() => setIsMobileSidebarOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-6 h-6 text-[#EFB81A]" />
                <h1 className="text-2xl text-gray-900 dark:text-gray-100">AI Content Processing</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Configure AI-powered content processing, optimization, and quality control
              </p>
            </div>

            {/* AI Provider Configuration */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">AI Provider</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Enable AI Processing</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Use AI for automated content processing</p>
                  </div>
                  <Switch checked={enableAI} onCheckedChange={setEnableAI} />
                </div>

                {enableAI && (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        AI Provider
                      </label>
                      <select
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value as any)}
                        className="w-full px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                      >
                        <option value="openai">OpenAI (GPT-4)</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="gemini">Google (Gemini)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-..."
                          className="flex-1 px-4 py-2 bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                        />
                        <button
                          onClick={handleTestAI}
                          className="px-4 py-2 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors"
                        >
                          Test Connection
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Your API key is encrypted and stored securely
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content Processing */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Content Processing</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300">Auto-Summarization</label>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Generate article summaries automatically</p>
                    </div>
                    <Switch checked={autoSummarize} onCheckedChange={setAutoSummarize} />
                  </div>
                  {autoSummarize && (
                    <div className="mt-3 ml-4">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Summary Length: {summaryLength[0]} characters
                      </label>
                      <Slider
                        value={summaryLength}
                        onValueChange={setSummaryLength}
                        min={50}
                        max={300}
                        step={10}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Auto-Categorization</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Automatically assign categories</p>
                  </div>
                  <Switch checked={autoCategorize} onCheckedChange={setAutoCategorize} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300">Auto-Tagging</label>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Generate relevant tags automatically</p>
                    </div>
                    <Switch checked={autoTag} onCheckedChange={setAutoTag} />
                  </div>
                  {autoTag && (
                    <div className="mt-3 ml-4">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Maximum Tags: {maxTags[0]}
                      </label>
                      <Slider
                        value={maxTags}
                        onValueChange={setMaxTags}
                        min={3}
                        max={10}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SEO Optimization */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">SEO Optimization</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Enable Auto-SEO</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Automatic SEO optimization for all content</p>
                  </div>
                  <Switch checked={autoSEO} onCheckedChange={setAutoSEO} />
                </div>

                {autoSEO && (
                  <div className="ml-4 space-y-3 border-l-2 border-gray-200 dark:border-gray-800 pl-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Generate Meta Descriptions</label>
                      <Switch checked={generateMetaDesc} onCheckedChange={setGenerateMetaDesc} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Generate SEO Titles</label>
                      <Switch checked={generateSEOTitle} onCheckedChange={setGenerateSEOTitle} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-gray-700 dark:text-gray-300">Optimize Keywords</label>
                      <Switch checked={optimizeKeywords} onCheckedChange={setOptimizeKeywords} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Control */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Quality Control</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Quality Score: {qualityThreshold[0]}%
                  </label>
                  <Slider
                    value={qualityThreshold}
                    onValueChange={setQualityThreshold}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Articles below this score will require manual review
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Sentiment Analysis</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Analyze article sentiment</p>
                  </div>
                  <Switch checked={sentimentAnalysis} onCheckedChange={setSentimentAnalysis} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Duplicate Detection</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Prevent duplicate content</p>
                  </div>
                  <Switch checked={duplicateDetection} onCheckedChange={setDuplicateDetection} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Fact Checking (Experimental)</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Verify claims with external sources</p>
                  </div>
                  <Switch checked={factChecking} onCheckedChange={setFactChecking} />
                </div>
              </div>
            </div>

            {/* Auto Publishing */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Auto-Publishing</h2>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      Auto-publishing will publish articles without human review. Use with caution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="text-sm text-gray-700 dark:text-gray-300">Enable Auto-Publishing</label>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Automatically publish high-quality articles</p>
                    </div>
                    <Switch checked={autoPublishHighQuality} onCheckedChange={setAutoPublishHighQuality} />
                  </div>
                  
                  {autoPublishHighQuality && (
                    <div className="mt-3 ml-4">
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Auto-Publish Threshold: {autoPublishThreshold[0]}%
                      </label>
                      <Slider
                        value={autoPublishThreshold}
                        onValueChange={setAutoPublishThreshold}
                        min={70}
                        max={95}
                        step={5}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Only articles with quality score above this will auto-publish
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Require Human Review for Critical Content</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Always review sensitive topics manually</p>
                  </div>
                  <Switch checked={requireHumanReview} onCheckedChange={setRequireHumanReview} />
                </div>
              </div>
            </div>

            {/* Image Processing */}
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
              <h2 className="text-lg text-gray-900 dark:text-gray-100 mb-4">Image Processing</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Auto-Select Images</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Automatically select relevant images</p>
                  </div>
                  <Switch checked={autoSelectImages} onCheckedChange={setAutoSelectImages} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Image Optimization</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Compress and optimize images</p>
                  </div>
                  <Switch checked={imageOptimization} onCheckedChange={setImageOptimization} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300">Alt Text Generation</label>
                    <p className="text-xs text-gray-500 dark:text-gray-500">Generate accessibility alt text</p>
                  </div>
                  <Switch checked={altTextGeneration} onCheckedChange={setAltTextGeneration} />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-6 py-3 bg-[#EFB81A] text-gray-900 rounded-lg hover:bg-[#d9a617] transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save AI Settings
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}