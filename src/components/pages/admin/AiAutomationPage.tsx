'use client';

/**
 * Admin → AI Automation.
 *
 * The controls that decide whether AI-assisted reporting reaches the site.
 * Two properties matter more than the layout:
 *
 *  1. **Only a super admin can change anything.** The server enforces this via
 *     `ai.automation.manage`; the screen mirrors it so an admin sees the state
 *     read-only rather than clicking a control that will 403.
 *  2. **Nothing here is aspirational.** Options the backend would refuse are
 *     shown as unavailable with the reason, never as toggles that silently do
 *     nothing.
 */

import { useCallback, useState } from 'react';
import { AlertTriangle, Bot, Check, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { apiClient, errorMessage } from '@/lib/api-client';
import {
  Card,
  ErrorBlock,
  LoadingBlock,
  useAnalyticsQuery,
} from '@/components/admin/analytics/primitives';

interface AiAutomationPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type PublishMode = 'DRAFT_ONLY' | 'REVIEW_REQUIRED' | 'AUTO_PUBLISH';

interface AutomationStatus {
  enabled: boolean;
  publishMode: PublishMode;
  availablePublishModes: PublishMode[];
  categories: Array<{ id: string; slug: string; name: string; enabled: boolean }>;
  lastRunAt: string | null;
  lastPublishedAt: string | null;
  lastPublishedTitle: string | null;
  lastError: string | null;
  effective: { canPublish: boolean; reason: string };
}

const PUBLISH_MODES: Array<{ value: PublishMode; label: string; description: string }> = [
  {
    value: 'DRAFT_ONLY',
    label: 'Draft only',
    description: 'Stories are written into the CMS as drafts. An editor decides everything after that.',
  },
  {
    value: 'REVIEW_REQUIRED',
    label: 'Review required',
    description: 'Stories are queued for review. They appear in the editorial workflow but cannot go live unattended.',
  },
  {
    value: 'AUTO_PUBLISH',
    label: 'Auto publish',
    description: 'High-confidence stories go live with no human in the loop.',
  },
];

function formatWhen(value: string | null): string {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AiAutomationPage({ currentPage, onNavigate, onLogout }: AiAutomationPageProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  const status = useAnalyticsQuery<AutomationStatus>(
    signal => apiClient.get<AutomationStatus>('admin/ai/automation', { signal }),
    []
  );

  /**
   * Whether this account may change anything.
   *
   * Inferred from the server's own response to a write: rather than trusting a
   * role string in the client, the screen starts editable and marks itself
   * read-only the first time the API answers 403. That way the UI can never
   * claim more authority than the server grants.
   */
  const [readOnly, setReadOnly] = useState(false);

  const mutate = useCallback(
    async (label: string, request: () => Promise<AutomationStatus>) => {
      setSaving(label);
      try {
        await request();
        await status.reload();
        toast.success('AI automation updated');
      } catch (error) {
        const message = errorMessage(error, 'Could not update AI automation.');
        if (/permission|forbidden/i.test(message)) {
          setReadOnly(true);
          toast.error('Only a super admin can change AI automation.');
        } else {
          toast.error(message);
        }
      } finally {
        setSaving(null);
      }
    },
    [status]
  );

  const data = status.data;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
      <AdminSidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        onLogout={onLogout}
        isMobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <AdminHeader title="AI Automation" onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl">
            <div className="mb-6 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-yellow-700 dark:text-yellow-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">AI Newsroom</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Controls whether AI-assisted reporting reaches the site.
                </p>
              </div>
            </div>

            {status.loading ? (
              <Card>
                <LoadingBlock height="h-64" />
              </Card>
            ) : status.error || !data ? (
              <Card>
                <ErrorBlock message={status.error ?? 'Could not load AI automation.'} onRetry={status.reload} />
              </Card>
            ) : (
              <div className="space-y-4">
                {readOnly && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      You have read-only access. Only a super admin can change these settings.
                    </p>
                  </div>
                )}

                {/* ------------------------------------------ global switch -- */}
                <Card className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-sm text-gray-900 dark:text-gray-100">Enable AI News</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        The master switch. While this is off nothing is written to the CMS, whatever
                        the per-category settings say.
                      </p>
                    </div>

                    <button
                      role="switch"
                      aria-checked={data.enabled}
                      aria-label="Enable AI News"
                      disabled={readOnly || saving === 'global'}
                      onClick={() =>
                        mutate('global', () =>
                          apiClient.put<AutomationStatus>('admin/ai/automation', {
                            enabled: !data.enabled,
                          })
                        )
                      }
                      className={`relative shrink-0 w-14 h-8 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        data.enabled ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                          data.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className={`mt-4 flex items-start gap-2 p-3 rounded-lg text-xs ${
                      data.enabled
                        ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-800 dark:text-emerald-300'
                        : 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {data.enabled ? (
                      <Check className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{data.effective.reason}</span>
                  </div>
                </Card>

                {/* ---------------------------------------------- categories -- */}
                <Card className="p-5">
                  <h2 className="text-sm text-gray-900 dark:text-gray-100 mb-1">Categories</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Which of your existing news categories automation may file into. The list is your
                    real CrypLounge categories — the newsroom never creates its own.
                  </p>

                  <div className="space-y-1">
                    {data.categories.map(category => (
                      <label
                        key={category.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          readOnly ? 'opacity-70' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={category.enabled}
                          disabled={readOnly || saving === category.slug}
                          onChange={() =>
                            mutate(category.slug, () =>
                              apiClient.put<AutomationStatus>('admin/ai/automation/category', {
                                slug: category.slug,
                                enabled: !category.enabled,
                              })
                            )
                          }
                          className="w-4 h-4 rounded accent-yellow-500 disabled:cursor-not-allowed"
                        />
                        <span className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">/{category.slug}</span>
                        {saving === category.slug && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />
                        )}
                      </label>
                    ))}
                  </div>
                </Card>

                {/* ------------------------------------------------ publishing -- */}
                <Card className="p-5">
                  <h2 className="text-sm text-gray-900 dark:text-gray-100 mb-1">Publishing</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    How far automation may take a story on its own.
                  </p>

                  <div className="space-y-2">
                    {PUBLISH_MODES.map(mode => {
                      const available = data.availablePublishModes.includes(mode.value);
                      const selected = data.publishMode === mode.value;

                      return (
                        <label
                          key={mode.value}
                          className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                            selected
                              ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/15'
                              : 'border-gray-200 dark:border-gray-800'
                          } ${
                            available && !readOnly
                              ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40'
                              : 'opacity-60'
                          }`}
                        >
                          <input
                            type="radio"
                            name="publishMode"
                            checked={selected}
                            disabled={!available || readOnly || saving === 'mode'}
                            onChange={() =>
                              mutate('mode', () =>
                                apiClient.put<AutomationStatus>('admin/ai/automation/publish-mode', {
                                  mode: mode.value,
                                })
                              )
                            }
                            className="mt-0.5 w-4 h-4 accent-yellow-500 disabled:cursor-not-allowed"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-gray-800 dark:text-gray-200">{mode.label}</span>
                              {!available && (
                                <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                  Not available yet
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                              {mode.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {!data.availablePublishModes.includes('AUTO_PUBLISH') && (
                    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-900/40">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        Auto publish is unavailable until article generation, fact checking and image
                        production are implemented and verified. The server rejects it, so it is shown
                        here rather than offered as a control that would do nothing.
                      </p>
                    </div>
                  )}
                </Card>

                {/* ---------------------------------------------------- status -- */}
                <Card className="p-5">
                  <h2 className="text-sm text-gray-900 dark:text-gray-100 mb-4">Status</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Last run</dt>
                      <dd className="text-gray-900 dark:text-gray-100">{formatWhen(data.lastRunAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Last published</dt>
                      <dd className="text-gray-900 dark:text-gray-100">
                        {data.lastPublishedTitle ?? 'Nothing published'}
                      </dd>
                    </div>
                  </dl>

                  {data.lastError && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-900/40">
                      <p className="text-xs text-red-700 dark:text-red-300">{data.lastError}</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
