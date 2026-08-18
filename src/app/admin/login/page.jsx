'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('admin@carrom.edu');
  const [password, setPassword] = useState('admincarrom2026');
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
        <div className="w-12 h-12 rounded-2xl bg-[#0E1626] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black font-display text-white">Administrator Console</h1>
        <p className="text-xs text-[#94A3B8]">
          Sign in with administrator credentials to manage tournament operations.
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
            Admin Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div>
          <label className="text-xs text-[#94A3B8] font-medium block mb-1">
            Admin Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-sm transition-all"
        >
          {loading ? 'Authenticating...' : 'Access Admin Panel'}
        </button>

        <div className="p-3 rounded-lg bg-[#070B16] border border-[#1C2B48] text-[11px] text-[#94A3B8] space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-300">Default Admin Credentials:</p>
              <p className="font-mono text-[10px]">Email: admin@carrom.edu</p>
              <p className="font-mono text-[10px]">Pass: admincarrom2026</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@carrom.edu');
                setPassword('admincarrom2026');
                handleSubmit({ preventDefault: () => {} });
              }}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37]/25 text-[11px] font-bold transition-colors shrink-0"
            >
              ⚡ 1-Click Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
