'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { chessApi } from '@/lib/chessApi';
import { UserCheck, AlertCircle, Loader2, UserPlus, CheckCircle2, Copy, ArrowRight } from 'lucide-react';

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    department: 'IT Team'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [registeredPlayer, setRegisteredPlayer] = useState(null);
  const [copied, setCopied] = useState(false);

  const departments = ['First Year', 'Second Year', 'IT Team', 'MJ Team', 'HR Team'];

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required';
    } else if (formData.fullName.trim().length < 2) {
      errs.fullName = 'Full Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.department) {
      errs.department = 'Please select your Department / Team';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await chessApi.registerPlayer(formData);
      if (response.success && response.data) {
        setRegisteredPlayer(response.data);
      } else {
        setApiError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError(err.message || 'Server connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const copyPlayerId = () => {
    if (registeredPlayer?.playerId) {
      navigator.clipboard.writeText(registeredPlayer.playerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (registeredPlayer) {
    return (
      <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-8 sm:p-10 text-center shadow-lg space-y-6">
        <div className="w-14 h-14 bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#77736B] dark:text-[#8E8E93] font-semibold block mb-1">
            Application Approved
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#171715] dark:text-[#FAF8F3]">
            Welcome to the Roster
          </h2>
        </div>

        {/* Player ID Banner */}
        <div className="bg-[#EFEAE1]/70 dark:bg-[#1B1B19] border border-[#D5CFC5] dark:border-[#282826] rounded-2xl p-6 space-y-2">
          <p className="text-[10px] text-[#77736B] dark:text-[#8E8E93] uppercase font-mono tracking-widest font-semibold">
            Official Competitor ID
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-[#171715] dark:text-[#FAF8F3]">
              {registeredPlayer.playerId}
            </span>
            <button
              onClick={copyPlayerId}
              className="p-2.5 text-[#171715] dark:text-[#FAF8F3] bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] hover:border-[#171715] dark:hover:border-[#FAF8F3] rounded-xl transition-colors"
              title="Copy Player ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">Copied to clipboard!</p>}
        </div>

        {/* Player Profile Summary */}
        <div className="text-left bg-[#EFEAE1]/40 dark:bg-[#1B1B19]/60 rounded-2xl p-5 border border-[#D5CFC5]/70 dark:border-[#282826] space-y-2.5 text-xs text-[#4E4C47] dark:text-[#9E9B93]">
          <div className="flex justify-between border-b border-[#D5CFC5]/50 dark:border-[#262624] pb-2">
            <span className="font-mono uppercase text-[10px]">Competitor:</span>
            <span className="text-[#171715] dark:text-[#FAF8F3] font-serif font-bold text-sm">{registeredPlayer.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-[#D5CFC5]/50 dark:border-[#262624] pb-2">
            <span className="font-mono uppercase text-[10px]">Email:</span>
            <span className="text-[#171715] dark:text-[#FAF8F3] font-mono">{registeredPlayer.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono uppercase text-[10px]">Division:</span>
            <span className="text-[#171715] dark:text-[#FAF8F3] font-medium">{registeredPlayer.department}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/chess/players"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-mono text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl transition-all shadow-sm"
          >
            <span>View Competitor Roster</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => {
              setRegisteredPlayer(null);
              setFormData({ fullName: '', email: '', department: 'IT Team' });
            }}
            className="inline-flex items-center justify-center text-xs font-mono uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] py-3.5 px-5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] transition-colors"
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-7 sm:p-10 shadow-xs space-y-6">
      
      <div className="border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-5">
        <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#8E8E93] uppercase tracking-[0.2em] block mb-1">
          Player Registration Form
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#171715] dark:text-[#FAF8F3]">
          Claim Your Board
        </h2>
        <p className="text-xs text-[#4E4C47] dark:text-[#9E9B93] mt-1 font-sans leading-relaxed">
          Provide your official details below to enter the tournament bracket and receive your unique competitor ID.
        </p>
      </div>

      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl p-3.5 text-red-700 dark:text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono font-medium text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="e.g. Garry Kasparov"
          disabled={loading}
          className={`w-full bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border ${
            errors.fullName ? 'border-red-400' : 'border-[#D5CFC5]/80 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3]'
          } rounded-xl px-4 py-3 text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] dark:placeholder-[#8E8E93] focus:outline-none transition-colors text-xs font-sans`}
        />
        {errors.fullName && <p className="text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono font-medium text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
          Official / College Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="e.g. competitor@institution.edu"
          disabled={loading}
          className={`w-full bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border ${
            errors.email ? 'border-red-400' : 'border-[#D5CFC5]/80 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3]'
          } rounded-xl px-4 py-3 text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] dark:placeholder-[#8E8E93] focus:outline-none transition-colors text-xs font-sans`}
        />
        {errors.email && <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
      </div>

      {/* Department / Team */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-mono font-medium text-[#171715] dark:text-[#FAF8F3] uppercase tracking-wider">
          Division / Department <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          disabled={loading}
          className="w-full bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/80 dark:border-[#282826] focus:border-[#171715] dark:focus:border-[#FAF8F3] rounded-xl px-4 py-3 text-[#171715] dark:text-[#FAF8F3] focus:outline-none transition-colors text-xs font-sans cursor-pointer"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {errors.department && <p className="text-xs text-red-600 dark:text-red-400">{errors.department}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white active:scale-[0.99] disabled:opacity-50 text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-semibold py-3.5 rounded-xl transition-all shadow-sm uppercase tracking-wider text-xs"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Processing Application...</span>
          </>
        ) : (
          <>
            <span>Complete Registration</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
