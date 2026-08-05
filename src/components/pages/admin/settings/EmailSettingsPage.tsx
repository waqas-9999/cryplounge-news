'use client';

/**
 * Admin → Settings → Email.
 *
 * Read-only by design. SMTP credentials live in the server environment, so
 * they are neither editable nor readable here — the page reports the active
 * configuration and lets an admin send themselves a test message.
 *
 * This replaces an earlier version that presented editable inputs and a Save
 * button which silently saved nothing.
 */

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AlertCircle, CheckCircle2, Mail, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient, errorMessage } from '@/lib/api-client';
import { Card, ErrorBlock, LoadingBlock, useAnalyticsQuery } from '@/components/admin/analytics/primitives';

interface EmailSettingsPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface MailStatus {
  enabled: boolean;
  host: string | null;
  port: number;
  secure: boolean;
  user: string | null;
  from: string | null;
  fromName: string;
  contactRecipients: string[];
}

interface TestResult {
  ok: boolean;
  sentTo?: string;
  stage?: string;
  error?: string;
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900 dark:text-gray-100 break-words">{value}</dd>
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
    </div>
  );
}

export function EmailSettingsPage({ currentPage, onNavigate, onLogout }: EmailSettingsPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [testing, setTesting] = useState(false);

  const status = useAnalyticsQuery<MailStatus>(
    signal => apiClient.get<MailStatus>('admin/mail/status', { signal }),
    []
  );

  const sendTest = async () => {
    setTesting(true);
    try {
      const result = await apiClient.post<TestResult>('admin/mail/test');
      if (result.ok) toast.success(`Test email sent to ${result.sentTo}`);
      else toast.error(result.error ?? 'The test failed.');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not send the test email.'));
    } finally {
      setTesting(false);
    }
  };

  const data = status.data;

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
        <AdminHeader title="Email Settings" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl">
            <div className="mb-6">
              <h1 className="text-xl md:text-2xl text-gray-900 dark:text-gray-100">Email</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Transactional mail configuration and delivery test.
              </p>
            </div>

            {status.loading ? (
              <Card>
                <LoadingBlock height="h-56" />
              </Card>
            ) : status.error || !data ? (
              <Card>
                <ErrorBlock message={status.error ?? 'Could not load mail settings.'} onRetry={status.reload} />
              </Card>
            ) : (
              <div className="space-y-4">
                {/* ------------------------------------------------- state -- */}
                <Card className="p-5">
                  <div className="flex items-start gap-3">
                    {data.enabled ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {data.enabled ? 'Email is configured' : 'Email is not configured'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {data.enabled
                          ? 'Contact form submissions are emailed to your team, and senders receive an acknowledgement.'
                          : 'Contact messages are still stored and readable under Contact Messages — they are just not emailed. Set SMTP_HOST in the server environment to enable delivery.'}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* ------------------------------------------------ config -- */}
                {data.enabled && (
                  <Card className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <h2 className="text-sm text-gray-900 dark:text-gray-100">Active configuration</h2>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="SMTP Host" value={data.host ?? '—'} />
                      <Field
                        label="Port"
                        value={String(data.port)}
                        hint={data.secure ? 'TLS on connect' : 'STARTTLS'}
                      />
                      <Field label="Username" value={data.user ?? '—'} hint="Partially masked" />
                      <Field label="From" value={`${data.fromName} <${data.from ?? '—'}>`} />
                      <div className="sm:col-span-2">
                        <Field
                          label="Contact notifications sent to"
                          value={
                            data.contactRecipients.length
                              ? data.contactRecipients.join(', ')
                              : 'No recipients set'
                          }
                          hint={
                            data.contactRecipients.length
                              ? undefined
                              : 'Set CONTACT_NOTIFY_EMAILS or no one will be notified of submissions.'
                          }
                        />
                      </div>
                    </dl>

                    {data.contactRecipients.length === 0 && (
                      <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-900/40">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 dark:text-amber-300">
                          Mail works, but no one receives contact form notifications.
                        </p>
                      </div>
                    )}
                  </Card>
                )}

                {/* -------------------------------------------------- test -- */}
                <Card className="p-5">
                  <h2 className="text-sm text-gray-900 dark:text-gray-100 mb-1">Send a test email</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Verifies the SMTP connection, then sends a message to your own account address. It cannot be
                    sent to anyone else.
                  </p>
                  <button
                    onClick={sendTest}
                    disabled={testing || !data.enabled}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-yellow-400 text-gray-900 hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {testing ? 'Sending…' : 'Send test email'}
                  </button>
                </Card>

                <p className="text-xs text-gray-400 dark:text-gray-500 px-1">
                  Credentials are held in the server environment and are never editable or readable from the
                  admin panel. To change them, update the environment variables and redeploy.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
