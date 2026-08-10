'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle2, Camera, User, Loader2 } from 'lucide-react';
import { apiClient, errorMessage } from '@/lib/api-client';
import { toast } from 'sonner';

interface AdminAcceptInvitePageProps {
  onNavigate: (page: string) => void;
}

interface InvitePreview {
  mode: 'signup' | 'grant';
  name: string;
  email: string;
  roleName: string;
}

export function AdminAcceptInvitePage({ onNavigate }: AdminAcceptInvitePageProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [previewState, setPreviewState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      setPreviewState('error');
      return;
    }
    apiClient
      .get<InvitePreview>(`users/invite/${token}`, { auth: false })
      .then(data => {
        setPreview(data);
        setPreviewState('ready');
      })
      .catch(() => setPreviewState('error'));
  }, [token]);

  const handleAvatarSelect = (file: File) => {
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const isGrant = preview?.mode === 'grant';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('This invitation link is missing its token.');
      return;
    }
    if (!isGrant) {
      if (password.length < 12) {
        setError('Password must be at least 12 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('token', token);
      if (!isGrant) form.append('password', password);
      if (avatarFile) form.append('avatar', avatarFile);
      await apiClient.upload('users/invite/accept', form, { auth: false });
      setDone(true);
      toast.success(isGrant ? 'Role added to your account' : 'Password set — you can now sign in');
    } catch (err) {
      const message = errorMessage(err, 'This invitation is invalid or has expired.');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F10] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="text-gray-900 dark:text-gray-100 text-2xl mb-2">
              {isGrant ? 'New Role Assigned' : 'Accept Invitation'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {previewState === 'ready' && preview
                ? isGrant
                  ? `A super admin has granted your account (${preview.email}) the ${preview.roleName} role.`
                  : 'Set a password to activate your CrypLounge staff account'
                : 'Set a password to activate your CrypLounge staff account'}
            </p>
          </div>

          {previewState === 'loading' ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
            </div>
          ) : previewState === 'error' ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">
                This invitation link is missing, invalid, or has expired.
              </p>
            </div>
          ) : done ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-xl flex items-start gap-3 text-left">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 dark:text-green-400">
                  {isGrant
                    ? `Your account now also holds the ${preview?.roleName} role.`
                    : 'Your account is active. You can now sign in with your email and new password.'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('admin/login')}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-xl transition-all"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {!isGrant && (
                  <div className="flex flex-col items-center">
                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2 self-start">
                      Profile Picture (optional)
                    </label>
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarSelect(file);
                        }}
                      />
                      <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                        {avatarPreview ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center hover:bg-yellow-500 transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5 text-gray-900" />
                      </button>
                    </div>
                  </div>
                )}

                {isGrant ? (
                  <div className="p-4 bg-gray-50 dark:bg-[#202225] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                    Confirm to add the <span className="text-gray-900 dark:text-gray-100">{preview?.roleName}</span> role
                    to your existing account. Your password stays the same.
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder="At least 12 characters"
                          required
                          minLength={12}
                          className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your password"
                        required
                        minLength={12}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                      {isGrant ? 'Confirming...' : 'Activating...'}
                    </>
                  ) : isGrant ? (
                    'Confirm New Role'
                  ) : (
                    'Activate Account'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
