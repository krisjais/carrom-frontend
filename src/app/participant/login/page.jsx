'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ParticipantLoginPage() {
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
      await login(email.trim(), password);
      router.push('/participant/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your student credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-140px)] flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden">
      {/* Background Image: Pure photography with cinematic warm vignette, NO text overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/carrom_login_exact.jpg"
          alt="Carrom Championship Board Background"
          fill
          className="object-cover object-center filter brightness-[0.38] contrast-110"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/75" />
      </div>

      {/* Floating Form Div: Glassmorphic Elevated Card Centered Above the Background Image */}
      <div className="relative z-10 w-full max-w-md bg-[#171614]/85 dark:bg-[#11100E]/90 backdrop-blur-xl border border-white/15 rounded-3xl p-7 sm:p-10 shadow-2xl text-[#F7F4EC]">
        
        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-mono tracking-widest uppercase text-[#C2A268]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>INTRA-COLLEGE CHAMPIONSHIP</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight text-white leading-tight">
            Athlete Sign In
          </h1>
          <p className="text-xs text-[#F7F4EC]/70 font-sans max-w-xs mx-auto">
            Sign in with the student email address and password used during registration.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-[#D93829]/20 text-[#FF8F82] border border-[#D93829]/40 text-xs font-semibold flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#D93829] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-[#F7F4EC]/90 block">
              Registered Student Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. aryan@college.edu"
              autoComplete="email"
              className="w-full h-11 sm:h-12 bg-white/10 hover:bg-white/[0.14] focus:bg-white/15 px-4 text-sm text-white placeholder:text-white/40 rounded-xl border border-white/20 focus:outline-none focus:border-[#C2A268] transition-all"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-[#F7F4EC]/90 block">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full h-11 sm:h-12 bg-white/10 hover:bg-white/[0.14] focus:bg-white/15 pl-4 pr-11 text-sm text-white placeholder:text-white/40 rounded-xl border border-white/20 focus:outline-none focus:border-[#C2A268] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#F7F4EC]/70 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-[#C2A268] focus:ring-0"
              />
              <span>Stay logged in</span>
            </label>
            <Link href="/admin/login" className="hover:text-white underline underline-offset-4 text-[#C2A268]">
              Referee Console →
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 sm:h-12 rounded-xl bg-[#F7F4EC] hover:bg-white text-[#171614] text-xs font-bold tracking-wider uppercase transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Signing In...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/15 text-center text-xs text-[#F7F4EC]/70">
          <span>Not registered for this championship yet? </span>
          <Link href="/registration" className="text-white font-bold hover:underline hover:text-[#C2A268] transition-colors">
            Register as Athlete →
          </Link>
        </div>

      </div>
    </div>
  );
}
