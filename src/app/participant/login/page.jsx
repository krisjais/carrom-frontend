'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Shield } from 'lucide-react';

export default function ParticipantLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        <h1 className="text-2xl font-black font-display text-white">Participant Login</h1>
        <p className="text-xs text-[#94A3B8]">
          Sign in to view your approved tournament teams and personal match schedule.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="sport-card p-6 space-y-4">
        <div>
          <label className="text-xs text-[#94A3B8] font-medium block mb-1">
            Student Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. aryan@carrom.edu"
            className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label className="text-xs text-[#94A3B8] font-medium block mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-sm transition-all"
        >
          {loading ? 'Signing in...' : 'Sign In to Portal'}
        </button>

        <div className="pt-2 text-center text-xs text-[#94A3B8]">
          <span>Not registered yet? </span>
          <Link href="/registration" className="text-[#D4AF37] font-semibold hover:underline">
            Register Now
          </Link>
        </div>
      </form>
    </div>
  );
}
