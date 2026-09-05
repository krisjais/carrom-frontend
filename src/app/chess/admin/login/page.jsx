'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { Lock, AlertCircle, Loader2, ArrowLeft, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useChessTheme } from '@/context/ChessThemeContext';

export default function ChessAdminLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useChessTheme();
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
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row text-[#171715] dark:text-[#FAF8F3] transition-colors font-sans antialiased">
      
      {/* LEFT: Dramatic Image Hero (Using User Provided Chessboard Image) */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen flex-col justify-between p-12 overflow-hidden bg-black">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: "url('/chess_login_bg.jpg')" }}
        />
        {/* Dark Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/80 pointer-events-none" />

        {/* Top Branding in Hero */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/chess" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#0D0D0D] flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              ♛
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#FAF8F3] block leading-none font-serif">
                CHESS CHAMPIONSHIP
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#A8A49C] font-mono font-medium block pt-1">
                ADMINISTRATION CONSOLE
              </span>
            </div>
          </Link>

          <Link
            href="/chess"
            className="flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-[#FAF8F3]/80 hover:text-[#FAF8F3] bg-white/10 hover:bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </Link>
        </div>

        {/* Bottom Hero Caption */}
        <div className="relative z-10 space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FAF8F3] text-[10px] uppercase font-mono tracking-widest">
            <span>OFFICIAL TOURNAMENT DESK</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold font-serif text-[#FAF8F3] tracking-tight leading-tight">
            Command the board. Direct the championship.
          </h2>
          <p className="text-sm text-[#A8A49C] leading-relaxed">
            Manage player rosters, orchestrate round pairings, execute live clock controls, and publish definitive standings.
          </p>
        </div>
      </div>

      {/* RIGHT: Login Card Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        {/* Mobile/Tablet Background for small screens */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: "url('/chess_login_bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/90 backdrop-blur-xs" />
        </div>

        {/* Top Controls on Panel (Theme Toggle) */}
        <div className="w-full max-w-md flex justify-between items-center mb-6">
          <Link
            href="/chess"
            className="lg:hidden flex items-center gap-2 text-xs uppercase tracking-wider font-mono text-[#FAF8F3] bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit</span>
          </Link>

          <div className="ml-auto">
            <button
              type="button"
              onClick={toggleTheme}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#EFEAE1] dark:hover:bg-[#262624] transition-all shadow-xs hover:scale-105 active:scale-95"
              title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {mounted && theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              ) : (
                <Moon className="w-4 h-4 text-[#171715]" />
              )}
            </button>
          </div>
        </div>

        {/* Login Card Form */}
        <div className="w-full max-w-md bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-8 sm:p-10 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-lg shadow-xs">
              ♟
            </div>
            <span className="text-[10px] font-mono text-[#77736B] dark:text-[#A8A49C] font-semibold uppercase tracking-widest block pt-1">
              AUTHORIZED ACCESS ONLY
            </span>
            <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
              Admin Login
            </h1>
            <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed">
              Authenticate with your championship director credentials.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3 text-red-700 dark:text-red-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                Username
              </label>
              <input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                placeholder="admin"
                required
                className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-3 text-xs text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] font-mono">Default: admin123</span>
              </div>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-3 text-xs text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-[#000000] dark:hover:bg-[#FFFFFF] text-[#FAF8F3] dark:text-[#0D0D0D] font-medium py-3.5 rounded-xl transition-all shadow-xs hover:shadow hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider text-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Control Center</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#D5CFC5] dark:border-[#262624]">
            <Link
              href="/chess"
              className="text-xs font-mono text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
            >
              ← Return to Championship
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
