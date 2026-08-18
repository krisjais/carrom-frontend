'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, ArrowRight, Trophy, Users, Shield } from 'lucide-react';

export default function RegistrationPage() {
  const router = useRouter();
  const { registerParticipant } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    studentId: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    password: '',
    doublesPartnerName: '',
    mixedDoublesPartnerName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerParticipant(formData);
      setSuccess(true);
      setTimeout(() => {
        router.push('/participant/dashboard');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-mono text-[#FFBA00] font-bold uppercase tracking-widest block">
          Official Athlete Entry
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Championship Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#D8C7F0]">
          Register once to compete in Singles, Doubles, and Mixed Doubles divisions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-8 rounded-3xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-center space-y-3 shadow-2xl">
          <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-400" />
          <h3 className="text-xl font-bold font-display text-white">Registration Submitted Successfully!</h3>
          <p className="text-xs text-emerald-200">Redirecting to your Participant Dashboard...</p>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="sport-card p-6 sm:p-10 space-y-8 rounded-4xl border border-[#4A138C]">
          {/* 1. Student Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#4A138C]">
              <Users className="w-5 h-5 text-[#FFBA00]" />
              <h3 className="font-black text-white text-base font-display">
                1. Student Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                />
              </div>

              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                >
                  <option value="male">Male (Boys Singles, Boys Doubles, Mixed)</option>
                  <option value="female">Female (Girls Singles, Girls Doubles, Mixed)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Student ID / Roll Number *
                </label>
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. CS202601"
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00] uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                />
              </div>

              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. aryan@college.edu"
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                />
              </div>

              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Password (for Participant Portal) *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                />
              </div>
            </div>
          </div>

          {/* 2. Partner Requests */}
          <div className="space-y-5 pt-2">
            <div className="flex items-center gap-2 pb-3 border-b border-[#4A138C]">
              <Trophy className="w-5 h-5 text-[#FDB095]" />
              <h3 className="font-black text-white text-base font-display">
                2. Doubles & Mixed Doubles Partners
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  {formData.gender === 'male' ? 'Boys Doubles Partner Full Name *' : 'Girls Doubles Partner Full Name *'}
                </label>
                <input
                  type="text"
                  name="doublesPartnerName"
                  required
                  value={formData.doublesPartnerName}
                  onChange={handleChange}
                  placeholder="e.g. Rohan Gupta"
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                />
              </div>

              <div>
                <label className="text-xs text-[#D8C7F0] font-bold block mb-1.5">
                  Mixed Doubles Partner Full Name *
                </label>
                <input
                  type="text"
                  name="mixedDoublesPartnerName"
                  required
                  value={formData.mixedDoublesPartnerName}
                  onChange={handleChange}
                  placeholder={formData.gender === 'male' ? 'e.g. Ananya Verma' : 'e.g. Aryan Sharma'}
                  className="w-full h-11 bg-[#140129] px-4 text-xs text-white rounded-xl border border-[#4A138C] focus:outline-none focus:border-[#FFBA00]"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-5 border-t border-[#4A138C] flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#D8C7F0]/80">Admin verifies partner pairings before tournament draw.</span>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl btn-gold text-xs font-black tracking-wide shadow-lg transition-all cursor-pointer"
            >
              {loading ? 'Submitting Entry...' : 'COMPLETE REGISTRATION →'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
