import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, ArrowRight, Sparkles, TrendingUp, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface SignupPageProps {
  onNavigate: (page: string) => void;
}

export function SignupPage({ onNavigate }: SignupPageProps) {
  const { signup, signupWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password, name);
      toast.success('Account created successfully! Welcome to CrypLounge! 🎉');
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setIsLoading(true);
    try {
      await signupWithGoogle();
      toast.success('Account created successfully! Welcome to CrypLounge! 🎉');
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Floating particle animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-50 dark:from-[#0F0F10] dark:via-[#1A1A1C] dark:to-[#1E1E20]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-yellow-400/30 to-yellow-500/30 dark:from-yellow-400/20 dark:to-yellow-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-yellow-300/30 to-yellow-500/30 dark:from-yellow-500/20 dark:to-yellow-400/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-1 h-1 bg-yellow-500 dark:bg-yellow-400 rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Animated Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.path
            d="M0,100 Q250,50 500,100 T1000,100"
            stroke="currentColor"
            className="text-yellow-500 dark:text-yellow-500"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M0,300 Q250,250 500,300 T1000,300"
            stroke="currentColor"
            className="text-yellow-400 dark:text-yellow-400"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Animated Content */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
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
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-400 dark:to-yellow-500 rounded-2xl shadow-xl">
                <span className="text-gray-900 dark:text-gray-900 text-2xl">CRYPLOUNGE</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-gray-800 dark:text-[#F3F3F5] mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Join the Future of
              <br />
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 dark:from-yellow-400 dark:to-yellow-500 bg-clip-text text-transparent">
                Crypto Education
              </span>
            </motion.h1>

            <motion.p
              className="text-gray-600 dark:text-[#A0A0A5] text-lg mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Start your journey in blockchain, DeFi, NFTs, and Web3. Learn, earn XP, and grow with the community.
            </motion.p>

            {/* Features */}
            <div className="space-y-6">
              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <Sparkles className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-gray-800 dark:text-gray-200 mb-1">Learn & Earn XP</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Complete courses and earn experience points to level up
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-gray-800 dark:text-gray-200 mb-1">Track Markets</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Stay updated with real-time crypto market insights
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                  <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-gray-800 dark:text-gray-200 mb-1">Unlock Achievements</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Earn badges and achievements as you progress
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Floating Crypto Icons */}
            <div className="mt-12 flex gap-4">
              <motion.div
                className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-2xl">₿</span>
              </motion.div>
              <motion.div
                className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  delay: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-2xl">Ξ</span>
              </motion.div>
              <motion.div
                className="p-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-white/10"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  delay: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span className="text-2xl">◎</span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Signup Form */}
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
                <div className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-400 dark:to-yellow-500 rounded-lg mb-2 sm:mb-3">
                  <span className="text-gray-900 dark:text-gray-900 text-xs sm:text-sm font-medium">CRYPLOUNGE</span>
                </div>
              </div>

              <div className="text-center mb-5 sm:mb-8">
                <h2 className="text-gray-800 dark:text-[#F3F3F5] mb-1 sm:mb-2 text-xl sm:text-2xl">Create Your Account</h2>
                <p className="text-gray-600 dark:text-[#A0A0A5] text-sm sm:text-base">
                  Start your crypto journey today
                </p>
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

              {/* Google Button */}
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full py-3 sm:py-3.5 px-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-all flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6 disabled:opacity-50 disabled:cursor-not-allowed group"
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
              </button>

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

              {/* Signup Form */}
              <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-400 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 sm:mt-1.5 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm text-gray-700 dark:text-gray-300 mb-1.5 sm:mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:focus:ring-yellow-400 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 sm:gap-3 pt-1 sm:pt-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 sm:mt-1 w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400 dark:border-gray-700 dark:bg-gray-800 flex-shrink-0"
                  />
                  <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    I agree to the{' '}
                    <a href="#" className="text-yellow-600 dark:text-yellow-400 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-yellow-600 dark:text-yellow-400 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-400 dark:to-yellow-500 text-gray-900 dark:text-gray-900 rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group font-medium text-sm sm:text-base mt-4 sm:mt-6"
                >
                  {isLoading ? (
                    'Creating Account...'
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Login Link */}
              <div className="mt-4 sm:mt-6 text-center">
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => onNavigate('login')}
                    className="text-yellow-600 dark:text-yellow-400 hover:underline font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
