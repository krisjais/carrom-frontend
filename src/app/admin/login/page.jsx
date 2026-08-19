'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { CarromCoin } from '@/components/ui/CarromElements';

export default function AdminLoginPage() {
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
    <div className="max-w-md mx-auto px-4 py-16 space-y-6 text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-[#E74C3C] flex items-center justify-center mx-auto shadow-xs">
          <Shield className="w-7 h-7" />
        </div>
        <span className="eyebrow-label">
          CONTROL ROOM ACCESS
        </span>
        <h1 className="text-3xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] mt-2">Administrator Console</h1>
        <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
          Sign in with administrator credentials to manage tournament operations.
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
            Admin Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            className="w-full h-11 bg-white dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#E74C3C]"
          />
        </div>

        <div>
          <label className="text-xs text-[#3E342B] dark:text-[#F5F1E8] font-bold block mb-1.5 font-mono">
            Admin Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
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
          {loading ? 'Authenticating...' : 'ACCESS ADMIN PANEL'}
        </button>
      </form>
    </div>
  );
}


