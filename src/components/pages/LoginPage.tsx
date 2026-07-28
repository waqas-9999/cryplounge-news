'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useRateLimit, RATE_LIMITS, formatResetTime } from '@/utils/rateLimiter';
import { loginSchema, validateAndSanitize, sanitizeInput } from '@/utils/validation';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Rate limiting
  const { check: checkRateLimit, isLimited, remaining, resetIn } = useRateLimit('login', RATE_LIMITS.LOGIN);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check rate limit
    if (checkRateLimit()) {
      const resetTime = formatResetTime(resetIn);
      toast.error(`Too many login attempts. Try again in ${resetTime}.`);
      return;
    }

    // Validate inputs
    const result = validateAndSanitize(loginSchema, { email, password });
    if (!result.success) {
      setError(result.errors[0]);
      return;
    }

    setIsLoading(true);
    try {
      await login(result.data.email, result.data.password);
      toast.success('Welcome back! 🎉');
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Welcome back! 🎉');
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Blockchain network nodes animation
  const nodes = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 8 + 4,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F9D96A]/20 dark:from-[#0F0F10] dark:via-[#1A1A1C] dark:to-[#1E1E20]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic Gradient Orbs */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-[#F9D96A]/30 dark:from-[#EFB81A]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-80 h-80 bg-[#F9D96A]/30 dark:from-[#EFB81A]/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -90, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Blockchain Network Visualization */}
        <svg className="absolute inset-0 w-full h-full">
          {nodes.map((node, i) => (
            <g key={node.id}>
              {/* Connection Lines */}
              {nodes.slice(i + 1, i + 3).map((targetNode, j) => (
                <motion.line
                  key={`${i}-${j}`}
                  x1={`${node.x}%`}
                  y1={`${node.y}%`}
                  x2={`${targetNode.x}%`}
                  y2={`${targetNode.y}%`}
                  stroke="currentColor"
                  className="text-[#EFB81A]/20 dark:text-[#EFB81A]/20"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.3 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                />
              ))}
              {/* Nodes */}
              <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={node.size}
                fill="currentColor"
                className="text-[#EFB81A]"
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  duration: 3,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            </g>
          ))}
        </svg>

        {/* Floating Hexagons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 border-2 border-[#F9D96A]/30 dark:border-[#EFB81A]/30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8 + i,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/80 dark:bg-[#1E1E20]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-white/[0.08] p-5 sm:p-8 md:p-10">
              {/* Mobile Logo */}
              <div className="lg:hidden text-center mb-4 sm:mb-6">
                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-[#EFB81A] rounded-lg mb-2 sm:mb-3">
                  <span className="text-black text-xs sm:text-sm">CRYPLOUNGE</span>
                </div>
              </div>

              <div className="text-center mb-5 sm:mb-8">
                <motion.h2
                  className="text-gray-800 dark:text-[#F3F3F5] mb-1 sm:mb-2 text-xl sm:text-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Welcome Back
                </motion.h2>
                <motion.p
                  className="text-gray-600 dark:text-[#A0A0A5] text-sm sm:text-base"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Sign in to continue your journey
                </motion.p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 sm:gap-3"
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Rate Limit Warning */}
              {!isLimited && remaining < 3 && remaining > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-xl flex items-start gap-2 sm:gap-3"
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-400">
                    {remaining} login attempt{remaining !== 1 ? 's' : ''} remaining
                  </p>
                </motion.div>
              )}

              {/* Rate Limit Error */}
              {isLimited && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 sm:gap-3"
                >
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                    Too many login attempts. Please try again in {formatResetTime(resetIn)}.
                  </p>
                </motion.div>
              )}

              {/* Google Button */}
              <motion.button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-3.5 px-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-all flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 disabled:opacity-50 disabled:cursor-not-allowed group"
                aria-label="Sign in with Google"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  Continue with Google
                </span>
              </motion.button>

              {/* Divider */}
              <div className="relative my-4 sm:my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-3 sm:px-4 bg-white/80 dark:bg-[#1E1E20]/80 text-gray-500 dark:text-gray-400">
                    or continue with email
                  </span>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      aria-required="true"
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <label htmlFor="password" className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => onNavigate('forgot-password')}
                      className="text-xs sm:text-sm text-[#EFB81A] hover:underline"
                      aria-label="Reset your password"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      aria-required="true"
                      className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#EFB81A] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || isLimited}
                  whileHover={{ scale: isLimited ? 1 : 1.02 }}
                  whileTap={{ scale: isLimited ? 1 : 0.98 }}
                  className="w-full py-3 sm:py-3.5 px-4 bg-[#EFB81A] hover:bg-[#EFB81A]/90 text-black rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-5 sm:mt-6 text-sm sm:text-base"
                  aria-label="Sign in to your account"
                >
                  {isLoading ? (
                    'Signing in...'
                  ) : isLimited ? (
                    <>
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                      Account Locked
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Signup Link */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => onNavigate('signup')}
                    className="text-[#EFB81A] hover:underline"
                    aria-label="Create a new account"
                  >
                    Sign up
                  </button>
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Secured with 256-bit encryption</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Animated Content */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            {/* Logo */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <div className="inline-block px-6 py-3 bg-[#EFB81A] rounded-2xl">
                <span className="text-black text-2xl">CRYPLOUNGE</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-gray-800 dark:text-[#F3F3F5] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Continue Your
              <br />
              <span className="text-[#EFB81A]">
                Crypto Journey
              </span>
            </motion.h1>

            <motion.p
              className="text-gray-600 dark:text-[#A0A0A5] text-lg mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Access your personalized dashboard, track your progress, and stay updated with the latest in blockchain technology.
            </motion.p>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div
                className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Shield className="w-8 h-8 text-[#EFB81A] mb-3" />
                <div className="text-2xl text-gray-800 dark:text-gray-200 mb-1">100%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Secure Access</div>
              </motion.div>

              <motion.div
                className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Zap className="w-8 h-8 text-[#EFB81A] mb-3" />
                <div className="text-2xl text-gray-800 dark:text-gray-200 mb-1">Fast</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Instant Login</div>
              </motion.div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="w-2 h-2 bg-[#EFB81A] rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Access your learning progress</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <div className="w-2 h-2 bg-[#EFB81A] rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Track your achievements</span>
              </motion.div>
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4 }}
              >
                <div className="w-2 h-2 bg-[#EFB81A] rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Personalized recommendations</span>
              </motion.div>
            </div>

            {/* Animated Dashboard Preview */}
            <motion.div
              className="mt-12 relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6 }}
            >
              <div className="bg-white/30 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#EFB81A] rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full w-5/6"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full w-4/6"></div>
                </div>
              </div>
              <motion.div
                className="absolute -right-4 -top-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Globe className="w-4 h-4 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
