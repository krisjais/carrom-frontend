'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { CarromCoin } from '@/components/ui/CarromElements';

export default function ParticipantLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center mx-auto shadow-xs mb-3">
          <CarromCoin type="queen" size="xs" />
        </div>
        <span className="eyebrow-label">
          ATHLETE PORTAL
        </span>
        <h1 className="text-3xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">Participant Login</h1>
        <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
          Sign in to view your approved tournament teams and personal match schedule.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="editorial-card p-8 space-y-5 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
        <div>
          <label className="text-xs text-[#3E342B] dark:text-[#F5F1E8] font-bold block mb-1.5 font-mono">
            Student Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. aryan@college.edu"
            autoComplete="email"
            className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
          />
        </div>

        <div>
          <label className="text-xs text-[#3E342B] dark:text-[#F5F1E8] font-bold block mb-1.5 font-mono">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full h-11 bg-white dark:bg-[#181C1F] pl-4 pr-11 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7E7060] dark:text-[#817B72] hover:text-[#3E342B] dark:hover:text-[#F5F1E8] transition-colors p-1 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 uppercase tracking-wider"
        >
          {loading ? 'Signing in...' : 'SIGN IN TO PORTAL'}
        </button>

        <div className="pt-2 text-center text-xs text-[#7E7060] dark:text-[#817B72]">
          <span>Not registered yet? </span>
          <Link href="/registration" className="text-[#E74C3C] font-bold hover:underline">
            Register Now →
          </Link>
        </div>
      </form>
    </div>
  );
}


