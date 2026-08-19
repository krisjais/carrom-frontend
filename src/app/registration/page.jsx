'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CheckCircle2, ArrowRight, Users, Shield, Info } from 'lucide-react';

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    department: '',
    doublesPartnerName: '',
    mixedDoublesPartnerName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.submitRegistration(formData);
      if (res.success) {
        setSubmittedData(formData);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="eyebrow-label">
          Official Athlete Entry
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Tournament Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Register once to compete in Singles, Doubles, and Mixed Doubles divisions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold font-mono">
          {error}
        </div>
      )}

      {success && (
        <div className="p-8 sm:p-10 rounded-4xl arena-card border border-[#F2C94C]/40 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-2">
            <span className="eyebrow-label text-emerald-400">
              Entry Recorded
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-white uppercase">
              Registration Submitted Successfully!
            </h3>
            <p className="text-xs text-[#F5F1E8]/80 max-w-lg mx-auto font-mono leading-relaxed">
              Thank you, <strong className="text-white font-bold">{submittedData?.fullName}</strong> ({submittedData?.department}). Your entry is now recorded and pending admin verification.
            </p>
          </div>

          {(submittedData?.doublesPartnerName || submittedData?.mixedDoublesPartnerName) && (
            <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] text-left text-xs font-mono space-y-2 text-[#F5F1E8]/80">
              <div className="font-bold text-[#F2C94C] uppercase text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>Partner Registration Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#F5F1E8]/70">
                Your nominated partner(s) should independently submit their tournament registration. The system will automatically link your team for the knockout draw once both athletes are registered.
              </p>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/brackets"
              className="w-full sm:w-auto px-6 py-3 rounded-full btn-gold text-xs font-black shadow-lg uppercase font-display tracking-wider"
            >
              View Tournament Brackets →
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  fullName: '',
                  gender: 'male',
                  department: '',
                  doublesPartnerName: '',
                  mixedDoublesPartnerName: '',
                });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#14171A] hover:bg-[#1A1E24] border border-[#2A313C] text-[#F5F1E8] text-xs font-bold font-mono transition-colors"
            >
              Register Another Athlete
            </button>
          </div>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="arena-card p-6 sm:p-10 space-y-8 rounded-4xl border border-[#D4A94C]/30 bg-gradient-to-b from-[#1A1E24] to-[#111417]">
          {/* 1. Student Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#2A313C]">
              <Users className="w-5 h-5 text-[#F2C94C]" />
              <h3 className="font-black text-white text-base font-display uppercase tracking-wide">
                1. Student Athlete Details
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C]"
                  >
                    <option value="male">Male (Boys Singles, Boys Doubles, Mixed)</option>
                    <option value="female">Female (Girls Singles, Girls Doubles, Mixed)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                    Department / Major *
                  </label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Computer Science"
                    className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Partner Nominations */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#2A313C]">
              <Shield className="w-5 h-5 text-[#F2C94C]" />
              <h3 className="font-black text-white text-base font-display uppercase tracking-wide">
                2. Partner Nominations (Optional)
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] text-xs space-y-1 text-[#F5F1E8]/70 font-mono">
              <p className="font-bold text-white uppercase text-[11px]">Independent Partner Registration:</p>
              <p>
                Simply enter your desired partner&apos;s Full Name below. Your partner only needs to independently submit their own tournament registration with matching details.
              </p>
            </div>

            <div className="space-y-4">
              {/* Category Doubles */}
              <div>
                <label className="text-[11px] text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                  {formData.gender === 'male' ? 'Boys Doubles Partner Full Name (Same Gender)' : 'Girls Doubles Partner Full Name (Same Gender)'}
                </label>
                <input
                  type="text"
                  name="doublesPartnerName"
                  value={formData.doublesPartnerName}
                  onChange={handleChange}
                  placeholder="e.g. Siddharth Rao"
                  className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C]"
                />
              </div>

              {/* Mixed Doubles */}
              <div>
                <label className="text-[11px] text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                  Mixed Doubles Partner Full Name (Opposite Gender)
                </label>
                <input
                  type="text"
                  name="mixedDoublesPartnerName"
                  value={formData.mixedDoublesPartnerName}
                  onChange={handleChange}
                  placeholder={formData.gender === 'male' ? 'e.g. Ananya Patel (Female)' : 'e.g. Siddharth Rao (Male)'}
                  className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C]"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#2A313C]">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl btn-gold text-xs font-black shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 font-display uppercase tracking-wider"
            >
              <span>{loading ? 'Submitting Registration...' : 'SUBMIT REGISTRATION'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
