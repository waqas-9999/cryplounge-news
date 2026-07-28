'use client';

import { useState } from 'react';
import { Eye, EyeOff, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { AdminAuthService } from '@/utils/adminAuth';
import { adminLoginSchema, validateAndSanitize } from '@/utils/validation';
import { toast } from 'sonner';

interface AdminLoginPageProps {
  onNavigate: (page: string) => void;
  onAdminLogin: () => void;
}

export function AdminLoginPage({ onNavigate, onAdminLogin }: AdminLoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic client-side validation first
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Validate inputs with Zod schema
    const result = validateAndSanitize(adminLoginSchema, { email, password });
    if (!result.success) {
      setError(result.errors[0]);
      toast.error(result.errors[0]);
      return;
    }

    if (enable2FA && !showOTP) {
      // Show OTP input
      setShowOTP(true);
      return;
    }

    setIsLoading(true);
    
    try {
      // Validate admin credentials
      const isValid = await AdminAuthService.validateCredentials(result.data.email, result.data.password);
      
      if (!isValid) {
        setError('Invalid admin credentials');
        toast.error('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Create admin session
      const role = AdminAuthService.getRoleFromEmail(result.data.email);
      AdminAuthService.createSession(result.data.email, role);

      // Success
      toast.success('Admin login successful! 🔒');
      onAdminLogin();
      onNavigate('admin/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
      toast.error('Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0F0F10] flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/5 dark:bg-yellow-400/3 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-400/5 dark:bg-yellow-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-yellow-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CrypLounge
        </button>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#1A1A1C] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-gray-900" />
            </div>
            <h1 className="text-gray-900 dark:text-gray-100 text-2xl mb-2">Admin Portal</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Sign in to access CrypLounge CMS
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(''); // Clear error on input change
                }}
                placeholder="admin@cryplounge.com"
                required
                className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(''); // Clear error on input change
                  }}
                  placeholder="Enter your password (min. 8 characters)"
                  required
                  minLength={8}
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

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enable2FA}
                  onChange={(e) => setEnable2FA(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-yellow-500 focus:ring-yellow-400"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable 2FA</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* OTP Input (shown if 2FA enabled and first login attempt) */}
            {showOTP && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-[#202225] border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-500 focus:border-transparent transition-all text-center tracking-widest"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                  Check your email for the verification code
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                showOTP ? 'Verify & Sign In' : 'Sign In'
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl">
            <p className="text-xs text-yellow-800 dark:text-yellow-200 text-center">
              🔒 This is a secure admin portal. All actions are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}