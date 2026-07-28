'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, AlertCircle, ArrowRight, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ForgotPasswordPageProps {
  onNavigate: (page: string) => void;
}

export function ForgotPasswordPage({ onNavigate }: ForgotPasswordPageProps) {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
      toast.success('Password reset link sent to your email! 📧');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // Pulsing circles animation
  const circles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: 60 + i * 40,
    delay: i * 0.2,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 dark:from-[#0F0F10] dark:via-[#1A1A1C] dark:to-[#1E1E20] flex items-center justify-center p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Pulsing Circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {circles.map((circle) => (
            <motion.div
              key={circle.id}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-yellow-300/20 dark:border-yellow-500/10"
              style={{
                width: circle.size,
                height: circle.size,
              }}
              animate={{
                scale: [1, 2, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 4,
                delay: circle.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Floating Email Icons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-300 dark:text-yellow-500/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Send className="w-8 h-8" />
          </motion.div>
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 right-1/4 w-72 h-72 bg-gradient-to-br from-yellow-400/20 to-yellow-500/20 dark:from-yellow-400/10 dark:to-yellow-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-tr from-yellow-300/20 to-yellow-500/20 dark:from-yellow-500/10 dark:to-yellow-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/80 dark:bg-[#1E1E20]/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 dark:border-white/[0.08] p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-400 dark:to-yellow-500 rounded-lg mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <span className="text-gray-900 dark:text-gray-900 text-sm font-medium">CRYPLOUNGE</span>
            </motion.div>
          </div>

          {!success ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  <Mail className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </motion.div>
                <h2 className="text-gray-800 dark:text-[#F3F3F5] mb-2">Reset Password</h2>
                <p className="text-gray-600 dark:text-[#A0A0A5]">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-400 transition-all"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-400 dark:to-yellow-500 text-gray-900 dark:text-gray-900 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group font-medium"
                >
                  {isLoading ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => onNavigate('login')}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <motion.div
                  className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                >
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </motion.div>

                <h2 className="text-gray-800 dark:text-[#F3F3F5] mb-3">Check Your Email</h2>
                <p className="text-gray-600 dark:text-[#A0A0A5] mb-2">
                  We've sent a password reset link to:
                </p>
                <p className="text-yellow-600 dark:text-yellow-400 mb-8">{email}</p>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 The link will expire in 24 hours. If you don't see the email, check your spam folder.
                  </p>
                </div>

                <div className="space-y-3">
                  <motion.button
                    onClick={() => onNavigate('login')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-400 dark:to-yellow-500 text-gray-900 dark:text-gray-900 rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Back to Sign In
                  </motion.button>

                  <button
                    onClick={() => setSuccess(false)}
                    className="w-full py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                  >
                    Send Again
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Help Text */}
          {!success && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help?{' '}
                <a href="#" className="text-yellow-600 dark:text-yellow-400 hover:underline font-medium">
                  Contact Support
                </a>
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
