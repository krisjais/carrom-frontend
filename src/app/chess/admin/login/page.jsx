'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { Shield, Lock, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ChessAdminLoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await chessApi.adminLogin(credentials);
      if (res.success && res.token) {
        router.push('/chess/admin');
      } else {
        setError(res.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex items-center justify-center p-4 font-sans text-[#111111] antialiased">
      <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-xs space-y-6">
        
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#000000] text-[#C9A227] flex items-center justify-center font-bold font-display text-2xl shadow-xs mx-auto">
            ♟
          </div>
          <span className="text-[10px] font-mono text-[#C9A227] font-bold uppercase tracking-widest block">ADMIN AUTHENTICATION</span>
          <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">PORTAL LOGIN</h1>
          <p className="text-xs text-[#666666]">
            Enter your tournament administrator credentials below.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              placeholder="e.g. admin"
              required
              className="w-full bg-gray-50 border border-[#E5E5E5] focus:border-[#000000] rounded-xl px-4 py-2.5 text-xs text-[#111111] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="••••••••"
              required
              className="w-full bg-gray-50 border border-[#E5E5E5] focus:border-[#000000] rounded-xl px-4 py-2.5 text-xs text-[#111111] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#000000] hover:bg-[#222222] text-white font-bold py-3 rounded-xl transition-all shadow-xs uppercase tracking-wider font-display text-xs"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#C9A227]" />
                <span>Log In to Admin Panel</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2 text-center border-t border-[#E5E5E5]">
          <Link href="/chess" className="text-xs font-mono text-[#666666] hover:text-[#111111] underline">
            ← Return to Public Chess Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
