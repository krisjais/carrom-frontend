'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, ArrowRight } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Championship Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Register once to compete in Singles, Doubles, and Mixed Doubles.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-medium">
          {error}
        </div>
      )}

      {success && (
        <div className="p-6 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
          <h3 className="text-base font-bold text-white">Registration Submitted Successfully!</h3>
          <p className="text-xs text-emerald-300">Redirecting to your Participant Dashboard...</p>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmit} className="sport-card p-6 sm:p-8 space-y-6">
          {/* 1. Student Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm font-display pb-2 border-b border-[#1C2B48]">
              1. Student Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="male">Male (Boys Singles, Boys Doubles, Mixed)</option>
                  <option value="female">Female (Girls Singles, Girls Doubles, Mixed)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Student ID / Roll Number *
                </label>
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. CS202601"
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37] uppercase font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. aryan@college.edu"
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Password (for Participant Portal) *
                </label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* 2. Partner Requests */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-white text-sm font-display pb-2 border-b border-[#1C2B48]">
              2. Doubles & Mixed Doubles Partners
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  {formData.gender === 'male' ? 'Boys Doubles Partner Name *' : 'Girls Doubles Partner Name *'}
                </label>
                <input
                  type="text"
                  name="doublesPartnerName"
                  required
                  value={formData.doublesPartnerName}
                  onChange={handleChange}
                  placeholder="e.g. Rohan Gupta"
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="text-xs text-[#94A3B8] font-medium block mb-1">
                  Mixed Doubles Partner Name *
                </label>
                <input
                  type="text"
                  name="mixedDoublesPartnerName"
                  required
                  value={formData.mixedDoublesPartnerName}
                  onChange={handleChange}
                  placeholder={formData.gender === 'male' ? 'e.g. Ananya Verma' : 'e.g. Aryan Sharma'}
                  className="w-full h-10 bg-[#070B16] px-3 text-xs text-white rounded-lg border border-[#1C2B48] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-[#1C2B48] flex items-center justify-between">
            <span className="text-[11px] text-[#64748B]">Admin verifies partner pairings.</span>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-sm transition-all"
            >
              {loading ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
