'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, Eye, EyeOff } from 'lucide-react';

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
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-[#1E3258] border border-[#D7A859]/50 text-[#FFD691] flex items-center justify-center mx-auto shadow-lg shadow-[#FFD691]/10">
          <Shield className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-black font-display text-white mt-2">Administrator Console</h1>
        <p className="text-xs text-[#D4DEEE]">
          Sign in with administrator credentials to manage tournament operations.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="sport-card p-8 space-y-5 rounded-3xl border border-[#35538C]">
        <div>
          <label className="text-xs text-[#D4DEEE] font-bold block mb-1.5">
            Admin Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@example.com"
            autoComplete="email"
            className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
          />
        </div>

        <div>
          <label className="text-xs text-[#D4DEEE] font-bold block mb-1.5">
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
              className="w-full h-11 bg-[#152442] pl-4 pr-11 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D4DEEE] hover:text-[#FFD691] transition-colors p-1 cursor-pointer"
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
          className="w-full py-3.5 rounded-xl btn-cream text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'ACCESS ADMIN PANEL'}
        </button>
      </form>
    </div>
  );
}
