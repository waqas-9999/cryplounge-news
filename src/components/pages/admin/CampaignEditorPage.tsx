'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Mail,
  Eye,
  Quote,
  Save,
  Send,
  X,
} from 'lucide-react';
import {
  createNewsletterCampaign,
  updateNewsletterCampaign,
  getNewsletterCampaign,
  getCampaignRecipients,
  previewNewsletterCampaign,
  testNewsletterCampaign,
  sendNewsletterCampaign,
  type CampaignRecipient,
  type NewsletterCampaign,
  type NewsletterCampaignPayload,
  type NewsletterRecipientType,
} from '@/services/newsletter';
import { errorMessage } from '@/lib/api-client';

interface CampaignEditorPageProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  campaignId?: string;
}

export function CampaignEditorPage({
  currentPage,
  onNavigate,
  onLogout,
  campaignId,
}: CampaignEditorPageProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientType, setRecipientType] = useState<NewsletterRecipientType>('ALL_ACTIVE');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaUrl, setCtaUrl] = useState('');

  const [loading, setLoading] = useState(Boolean(campaignId));
  const [savedId, setSavedId] = useState<string | null>(campaignId ?? null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [recipients, setRecipients] = useState<CampaignRecipient[]>([]);
  const [recipientsLoaded, setRecipientsLoaded] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  /* ------------------------------------------------------------- initial load --- */

  useEffect(() => {
    getCampaignRecipients()
      .then(result => setRecipients(result.recipients))
      .catch(() => setRecipients([]))
      .finally(() => setRecipientsLoaded(true));
  }, []);

  useEffect(() => {
    if (!campaignId) return;
    getNewsletterCampaign(campaignId)
      .then(campaign => {
        if (campaign.status !== 'DRAFT') {
          onNavigate(`admin/newsletter/campaigns/${campaign.id}`);
          return;
        }
        setSubject(campaign.subject);
        setTitle(campaign.title);
        setContent(campaign.content);
        setRecipientType(campaign.recipientType);
        setSelectedEmails(new Set(campaign.recipientEmails));
        setCtaLabel(campaign.ctaLabel ?? '');
        setCtaUrl(campaign.ctaUrl ?? '');
        setSavedId(campaign.id);
        setError(null);
      })
      .catch(err => setError(errorMessage(err, 'Failed to load the campaign draft')))
      .finally(() => setLoading(false));
  }, [campaignId, onNavigate]);

  // Push loaded content into the contentEditable editor imperatively so React
  // never resets the cursor while the user types.
  useEffect(() => {
    if (!loading && editorRef.current && content && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content;
    }
  }, [loading, content]);

  const syncContent = useCallback(() => {
    setContent(editorRef.current?.innerHTML ?? '');
  }, []);

  /* -------------------------------------------------------------- editor tools --- */

  const exec = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
  };

  const formatBlock = (tag: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    syncContent();
  };

  const insertLink = () => {
    const url = window.prompt('Link URL (https://...):');
    if (url) {
      exec('createLink', url.trim());
    }
  };

  /* --------------------------------------------------------------- recipients --- */

  const filteredRecipients = recipients.filter(recipient =>
    recipient.email.toLowerCase().includes(recipientSearch.trim().toLowerCase())
  );

  const toggleRecipient = (email: string) => {
    setSelectedEmails(prev => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const toggleSelectAll = () => {
    const allSelected = filteredRecipients.length > 0 && filteredRecipients.every(r => selectedEmails.has(r.email));
    setSelectedEmails(prev => {
      const next = new Set(prev);
      for (const recipient of filteredRecipients) {
        if (allSelected) next.delete(recipient.email);
        else next.add(recipient.email);
      }
      return next;
    });
  };

  const recipientCount =
    recipientType === 'ALL_ACTIVE' ? recipients.length : selectedEmails.size;

  /* ------------------------------------------------------------------ actions --- */

  const buildPayload = (): NewsletterCampaignPayload => ({
    subject: subject.trim(),
    title: title.trim(),
    content,
    recipientType,
    ...(recipientType === 'SELECTED' ? { recipientEmails: [...selectedEmails] } : {}),
    ctaLabel: ctaLabel.trim() || null,
    ctaUrl: ctaUrl.trim() || null,
  });

  const validate = (): string | null => {
    if (subject.trim().length < 3) return 'Subject must be at least 3 characters.';
    if (!title.trim()) return 'Newsletter title must not be empty.';
    const textLength = (editorRef.current?.innerText ?? content).trim().length;
    if (!textLength) return 'Write some content before saving.';
    if (recipientType === 'SELECTED' && selectedEmails.size === 0) {
      return 'Select at least one recipient when using "Selected subscribers".';
    }
    return null;
  };

  const saveDraft = useCallback(async (): Promise<string | null> => {
    const problem = validate();
    if (problem) {
      setError(problem);
      return null;
    }
    setError(null);
    setSaving(true);
    try {
      let campaign: NewsletterCampaign;
      if (savedId) {
        campaign = await updateNewsletterCampaign(savedId, buildPayload());
      } else {
        campaign = await createNewsletterCampaign(buildPayload());
      }
      setSavedId(campaign.id);
      setNotice('Draft saved.');
      setTimeout(() => setNotice(null), 2500);
      return campaign.id;
    } catch (err) {
      setError(errorMessage(err, 'Failed to save the draft'));
      return null;
    } finally {
      setSaving(false);
    }
  }, [savedId, subject, title, content, recipientType, selectedEmails, ctaLabel, ctaUrl]);

  const ensureSaved = useCallback(
    async (): Promise<string | null> => {
      if (savedId) return savedId;
      return saveDraft();
    },
    [savedId, saveDraft]
  );

  const handlePreview = async () => {
    const id = await ensureSaved();
    if (!id) return;
    setPreviewLoading(true);
    setError(null);
    try {
      const result = await previewNewsletterCampaign(id);
      setPreviewHtml(result.html);
      setPreviewOpen(true);
    } catch (err) {
      setError(errorMessage(err, 'Failed to render the preview'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSendTest = async () => {
    const id = await ensureSaved();
    if (!id) return;
    if (!testEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmail.trim())) {
      setError('Enter a valid test email address.');
      return;
    }
    setTesting(true);
    setError(null);
    setTestResult(null);
    try {
      await testNewsletterCampaign(id, testEmail.trim());
      setTestResult(`Test email sent to ${testEmail.trim()}.`);
    } catch (err) {
      setError(errorMessage(err, 'Failed to send the test email'));
    } finally {
      setTesting(false);
    }
  };

  const openSendConfirm = async () => {
    const id = await ensureSaved();
    if (!id) return;
    setSendConfirmOpen(true);
  };

  const confirmSend = async () => {
    if (!savedId) return;
    setSending(true);
    setError(null);
    try {
      await sendNewsletterCampaign(savedId);
      setSendConfirmOpen(false);
      onNavigate(`admin/newsletter/campaigns/${savedId}`);
    } catch (err) {
      setError(errorMessage(err, 'Failed to start the send'));
      setSendConfirmOpen(false);
    } finally {
      setSending(false);
    }
  };

  const saveButton = (
    <button
      onClick={() => void saveDraft()}
      disabled={saving || loading}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
    >
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      Save Draft
    </button>
  );

  /* ------------------------------------------------------------------- render --- */

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
        <AdminHeader title={campaignId ? 'Edit Newsletter' : 'Create Newsletter'} onMenuClick={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <button
            onClick={() => onNavigate('admin/newsletter/campaigns')}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </button>

          <div className="mb-4 md:mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl text-gray-900 dark:text-gray-100">
              {campaignId ? 'Edit Newsletter' : 'Create Newsletter'}
            </h1>
            <div className="flex items-center gap-2">
              {saveButton}
              <button
                onClick={() => void handlePreview()}
                disabled={previewLoading || loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-[#1A1A1C] border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-100 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Preview
              </button>
              <button
                onClick={() => void openSendConfirm()}
                disabled={saving || loading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EFB81A] text-gray-900 text-sm font-semibold hover:bg-[#f0c445] disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send Newsletter
              </button>
            </div>
          </div>

          {(error || notice) && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                error
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                  : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
              }`}
            >
              {error ?? notice}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#EFB81A]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Subject & title */}
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Top Crypto & Technology News This Week"
                      maxLength={200}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Appears in the inbox. 200 characters max.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      Newsletter Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="This Week at Cryplounge"
                      maxLength={200}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                    />
                  </div>
                </div>
              </div>

              {/* Content editor */}
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-1">
                  <EditorButton title="Bold" onClick={() => exec('bold')}><Bold className="w-4 h-4" /></EditorButton>
                  <EditorButton title="Italic" onClick={() => exec('italic')}><Italic className="w-4 h-4" /></EditorButton>
                  <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                  <EditorButton title="Heading 2" onClick={() => formatBlock('h2')}><Heading2 className="w-4 h-4" /></EditorButton>
                  <EditorButton title="Heading 3" onClick={() => formatBlock('h3')}><Heading3 className="w-4 h-4" /></EditorButton>
                  <span className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                  <EditorButton title="Bullet list" onClick={() => exec('insertUnorderedList')}><List className="w-4 h-4" /></EditorButton>
                  <EditorButton title="Numbered list" onClick={() => exec('insertOrderedList')}><ListOrdered className="w-4 h-4" /></EditorButton>
                  <EditorButton title="Quote" onClick={() => formatBlock('blockquote')}><Quote className="w-4 h-4" /></EditorButton>
                  <EditorButton title="Insert link" onClick={insertLink}><Link2 className="w-4 h-4" /></EditorButton>
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={syncContent}
                  onBlur={syncContent}
                  data-placeholder="Write your newsletter content here… You can format with the toolbar above."
                  className="min-h-[320px] px-4 py-3 text-gray-900 dark:text-gray-100 text-sm leading-relaxed focus:outline-none [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_a]:text-amber-600 dark:[&_a]:text-amber-400 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 dark:[&_blockquote]:border-gray-700 [&_blockquote]:pl-3 [&_blockquote]:text-gray-600 dark:[&_blockquote]:text-gray-400 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&:empty:before]:content-[attr(data-placeholder)] [&:empty:before]:text-gray-400"
                />
              </div>

              {/* Recipients */}
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recipients</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <RecipientCard
                    active={recipientType === 'ALL_ACTIVE'}
                    onClick={() => setRecipientType('ALL_ACTIVE')}
                    title="All Active Subscribers"
                    description={recipientsLoaded ? `${recipients.length.toLocaleString()} subscribers will receive this newsletter` : 'Loading subscriber count…'}
                  />
                  <RecipientCard
                    active={recipientType === 'SELECTED'}
                    onClick={() => setRecipientType('SELECTED')}
                    title="Selected Subscribers"
                    description={recipientType === 'SELECTED' ? `${selectedEmails.size} selected` : 'Choose specific subscribers below'}
                  />
                </div>

                {recipientType === 'SELECTED' && (
                  <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Selected Recipients: <span className="font-semibold">{selectedEmails.size}</span>
                      </p>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={recipientSearch}
                          onChange={e => setRecipientSearch(e.target.value)}
                          placeholder="Search by email…"
                          className="flex-1 sm:w-64 px-3 py-1.5 bg-gray-50 dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                        />
                        <button
                          onClick={toggleSelectAll}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          {filteredRecipients.length > 0 && filteredRecipients.every(r => selectedEmails.has(r.email))
                            ? 'Deselect all'
                            : 'Select all'}
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredRecipients.length === 0 && (
                        <p className="p-4 text-sm text-gray-400 dark:text-gray-500">
                          {recipientsLoaded ? 'No active subscribers found.' : 'Loading subscribers…'}
                        </p>
                      )}
                      {filteredRecipients.map(recipient => (
                        <label key={recipient.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedEmails.has(recipient.email)}
                            onChange={() => toggleRecipient(recipient.email)}
                            className="w-4 h-4 accent-[#EFB81A]"
                          />
                          <div className="min-w-0">
                            <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{recipient.email}</p>
                            {recipient.name && <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{recipient.name}</p>}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200 dark:border-gray-800 p-4 md:p-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Call to Action <span className="text-gray-400 dark:text-gray-500 font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={ctaLabel}
                    onChange={e => setCtaLabel(e.target.value)}
                    placeholder="Read the full report"
                    maxLength={120}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                  <input
                    type="text"
                    value={ctaUrl}
                    onChange={e => setCtaUrl(e.target.value)}
                    placeholder="https://…"
                    maxLength={2000}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#0F0F10] border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#EFB81A]"
                  />
                </div>
              </div>

              {/* Test email */}
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
                    disabled={testing || loading || !testEmail.trim()}
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
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  Sends one copy with the same subject and content. Subscribers are not touched and the campaign is not marked as sent.
                </p>
              </div>
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Send Newsletter?</h2>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">Subject:</span>{' '}
                <span className="font-medium">{subject || '—'}</span>
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="text-gray-500 dark:text-gray-400">Recipients:</span>{' '}
                <span className="font-medium">{recipientCount.toLocaleString()} active subscriber{recipientCount === 1 ? '' : 's'}</span>
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                This will send the newsletter to all selected recipients. Sending starts in the background and progress is shown on the campaign page.
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
                disabled={sending || recipientCount === 0}
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

/* ---------------------------------------------------------------- subcomponents --- */

function EditorButton({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => e.preventDefault()}
      onClick={onClick}
      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
    >
      {children}
    </button>
  );
}

function RecipientCard({
  active,
  onClick,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-3 transition-colors ${
        active
          ? 'border-[#EFB81A] bg-amber-50 dark:bg-amber-900/10 ring-1 ring-[#EFB81A]'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full border-2 ${active ? 'bg-[#EFB81A] border-[#EFB81A]' : 'border-gray-300 dark:border-gray-600'}`} />
        {title}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </button>
  );
}
