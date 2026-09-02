'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ChessAdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await chessApi.adminLogin(credentials);
      if (res.success && res.token) {
        router.push('/chess/admin');
      } else {
        setError(res.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] dark:bg-[#0B0F17] flex items-center justify-center p-4 font-sans text-[#0F172A] dark:text-[#F8FAFC] antialiased transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-[#141B2D] border border-[#E2E8F0] dark:border-[#232A3B] rounded-2xl p-8 shadow-xl space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-slate-950 dark:bg-slate-900 text-[#C9A227] dark:text-[#D4AF37] flex items-center justify-center font-bold font-display text-2xl shadow-sm border border-[#C9A227]/20 mx-auto">
            ♟
          </div>
          <span className="text-[10px] font-mono text-[#C9A227] dark:text-[#D4AF37] font-bold uppercase tracking-widest block">ADMIN AUTHENTICATION</span>
          <h1 className="text-2xl font-bold font-display text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wide">PORTAL LOGIN</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Enter your tournament administrator credentials below.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-xl p-3 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="e.g. admin"
              required
              className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="••••••••"
              required
              className="w-full bg-slate-50 dark:bg-[#1A2337] border border-[#E2E8F0] dark:border-[#232A3B] focus:border-[#C9A227] dark:focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] dark:placeholder-[#94A3B8] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-[#D4AF37] dark:hover:bg-[#C9A227] text-white dark:text-slate-950 font-bold py-3 rounded-xl transition-all shadow-md uppercase tracking-wider font-display text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#C9A227] dark:text-slate-950" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#C9A227] dark:text-slate-950" />
                <span>Log In to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#E2E8F0] dark:border-[#232A3B]">
          <Link href="/chess" className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] underline transition-colors">
            ← Return to Public Chess Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
