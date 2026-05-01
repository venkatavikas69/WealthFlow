import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowRight, Shield, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);
  const { user, verifyEmail, resendVerification, logout } = useAuth();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await verifyEmail(code);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError(null);
    try {
      await resendVerification();
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

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
              <Mail className="text-white w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
            <p className="text-gray-500 dark:text-gray-400">
              We've sent a verification code to <br/>
              <span className="text-black dark:text-white font-medium">{user?.email}</span>.
            </p>
            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2">
              Please check your console for the verification code
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="relative group">
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors" />
              <input
                type="text"
                placeholder="6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
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
              disabled={loading || code.length !== 6}
              className="w-full py-4 bg-black dark:bg-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={handleResend}
              disabled={loading || resent}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCw className={resent ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
              {resent ? 'Code Sent!' : "Didn't receive a code? Resend"}
            </button>
            
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-2 mt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign out and use another account
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
