'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Mail,
  Pencil,
  Eye,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  getNewsletterCampaign,
  previewNewsletterCampaign,
  testNewsletterCampaign,
  sendNewsletterCampaign,
  deleteNewsletterCampaign,
  type NewsletterCampaign,
} from '@/services/newsletter';
import { errorMessage } from '@/lib/api-client';
import { sanitizeHTML } from '@/utils/validation';

interface CampaignDetailPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  campaignId: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function CampaignDetailPage({
  currentPage,
  onNavigate,
  onLogout,
  campaignId,
}: CampaignDetailPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [campaign, setCampaign] = useState<NewsletterCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(() => {
    setError(null);
    getNewsletterCampaign(campaignId)
      .then(setCampaign)
      .catch(err => setError(errorMessage(err, 'Failed to load the campaign')))
      .finally(() => setLoading(false));
  }, [campaignId]);

  useEffect(() => {
    load();
  }, [load]);

  // While a send is in flight, poll for progress until it finishes.
  useEffect(() => {
    if (!campaign || campaign.status !== 'SENDING') return;
    pollTimer.current = setInterval(load, 3000);
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, [campaign?.status, load]);

  const handlePreview = async () => {
    setPreviewLoading(true);
    setError(null);
    try {
      const result = await previewNewsletterCampaign(campaignId);
      setPreviewHtml(result.html);
      setPreviewOpen(true);
    } catch (err) {
      setError(errorMessage(err, 'Failed to render the preview'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      setError('Enter a valid test email address.');
      return;
    }
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      await testNewsletterCampaign(campaignId, testEmail.trim());
      setTestResult(`Test email sent to ${testEmail.trim()}.`);
    } catch (err) {
      setError(errorMessage(err, 'Failed to send the test email'));
    } finally {
      setTesting(false);
    }
  };

  const confirmSend = async () => {
    setSending(true);
    setError(null);
    try {
      await sendNewsletterCampaign(campaignId);
      setSendConfirmOpen(false);
      load();
    } catch (err) {
      setError(errorMessage(err, 'Failed to start the send'));
      setSendConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const confirmDelete = async () => {
    if (!window.confirm(`Delete the campaign "${campaign?.subject}"?`)) return;
    setDeleting(true);
    try {
      await deleteNewsletterCampaign(campaignId);
      onNavigate('admin/newsletter/campaigns');
    } catch (err) {
      setError(errorMessage(err, 'Failed to delete the campaign'));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
        <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#EFB81A]" />
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-[#0F0F10]">
        <AdminSidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error ?? 'Campaign not found.'}</p>
            <button
              onClick={() => onNavigate('admin/newsletter/campaigns')}
              className="px-4 py-2 rounded-lg bg-[#EFB81A] text-gray-900 text-sm font-semibold"
            >
              Back to Campaigns
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isDraft = campaign.status === 'DRAFT';
  const isSending = campaign.status === 'SENDING';
  const canResend = campaign.status === 'FAILED';
  const progress = campaign.recipientCount > 0 ? Math.round((campaign.sentCount / campaign.recipientCount) * 100) : 0;
  const remaining = campaign.recipientCount - campaign.sentCount - campaign.failedCount;

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
        <AdminHeader title="Campaign" onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <button
            onClick={() => onNavigate('admin/newsletter/campaigns')}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </button>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl text-gray-900 dark:text-gray-100">{campaign.subject}</h1>
                <CampaignBadge status={campaign.status} />
              </div>
              <p className="text-gray-600 dark:text-gray-400">{campaign.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {isDraft && (
                <button
                  onClick={() => onNavigate(`admin/newsletter/campaigns/${campaign.id}/edit`)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Pencil className="w-4 h-4" /> Edit Draft
                </button>
              )}
              <button
                onClick={() => void handlePreview()}
                disabled={previewLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Preview
              </button>
              {(isDraft || canResend) && (
                <button
                  onClick={() => setSendConfirmOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EFB81A] text-gray-900 text-sm font-semibold hover:bg-[#f0c445]"
                >
                  <Send className="w-4 h-4" />
                  {canResend ? 'Send Again' : 'Send Newsletter'}
                </button>
              )}
              {campaign.status !== 'SENDING' && (
                <button
                  onClick={() => void confirmDelete()}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#1A1A1C] border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete
                </button>
              )}
            </div>
          </div>

          {error && <p className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">{error}</p>}

          {/* Send progress */}
          {isSending && (
            <div className="mb-6 bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#EFB81A]" /> Sending in progress…
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{progress}%</p>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#EFB81A] transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {campaign.sentCount.toLocaleString()} sent · {campaign.failedCount.toLocaleString()} failed ·{' '}
                {Math.max(0, remaining).toLocaleString()} remaining of {campaign.recipientCount.toLocaleString()}
              </p>
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Metric label="Recipients" value={campaign.recipientCount ? campaign.recipientCount.toLocaleString() : '—'} />
            <Metric
              label="Successfully Sent"
              value={campaign.sentCount ? campaign.sentCount.toLocaleString() : '—'}
              className={campaign.failedCount > 0 ? 'text-green-600 dark:text-green-400' : undefined}
            />
            <Metric
              label="Failed"
              value={campaign.failedCount ? campaign.failedCount.toLocaleString() : '—'}
              className={campaign.failedCount > 0 ? 'text-red-600 dark:text-red-400' : undefined}
            />
            <Metric label="Sent At" value={formatDate(campaign.sentAt)} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Metric label="Created By" value={campaign.createdBy?.name ?? campaign.createdBy?.email ?? '—'} />
            <Metric label="Created At" value={formatDate(campaign.createdAt)} />
            <Metric label="Recipient Type" value={campaign.recipientType === 'ALL_ACTIVE' ? 'All Active' : `${campaign.recipientEmails.length} selected`} />
            <Metric label="Last Updated" value={formatDate(campaign.updatedAt)} />
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6 mb-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Content</h2>
            {campaign.content ? (
              <div
                className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-600 dark:prose-p:text-gray-300"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(campaign.content) }}
              />
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No content.</p>
            )}
            {(campaign.ctaLabel && campaign.ctaUrl) && (
              <a
                href={campaign.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EFB81A] text-gray-900 text-sm font-semibold"
              >
                {campaign.ctaLabel}
              </a>
            )}
          </div>

          {/* Test email */}
          {isDraft && (
            <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Send a Test Email</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => { setTestEmail(e.target.value); setTestResult(null); }}
                    placeholder="admin@example.com"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                </div>
                <button
                  onClick={() => void handleSendTest()}
                  disabled={testing || !testEmail.trim()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Test Email
                </button>
              </div>
              {testResult && (
                <p className="mt-2 text-sm text-green-700 dark:text-green-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> {testResult}
                </p>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Preview modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewOpen(false)}>
          <div
            className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-sm font-medium text-gray-900 dark:text-gray-100">Email Preview</h2>
              <button onClick={() => setPreviewOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe title="Newsletter preview" srcDoc={previewHtml} className="flex-1 min-h-[60vh] bg-white" />
          </div>
        </div>
      )}

      {/* Send confirmation modal */}
      {sendConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSendConfirmOpen(false)}>
          <div
            className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {canResend ? 'Resend Newsletter?' : 'Send Newsletter?'}
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">Subject:</span>{' '}
                <span className="font-medium">{campaign.subject}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">Recipients:</span>{' '}
                <span className="font-medium">
                  {(
                    campaign.recipientType === 'ALL_ACTIVE'
                      ? campaign.recipientCount || 'all'
                      : campaign.recipientEmails.length
                  ).toLocaleString()}{' '}
                  active subscriber{(campaign.recipientCount || campaign.recipientEmails.length) === 1 ? '' : 's'}
                </span>
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                This will send the newsletter to all selected recipients. Only active subscribers receive it.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSendConfirmOpen(false)}
                disabled={sending}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => void confirmSend()}
                disabled={sending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EFB81A] text-gray-900 text-sm font-semibold hover:bg-[#f0c445] disabled:opacity-50"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Newsletter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className ?? ''}`}>{value}</p>
    </div>
  );
}

function CampaignBadge({ status }: { status: NewsletterCampaign['status'] }) {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    SENDING: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    SENT: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    FAILED: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === 'SENDING' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status === 'SENT' && <CheckCircle2 className="w-3 h-3" />}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
