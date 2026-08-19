'use client';

import React, { useState } from 'react';
import { chessApi } from '@/lib/chessApi';
import { UserCheck, AlertCircle, Loader2, UserPlus, CheckCircle2, Copy } from 'lucide-react';

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
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 text-center max-w-xl mx-auto shadow-xs space-y-6">
        <div className="w-14 h-14 bg-emerald-50 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-mono tracking-widest text-[#C9A227] font-bold block mb-1">
            Application Received
          </span>
          <h2 className="text-2xl font-bold font-display text-[#111111]">
            REGISTRATION SUCCESSFUL
          </h2>
        </div>

        <div className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-5 space-y-2">
          <p className="text-xs text-[#666666] uppercase font-mono tracking-wider font-semibold">Your Official Player ID</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-extrabold font-mono text-[#111111]">
              {registeredPlayer.playerId}
            </span>
            <button
              onClick={copyPlayerId}
              className="p-2 text-[#666666] hover:text-[#111111] bg-white border border-[#E5E5E5] rounded-lg transition-colors"
              title="Copy Player ID"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && <p className="text-xs text-emerald-600 font-mono">Copied to clipboard!</p>}
        </div>

        <div className="text-left bg-gray-50 rounded-xl p-4 border border-[#E5E5E5] space-y-2 text-xs text-[#666666]">
          <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
            <span>Name:</span>
            <span className="text-[#111111] font-semibold">{registeredPlayer.fullName}</span>
          </div>
          <div className="flex justify-between border-b border-[#E5E5E5] pb-2">
            <span>Email:</span>
            <span className="text-[#111111] font-semibold">{registeredPlayer.email}</span>
          </div>
          <div className="flex justify-between">
            <span>Department:</span>
            <span className="text-[#C9A227] font-semibold">{registeredPlayer.department}</span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              setRegisteredPlayer(null);
              setFormData({ fullName: '', email: '', department: 'IT Team' });
            }}
            className="text-xs text-[#666666] hover:text-[#111111] underline transition-colors"
          >
            Register Another Player
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E5E5E5] rounded-2xl p-8 max-w-xl mx-auto shadow-xs space-y-5">
      
      <div className="border-b border-[#E5E5E5] pb-4">
        <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block mb-1">
          Competitor Entry
        </span>
        <h2 className="text-2xl font-bold font-display text-[#111111]">
          PLAYER REGISTRATION
        </h2>
        <p className="text-xs text-[#666666] mt-1">
          Enter your details below to register for the Chess Championship 2026.
        </p>
      </div>

      {apiError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Full Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
          Full Name <span className="text-[#C9A227]">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="e.g. Rahul Sharma"
          disabled={loading}
          className={`w-full bg-gray-50 border ${
            errors.fullName ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#000000]'
          } rounded-xl px-4 py-2.5 text-[#111111] placeholder-[#666666] focus:outline-none transition-colors text-xs font-sans`}
        />
        {errors.fullName && <p className="text-xs text-red-600">{errors.fullName}</p>}
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
          College / Official Email <span className="text-[#C9A227]">*</span>
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="e.g. rahul.sharma@college.edu"
          disabled={loading}
          className={`w-full bg-gray-50 border ${
            errors.email ? 'border-red-500' : 'border-[#E5E5E5] focus:border-[#000000]'
          } rounded-xl px-4 py-2.5 text-[#111111] placeholder-[#666666] focus:outline-none transition-colors text-xs font-sans`}
        />
        {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
      </div>

      {/* Department / Team */}
      <div className="space-y-1.5">
        <label className="block text-xs font-mono font-bold text-[#111111] uppercase tracking-wider">
          Department / Team <span className="text-[#C9A227]">*</span>
        </label>
        <select
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          disabled={loading}
          className="w-full bg-gray-50 border border-[#E5E5E5] focus:border-[#000000] rounded-xl px-4 py-2.5 text-[#111111] focus:outline-none transition-colors text-xs font-sans"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        {errors.department && <p className="text-xs text-red-600">{errors.department}</p>}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#000000] hover:bg-[#222222] disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-xs uppercase tracking-wider font-display text-xs"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Registration...</span>
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 text-[#C9A227]" />
            <span>Complete Registration</span>
          </>
        )}
      </button>
    </form>
  );
}
