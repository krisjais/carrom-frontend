'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Users,
  Shield,
  Info,
  Lock,
  Search,
  Trophy,
  AlertTriangle
} from 'lucide-react';

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'lookup'

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    studentId: '',
    department: '',
    doublesPartnerName: '',
    mixedDoublesPartnerName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lookup Form State
  const [lookupStudentId, setLookupStudentId] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Active Status Record to View (from submission or lookup)
  const [statusRecord, setStatusRecord] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'studentId' ? value.toUpperCase() : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.submitRegistration(formData);
      if (res.success || res.code === 'REGISTRATION_PENDING') {
        // Fetch full lookup record to display live status
        const lookupRes = await api.lookupRegistration(formData.studentId);
        if (lookupRes.success) {
          setStatusRecord(lookupRes);
        } else {
          setStatusRecord({
            participant: res.participant,
            registration: res.registration,
            events: formData.gender === 'male'
              ? ['Boys Singles', 'Boys Doubles', 'Mixed Doubles']
              : ['Girls Singles', 'Girls Doubles', 'Mixed Doubles'],
            doublesValidation: { status: 'partner_not_registered', requestedName: formData.doublesPartnerName },
            mixedDoublesValidation: { status: 'partner_not_registered', requestedName: formData.mixedDoublesPartnerName }
          });
        }
      }
    } catch (err) {
      if (err.data?.code === 'REGISTRATION_LOCKED' || err.data?.code === 'DUPLICATE_STUDENT_ID') {
        // Automatically fetch and show the locked registration
        try {
          const lookupRes = await api.lookupRegistration(formData.studentId);
          if (lookupRes.success) {
            setStatusRecord(lookupRes);
            return;
          }
        } catch (lookupErr) {
          // ignore fallback
        }
      }
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLookupSubmit = async (e) => {
    e.preventDefault();
    if (!lookupStudentId.trim()) return;

    setLookupError(null);
    setLookupLoading(true);

    try {
      const res = await api.lookupRegistration(lookupStudentId.trim());
      if (res.success) {
        setStatusRecord(res);
      }
    } catch (err) {
      setLookupError(err.message || `No registration found for Student ID "${lookupStudentId.toUpperCase()}".`);
      setStatusRecord(null);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="eyebrow-label">
          OFFICIAL ATHLETE ENTRY
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Tournament Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Mandatory 3-event collegiate registration: Singles, Doubles, and Mixed Doubles.
        </p>
      </div>

      {/* Mode Switcher */}
      {!statusRecord && (
        <div className="flex items-center justify-center p-1 rounded-2xl bg-[#14171A] border border-[#2A313C] max-w-md mx-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase font-display tracking-wider transition-all ${
              activeTab === 'register'
                ? 'bg-[#F2C94C] text-[#111417] shadow-md'
                : 'text-[#F5F1E8]/60 hover:text-white'
            }`}
          >
            New Athlete Entry
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('lookup');
              setLookupError(null);
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase font-display tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lookup'
                ? 'bg-[#F2C94C] text-[#111417] shadow-md'
                : 'text-[#F5F1E8]/60 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Check Status</span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. READ-ONLY LOCKED REGISTRATION VIEW (After Submission or Lookup)         */}
      {/* ========================================================================= */}
      {statusRecord && (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Status Header Banner */}
          {statusRecord.registration?.status === 'approved' ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2 border border-emerald-500/40">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="eyebrow-label text-emerald-400">
                LOCKED REGISTRATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase">
                ✓ REGISTRATION APPROVED
              </h2>
              <p className="text-xs text-[#F5F1E8]/80 font-mono max-w-md mx-auto">
                Your tournament registration has been approved by the organizing committee.
              </p>
            </div>
          ) : statusRecord.registration?.status === 'rejected' ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2 border border-rose-500/40">
                <XCircle className="w-7 h-7" />
              </div>
              <span className="eyebrow-label text-rose-400">
                ENTRY REJECTED
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase">
                Registration Rejected
              </h2>
              <p className="text-xs text-[#F5F1E8]/80 font-mono max-w-md mx-auto">
                {statusRecord.registration?.adminNotes || 'Please contact tournament administrators for clarification.'}
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 border border-amber-500/40">
                <Clock className="w-7 h-7" />
              </div>
              <span className="eyebrow-label text-amber-400">
                UNDER REVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white uppercase">
                PENDING APPROVAL
              </h2>
              <p className="text-xs text-[#F5F1E8]/80 font-mono max-w-md mx-auto">
                Your tournament registration has been submitted and is awaiting admin verification.
              </p>
            </div>
          )}

          {/* Details Card */}
          <div className="arena-card p-6 sm:p-8 rounded-3xl border border-[#2A313C] bg-gradient-to-b from-[#1A1E24] to-[#111417] space-y-6">
            {/* Athlete Profile Information */}
            <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#F5F1E8]/60 font-mono uppercase block font-bold">Athlete</span>
                <span className="text-lg font-black text-white font-display uppercase tracking-wide">
                  {statusRecord.participant?.fullName}
                </span>
                <span className="text-xs text-[#F5F1E8]/80 font-mono block capitalize">
                  {statusRecord.participant?.gender} Athlete • {statusRecord.participant?.department}
                </span>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-[#F5F1E8]/60 uppercase block font-bold">Student ID</span>
                <span className="text-sm font-black text-[#F2C94C] bg-[#111417] px-3 py-1 rounded-xl border border-[#2A313C] inline-block">
                  {statusRecord.participant?.studentId}
                </span>
              </div>
            </div>

            {/* YOUR EVENTS SECTION (Locked 3 Divisions) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#2A313C]">
                <Trophy className="w-4 h-4 text-[#F2C94C]" />
                <h3 className="font-black text-white text-xs font-display uppercase tracking-wider">
                  YOUR EVENTS (3 DIVISIONS MANDATORY)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(statusRecord.events || (statusRecord.participant?.gender === 'female'
                  ? ['Girls Singles', 'Girls Doubles', 'Mixed Doubles']
                  : ['Boys Singles', 'Boys Doubles', 'Mixed Doubles'])
                ).map((evt) => (
                  <div
                    key={evt}
                    className="p-3.5 rounded-2xl bg-[#14171A] border border-emerald-500/20 flex items-center gap-2.5 text-xs font-mono"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-white font-bold">{evt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PARTNER STATUS SECTION (Dynamically Updated) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#2A313C]">
                <Shield className="w-4 h-4 text-[#F2C94C]" />
                <h3 className="font-black text-white text-xs font-display uppercase tracking-wider">
                  PARTNER STATUS
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doubles Partner Card */}
                <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-2">
                  <span className="text-[10px] text-[#F2C94C] font-mono uppercase font-bold tracking-wider block">
                    {statusRecord.participant?.gender === 'male' ? 'Boys Doubles Partner' : 'Girls Doubles Partner'}
                  </span>
                  <div className="text-sm font-bold text-white font-display">
                    {statusRecord.registration?.doublesPartnerName || 'Not nominated'}
                  </div>

                  <div>
                    {statusRecord.doublesValidation?.status === 'valid_paired' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#F2C94C]/15 text-[#F2C94C] px-3 py-1 rounded-full border border-[#F2C94C]/30 font-bold font-mono">
                        <Trophy className="w-3 h-3" /> Team Paired
                      </span>
                    ) : statusRecord.doublesValidation?.status === 'partner_registered' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Partner Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-mono">
                        <Clock className="w-3 h-3" /> Partner Not Registered
                      </span>
                    )}
                  </div>
                </div>

                {/* Mixed Doubles Partner Card */}
                <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-2">
                  <span className="text-[10px] text-[#F2C94C] font-mono uppercase font-bold tracking-wider block">
                    Mixed Doubles Partner
                  </span>
                  <div className="text-sm font-bold text-white font-display">
                    {statusRecord.registration?.mixedDoublesPartnerName || 'Not nominated'}
                  </div>

                  <div>
                    {statusRecord.mixedDoublesValidation?.status === 'valid_paired' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#F2C94C]/15 text-[#F2C94C] px-3 py-1 rounded-full border border-[#F2C94C]/30 font-bold font-mono">
                        <Trophy className="w-3 h-3" /> Team Paired
                      </span>
                    ) : statusRecord.mixedDoublesValidation?.status === 'partner_registered' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Partner Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30 font-mono">
                        <Clock className="w-3 h-3" /> Partner Not Registered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Read-Only Notice: Admin Override Only */}
            <div className="p-4 rounded-2xl bg-[#111417] border border-[#2A313C] flex items-start gap-3 text-xs font-mono text-[#F5F1E8]/70">
              <Lock className="w-4 h-4 text-[#F2C94C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-bold">Registration Locked:</strong>
                <span>
                  This registration is permanent and read-only. If any details or partner nominations contain an error, only tournament administrators can make corrections from the admin panel.
                </span>
              </div>
            </div>

            {/* Navigation actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#2A313C]">
              <button
                type="button"
                onClick={() => setStatusRecord(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#14171A] hover:bg-[#1E232A] border border-[#2A313C] text-xs font-bold text-[#F5F1E8] font-mono transition-colors cursor-pointer"
              >
                ← Back to Lookup
              </button>

              <Link
                href="/brackets"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full btn-gold text-xs font-black uppercase font-display tracking-wider text-center"
              >
                View Tournament Brackets →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LOOKUP STATUS TAB                                                      */}
      {/* ========================================================================= */}
      {!statusRecord && activeTab === 'lookup' && (
        <form
          onSubmit={handleLookupSubmit}
          className="arena-card p-6 sm:p-10 space-y-6 rounded-4xl border border-[#D4A94C]/30 bg-gradient-to-b from-[#1A1E24] to-[#111417]"
        >
          <div className="text-center space-y-2">
            <h3 className="font-black text-white text-xl font-display uppercase tracking-wide">
              Check Registration Status
            </h3>
            <p className="text-xs text-[#F5F1E8]/70 font-mono">
              Enter your Roll / Student ID to view your approved entry, locked events, and partner verification status.
            </p>
          </div>

          {lookupError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold font-mono">
              {lookupError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-[#F5F1E8]/80 font-bold block uppercase font-mono">
              Roll / Student ID
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={lookupStudentId}
                onChange={(e) => setLookupStudentId(e.target.value.toUpperCase())}
                placeholder="e.g. CS2026-042"
                className="w-full h-12 bg-[#14171A] px-4 text-xs font-mono text-white rounded-2xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C] uppercase tracking-wider"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={lookupLoading}
            className="w-full py-4 rounded-2xl btn-gold text-xs font-black shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 font-display uppercase tracking-wider"
          >
            <span>{lookupLoading ? 'Checking Records...' : 'Check Status →'}</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. NEW ATHLETE REGISTRATION FORM                                          */}
      {/* ========================================================================= */}
      {!statusRecord && activeTab === 'register' && (
        <form onSubmit={handleSubmit} className="arena-card p-6 sm:p-10 space-y-8 rounded-4xl border border-[#D4A94C]/30 bg-gradient-to-b from-[#1A1E24] to-[#111417]">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Student Athlete Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#2A313C]">
              <Users className="w-5 h-5 text-[#F2C94C]" />
              <h3 className="font-black text-white text-base font-display uppercase tracking-wide">
                1. Student Athlete Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
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
                  Roll / Student ID *
                </label>
                <input
                  type="text"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  placeholder="e.g. CS2026-042"
                  className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C] uppercase font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                  Department / Major *
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C]"
                />
              </div>
            </div>
          </div>

          {/* 2. Mandatory Events Notice */}
          <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] space-y-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-[#F2C94C] font-bold uppercase text-[11px]">
              <Trophy className="w-3.5 h-3.5" />
              <span>Mandatory 3-Event Participation</span>
            </div>
            <p className="text-[11px] text-[#F5F1E8]/70 leading-relaxed">
              Every registered athlete participates in all 3 divisions:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {(formData.gender === 'male'
                ? ['✓ Boys Singles', '✓ Boys Doubles', '✓ Mixed Doubles']
                : ['✓ Girls Singles', '✓ Girls Doubles', '✓ Mixed Doubles']
              ).map((evt) => (
                <div key={evt} className="p-2 rounded-xl bg-[#111417] text-white font-bold text-[11px] border border-[#2A313C]/60 text-center">
                  {evt}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Partner Nominations */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#2A313C]">
              <Shield className="w-5 h-5 text-[#F2C94C]" />
              <h3 className="font-black text-white text-base font-display uppercase tracking-wide">
                2. Partner Nominations
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-[#14171A] border border-[#2A313C] text-xs space-y-1 text-[#F5F1E8]/70 font-mono">
              <p className="font-bold text-white uppercase text-[11px]">Independent Partner Registration:</p>
              <p>
                Your nominated partner does NOT need to have registered yet. If they register later, the system will automatically match and verify your partnership.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                  {formData.gender === 'male' ? 'Boys Doubles Partner Full Name *' : 'Girls Doubles Partner Full Name *'}
                </label>
                <input
                  type="text"
                  name="doublesPartnerName"
                  required
                  value={formData.doublesPartnerName}
                  onChange={handleChange}
                  placeholder="e.g. Siddharth Rao"
                  className="w-full h-11 bg-[#14171A] px-4 text-xs text-white rounded-xl border border-[#2A313C] focus:outline-none focus:border-[#F2C94C]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#F5F1E8]/80 font-bold block mb-1.5 uppercase font-mono">
                  Mixed Doubles Partner Full Name *
                </label>
                <input
                  type="text"
                  name="mixedDoublesPartnerName"
                  required
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
