'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { 
  User, Lock, AlertCircle, Loader2, ArrowLeft, Sun, Moon, 
  Sparkles, CheckCircle2, Trophy, Clock, Swords, UserPlus, Eye, EyeOff, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';
import { useChessTheme } from '@/context/ChessThemeContext';

export default function ChessLoginPage() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useChessTheme();

  // Tab: 'player' (Competitor) | 'admin' (Director)
  const [loginRole, setLoginRole] = useState('player');

  // Player state
  const [playerIdentifier, setPlayerIdentifier] = useState('');
  const [playerPassword, setPlayerPassword] = useState('');
  const [showPlayerPassword, setShowPlayerPassword] = useState(false);
  
  // Admin state
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Player Login Handler
  const handlePlayerLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!playerIdentifier.trim()) {
      setError('Please enter your Player ID (e.g. CHS-SAAD or saad), name, or registered Email.');
      return;
    }
    if (!playerPassword.trim()) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await chessApi.playerLogin(playerIdentifier.trim(), playerPassword.trim());
      if (res.success && res.data?.player) {
        // Redirect directly to the Player Match Portal & Mobile Clock Dashboard
        router.push('/chess/player/dashboard');
      } else {
        setError(res.message || 'Player not found or incorrect password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials or network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await chessApi.adminLogin(adminCredentials);
      if (res.success && res.token) {
        router.push('/chess/admin');
      } else {
        setError(res.message || 'Invalid admin username or password.');
      }
    } catch (err) {
      setError(err.message || 'Admin login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row text-[#171715] dark:text-[#FAF8F3] transition-colors font-sans antialiased">
      
      {/* LEFT: Dramatic Editorial Hero (Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 min-h-screen flex-col justify-between p-12 overflow-hidden bg-black">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: "url('/chess_login_bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/70 pointer-events-none" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/30 to-black/80 pointer-events-none" />

        {/* Top Branding in Hero */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/chess" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#0D0D0D] flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              <svg className="w-5 h-5 fill-current shrink-0" width="20" height="20" style={{ width: '20px', height: '20px', maxWidth: '20px', maxHeight: '20px' }} viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#FAF8F3] block leading-none font-serif">
                CHESS CHAMPIONSHIP
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#A8A49C] font-mono font-medium block pt-1">
                COMPETITOR & DIRECTORS PORTAL
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
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>MOBILE CLOCKS • 10:00 RAPID CONTROL</span>
          </div>
          <h2 className="text-3xl xl:text-4xl font-bold font-serif text-[#FAF8F3] tracking-tight leading-tight">
            Log in to see your match and command your 10-minute clock.
          </h2>
          <p className="text-sm text-[#A8A49C] leading-relaxed">
            Players can view their assigned opponent, piece colors (White or Black), and access the live tap-to-switch clock on their phone.
          </p>
        </div>
      </div>

      {/* RIGHT: Login Card Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        
        {/* Mobile/Tablet Background */}
        <div
          className="lg:hidden absolute inset-0 bg-cover bg-center bg-no-repeat -z-10"
          style={{ backgroundImage: "url('/chess_login_bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/90 backdrop-blur-xs" />
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
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#EFEAE1] dark:hover:bg-[#262624] transition-all shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
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
        <div className="w-full max-w-md bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-7 sm:p-9 shadow-xl space-y-6">
          
          {/* Role Tabs: Player vs Admin */}
          <div className="grid grid-cols-2 gap-1.5 bg-[#EFEAE1]/70 dark:bg-[#1C1C1A] p-1.5 rounded-2xl border border-[#D5CFC5]/70 dark:border-[#282826]">
            <button
              type="button"
              onClick={() => {
                setLoginRole('player');
                setError('');
              }}
              className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginRole === 'player'
                  ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] shadow-xs'
                  : 'text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Competitor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('admin');
                setError('');
              }}
              className={`py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                loginRole === 'admin'
                  ? 'bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] shadow-xs'
                  : 'text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Director</span>
            </button>
          </div>

          {/* PLAYER LOGIN VIEW */}
          {loginRole === 'player' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest block">
                    COMPETITOR MATCH PORTAL
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">
                    Phone Ready
                  </span>
                </div>
                <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                  Player Sign In
                </h1>
                <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed">
                  Enter your name-based Player ID (e.g. <span className="font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">CHS-SAAD</span> or <span className="font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">saad</span>), name, or registered email to view your match and mobile clock.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3 text-red-700 dark:text-red-300 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePlayerLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                    Player ID, Name, or Email
                  </label>
                  <input
                    type="text"
                    value={playerIdentifier}
                    onChange={(e) => setPlayerIdentifier(e.target.value)}
                    placeholder="e.g. CHS-SAAD, saad, or saad@gmail.com"
                    required
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-3 text-sm font-mono text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-sans">
                    Your Player ID and password match your name (e.g. ID: CHS-SAAD / saad, Password: saad123).
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPlayerPassword(!showPlayerPassword)}
                      className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showPlayerPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPlayerPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showPlayerPassword ? 'text' : 'password'}
                    value={playerPassword}
                    onChange={(e) => setPlayerPassword(e.target.value)}
                    placeholder="Enter your account password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-3 text-sm text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-bold py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider text-xs cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Locating Player Dossier...</span>
                    </>
                  ) : (
                    <>
                      <Swords className="w-4 h-4" />
                      <span>Enter Match Portal & Clocks →</span>
                    </>
                  )}
                </button>
              </form>

              {/* Registration Prompt */}
              <div className="pt-3 border-t border-[#D5CFC5]/70 dark:border-[#262624] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                <span className="text-[#77736B] dark:text-[#8E8E93]">Don&apos;t have a Player ID yet?</span>
                <Link
                  href="/chess/register"
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-mono uppercase"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Now</span>
                </Link>
              </div>
            </div>
          )}

          {/* ADMIN LOGIN VIEW */}
          {loginRole === 'admin' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#77736B] dark:text-[#A8A49C] font-semibold uppercase tracking-widest block">
                  AUTHORIZED DIRECTORS ONLY
                </span>
                <h1 className="text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                  Admin Sign In
                </h1>
                <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed">
                  Authenticate to control pairings, generate rounds, and arbitrate match results.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3 text-red-700 dark:text-red-300 text-xs animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, username: e.target.value })}
                    placeholder="Enter username"
                    required
                    autoComplete="username"
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-3 text-xs text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-semibold text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) => setAdminCredentials({ ...adminCredentials, password: e.target.value })}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    className="w-full bg-[#F5F2EB] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-3 text-xs text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-bold py-3.5 rounded-xl transition-all shadow-md uppercase tracking-wider text-xs cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating Director...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Enter Control Room →</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Quick Footer */}
          <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-[#D5CFC5] dark:border-[#262624]">
            <Link
              href="/chess"
              className="text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
            >
              ← Public Site
            </Link>
            <Link
              href="/admin/login"
              className="text-amber-700 dark:text-amber-400 hover:underline"
            >
              Carrom Control Room →
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
}
