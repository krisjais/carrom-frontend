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
            className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
          />
        </div>

        <div>
          <label className="text-xs text-[#D4DEEE] font-bold block mb-1.5">
            Admin Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-11 bg-[#152442] px-4 text-xs text-white rounded-xl border border-[#35538C] focus:outline-none focus:border-[#FFD691]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl btn-cream text-xs font-black shadow-lg transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'ACCESS ADMIN PANEL'}
        </button>

        <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C] text-[11px] text-[#D4DEEE] space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-white">Default Admin Credentials:</p>
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
              className="px-3 py-1.5 rounded-xl bg-[#FFD691]/15 border border-[#D7A859]/50 text-[#FFD691] hover:bg-[#FFD691]/25 text-[11px] font-bold transition-colors shrink-0 cursor-pointer"
            >
              1-Click Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
