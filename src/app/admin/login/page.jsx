'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Shield, Eye, EyeOff, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      if (user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed. Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-[#DCD6C8] dark:border-[#2E2B25] shadow-2xl bg-[#F7F4EC] dark:bg-[#1D1C19] grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Column: Visual & Brand Editorial Side */}
        <div className="lg:col-span-6 relative p-8 md:p-12 flex flex-col justify-between overflow-hidden bg-[#171614] text-[#F7F4EC]">
          {/* Background Image with Cinematic Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/carrom_login_exact.jpg"
              alt="Carrom Championship Board and Striker"
              fill
              className="object-cover opacity-60 scale-105 filter contrast-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#171614] via-[#171614]/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#171614] via-transparent to-[#171614]/40" />
          </div>

          {/* Top Brand Tag */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#171614] border border-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                  <circle cx="12" cy="12" r="5.5" stroke="currentColor" strokeWidth="1.75" />
                  <circle cx="12" cy="12" r="2.2" fill="currentColor" />
                </svg>
              </div>
              <div>
                <span className="font-sans font-bold text-sm tracking-tight text-white block leading-none">Carrom Portal</span>
                <span className="text-[9px] font-mono tracking-[0.2em] text-white/50 uppercase">PLAY • COMPETE • CONNECT</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-white/40 tracking-widest uppercase">SYS v2.4</span>
          </div>

          {/* Center Editorial Typography Matching Reference: Strike Compete Belong */}
          <div className="relative z-10 my-10 space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#F7F4EC] leading-[1.05]">
              Strike <br />
              Compete <br />
              Belong
            </h2>
            <p className="text-sm text-[#F7F4EC]/80 font-sans leading-relaxed pt-1 max-w-xs">
              More than a game. <br />
              A growing community.
            </p>
          </div>

          {/* Bottom Trust Indicators */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-white/60 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C2A268]" />
              <span>256-Bit Encrypted Session</span>
            </div>
            <span className="font-mono text-[11px] text-white/40">OFFICIAL PORTAL</span>
          </div>
        </div>

        {/* Right Column: Clean Warm Ivory Form */}
        <div className="lg:col-span-6 p-8 md:p-12 lg:p-14 flex flex-col justify-center bg-[#F7F4EC] dark:bg-[#1D1C19]">
          <div className="max-w-md mx-auto w-full space-y-6">
            
            <div>
              <span className="text-[11px] font-bold font-mono tracking-widest text-[#857B6C] uppercase block mb-1">
                Admin Authentication
              </span>
              <h1 className="text-3xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">
                Sign in to Console
              </h1>
              <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] mt-1.5">
                Enter your administrative credentials to manage tournament draws, schedules, and live matches.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-[#FDEDEC] dark:bg-[#D93829]/15 text-[#D93829] border border-[#D93829]/30 text-xs font-semibold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#D93829] shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#171614] dark:text-[#F7F4EC] block">
                  Admin Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@carromportal.org"
                  autoComplete="email"
                  className="w-full h-12 bg-white dark:bg-[#24221E] px-4 text-sm text-[#171614] dark:text-[#F7F4EC] rounded-xl border border-[#DCD6C8] dark:border-[#38342C] focus:outline-none focus:border-[#171614] dark:focus:border-[#C2A268] transition-colors placeholder:text-[#9E9689]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#171614] dark:text-[#F7F4EC] block">
                    Security Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full h-12 bg-white dark:bg-[#24221E] pl-4 pr-12 text-sm text-[#171614] dark:text-[#F7F4EC] rounded-xl border border-[#DCD6C8] dark:border-[#38342C] focus:outline-none focus:border-[#171614] dark:focus:border-[#C2A268] transition-colors placeholder:text-[#9E9689]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#857B6C] hover:text-[#171614] dark:hover:text-[#F7F4EC] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#6F6A60] dark:text-[#A8A194]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#DCD6C8] text-[#171614] focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Keep me authenticated</span>
                </label>
                <Link href="/participant/login" className="hover:text-[#171614] dark:hover:text-[#F7F4EC] underline underline-offset-4">
                  Athlete Login →
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#171614] hover:bg-[#2A2824] dark:bg-[#F7F4EC] dark:hover:bg-white text-[#F7F4EC] dark:text-[#171614] text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Access Admin Panel'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-4 border-t border-[#DCD6C8]/60 dark:border-[#38342C] text-center text-xs text-[#6F6A60] dark:text-[#A8A194]">
              <span>Need player verification or match schedule? </span>
              <Link href="/live" className="text-[#171614] dark:text-[#F7F4EC] font-bold hover:underline">
                View Live Arena
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
