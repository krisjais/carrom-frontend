'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';

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
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest block">
          Athlete Portal
        </span>
        <h1 className="text-3xl font-black font-display text-white">Participant Login</h1>
        <p className="text-xs text-[#D4DEEE]">
          Sign in to view your approved tournament teams and personal match schedule.
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
            Student Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. aryan@college.edu"
            autoComplete="email"
            className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
          />
        </div>

        <div>
          <label className="text-xs text-[#D4DEEE] font-bold block mb-1.5">
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
          {loading ? 'Signing in...' : 'SIGN IN TO PORTAL'}
        </button>

        <div className="pt-2 text-center text-xs text-[#D4DEEE]">
          <span>Not registered yet? </span>
          <Link href="/registration" className="text-[#FFD691] font-bold hover:underline">
            Register Now →
          </Link>
        </div>
      </form>
    </div>
  );
}
