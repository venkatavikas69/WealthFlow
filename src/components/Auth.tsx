import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Layout, 
  TrendingDown, 
  Shield, 
  ArrowRight,
  Github,
  Chrome
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, register, verifyOTP, loginWithGitHub, loginWithGoogle } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const result = await login(email, password);
        if (result?.mfaRequired) {
          setMfaRequired(true);
        }
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyOTP(email, otp);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (mfaRequired) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 lg:p-12 rounded-[2rem] bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] dark:shadow-none"
        >
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <div className="w-16 h-16 bg-black dark:bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Shield className="text-white w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Two-Step Verification</h2>
              <p className="text-gray-500 dark:text-gray-400">
                We've sent a 6-digit code to <span className="text-black dark:text-white font-medium">{email}</span>. Please check your console for the code.
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1e293b] border-none rounded-2xl text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-black dark:focus:ring-indigo-500 outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:tracking-normal placeholder:text-base placeholder:font-normal text-gray-900 dark:text-white"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-4 bg-black dark:bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => {
                  setMfaRequired(false);
                  setOtp('');
                  setError(null);
                }}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Branding/Marketing */}
        <div className="hidden lg:block space-y-8">
          <div className="flex items-center gap-3 text-black dark:text-white">
            <div className="w-10 h-10 bg-black dark:bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Layout className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">FinStream</span>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Master your <br />
              <span className="text-gray-400 dark:text-gray-500">financial flow.</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
              The modern way to track expenses, set budgets, and visualize your wealth growth in one seamless dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 space-y-2">
              <TrendingDown className="w-6 h-6 text-gray-900 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Expense Tracking</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">Monitor every penny and identify saving opportunities.</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-gray-800 space-y-2">
              <Shield className="w-6 h-6 text-gray-900 dark:text-indigo-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Secure Storage</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">Your data is stored in our secure, encrypted cloud vault.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "p-8 lg:p-12 rounded-[2rem] bg-white dark:bg-[#0f172a] border border-gray-100 dark:border-gray-800",
            "shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] dark:shadow-none transition-colors duration-300"
          )}
        >
          <div className="max-w-md mx-auto space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {isLogin 
                  ? 'Sign in to continue your financial journey.' 
                  : 'Join thousands of users managing their wealth better.'}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1e293b] border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-[#1e293b] border-none rounded-2xl focus:ring-2 focus:ring-black dark:focus:ring-indigo-500 outline-none transition-all text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-black dark:bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Get Started')}
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-gray-800"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-[#0f172a] px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => loginWithGitHub()}
                  disabled={loading}
                  className="w-full py-4 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Github className="w-5 h-5 text-black dark:text-white" />
                  GitHub
                </button>

                <button
                  type="button"
                  onClick={() => loginWithGoogle()}
                  disabled={loading}
                  className="w-full py-4 bg-white dark:bg-gray-800 text-black dark:text-white border border-gray-100 dark:border-gray-700 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Chrome className="w-5 h-5 text-gray-900 dark:text-white" />
                  Google
                </button>
              </div>
            </form>

            <div className="text-center pt-4">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
