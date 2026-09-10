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
import { CarromCoin } from '@/components/ui/CarromElements';

export default function RegistrationPage() {
  const [activeTab, setActiveTab] = useState('register'); // 'register' | 'lookup'

  // Registration Form State
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'male',
    department: '',
    participateSingles: true,
    participateDoubles: false,
    participateMixedDoubles: false,
    doublesPartnerName: '',
    mixedDoublesPartnerName: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lookup Form State
  const [lookupName, setLookupName] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState(null);

  // Active Status Record to View (from submission or lookup)
  const [statusRecord, setStatusRecord] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleToggleDivision = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getCombinationLabel = () => {
    const s = formData.participateSingles;
    const d = formData.participateDoubles;
    const m = formData.participateMixedDoubles;
    if (s && d && m) return 'Singles + Doubles + Mixed Doubles (All 3 Divisions)';
    if (s && d && !m) return 'Singles + Doubles';
    if (s && !d && m) return 'Singles + Mixed Doubles';
    if (!s && d && m) return 'Doubles + Mixed Doubles';
    if (s && !d && !m) return 'Singles Only (1 Division)';
    if (!s && d && !m) return 'Doubles Only (1 Division)';
    if (!s && !d && m) return 'Mixed Doubles Only (1 Division)';
    return 'None selected (Please select at least 1 division)';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.participateSingles && !formData.participateDoubles && !formData.participateMixedDoubles) {
      setError('Please select at least one division to participate in (Singles, Doubles, or Mixed Doubles).');
      return;
    }

    if (formData.participateDoubles && !formData.doublesPartnerName.trim()) {
      setError(`Please provide your ${formData.gender === 'male' ? 'Boys' : 'Girls'} Doubles partner name.`);
      return;
    }

    if (formData.participateMixedDoubles && !formData.mixedDoublesPartnerName.trim()) {
      setError('Please provide your Mixed Doubles partner name.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        doublesPartnerName: formData.participateDoubles ? formData.doublesPartnerName.trim() : '',
        mixedDoublesPartnerName: formData.participateMixedDoubles ? formData.mixedDoublesPartnerName.trim() : ''
      };

      const res = await api.submitRegistration(payload);
      if (res.success || res.code === 'REGISTRATION_PENDING') {
        // Fetch full lookup record to display live status
        const lookupRes = await api.lookupRegistration(formData.fullName);
        if (lookupRes.success) {
          setStatusRecord(lookupRes);
        } else {
          const events = [];
          if (formData.participateSingles) {
            events.push(formData.gender === 'male' ? 'Boys Singles' : 'Girls Singles');
          }
          if (formData.participateDoubles) {
            events.push(formData.gender === 'male' ? 'Boys Doubles' : 'Girls Doubles');
          }
          if (formData.participateMixedDoubles) {
            events.push('Mixed Doubles');
          }

          setStatusRecord({
            participant: res.participant,
            registration: res.registration,
            events,
            doublesValidation: formData.participateDoubles
              ? { status: 'partner_not_registered', requestedName: formData.doublesPartnerName }
              : { status: 'not_participating', message: 'Not participating in Doubles' },
            mixedDoublesValidation: formData.participateMixedDoubles
              ? { status: 'partner_not_registered', requestedName: formData.mixedDoublesPartnerName }
              : { status: 'not_participating', message: 'Not participating in Mixed Doubles' }
          });
        }
      }
    } catch (err) {
      if (err.data?.code === 'REGISTRATION_LOCKED' || err.data?.code === 'DUPLICATE_REGISTRATION' || err.data?.code === 'DUPLICATE_STUDENT_ID') {
        // Automatically fetch and show the locked registration
        try {
          const lookupRes = await api.lookupRegistration(formData.fullName);
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
    if (!lookupName.trim()) return;

    setLookupError(null);
    setLookupLoading(true);

    try {
      const res = await api.lookupRegistration(lookupName.trim());
      if (res.success) {
        setStatusRecord(res);
      }
    } catch (err) {
      setLookupError(err.message || `No registration found for "${lookupName.trim()}".`);
      setStatusRecord(null);
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center space-y-2">
        <span className="eyebrow-label">
          OFFICIAL ATHLETE ENTRY
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Tournament Registration
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal max-w-lg mx-auto">
          Collegiate championship entry: Singles, Doubles, and Mixed Doubles (Girls Doubles optional).
        </p>
      </div>

      {/* Mode Switcher */}
      {!statusRecord && (
        <div className="flex items-center justify-center p-1 rounded-full bg-[#F4EFE6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] max-w-sm mx-auto shadow-inner">
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] shadow-xs'
                : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#4A4238] dark:hover:text-[#F5F1E8]'
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
            className={`flex-1 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] shadow-xs'
                : 'text-[#7E7060] dark:text-[#817B72] hover:text-[#4A4238] dark:hover:text-[#F5F1E8]'
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
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Status Header Banner */}
          {statusRecord.registration?.status === 'approved' ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto mb-2 border border-emerald-300 dark:border-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <span className="eyebrow-label text-emerald-800 dark:text-emerald-400">
                LOCKED REGISTRATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-emerald-900 dark:text-emerald-200">
                Registration Approved
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-md mx-auto">
                Your tournament registration has been approved by the organizing committee.
              </p>
            </div>
          ) : statusRecord.registration?.status === 'rejected' ? (
            <div className="p-6 sm:p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center mx-auto mb-2 border border-rose-300 dark:border-rose-700">
                <XCircle className="w-6 h-6" />
              </div>
              <span className="eyebrow-label text-rose-700 dark:text-rose-400">
                ENTRY REJECTED
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-rose-900 dark:text-rose-200">
                Registration Rejected
              </h2>
              <p className="text-xs text-rose-800 dark:text-rose-300 max-w-md mx-auto">
                {statusRecord.registration?.adminNotes || 'Please contact tournament administrators for clarification.'}
              </p>
            </div>
          ) : (
            <div className="p-6 sm:p-8 rounded-2xl bg-[#F4EFE6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-[#15191C] text-[#B8A47E] dark:text-[#D4A94C] flex items-center justify-center mx-auto mb-2 border border-[#D5C4A1] dark:border-[#2B3034]">
                <Clock className="w-6 h-6" />
              </div>
              <span className="eyebrow-label text-[#7E7060] dark:text-[#B8B1A5]">
                UNDER REVIEW
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                Pending Approval
              </h2>
              <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] max-w-md mx-auto">
                Your tournament registration has been submitted and is awaiting committee verification.
              </p>
            </div>
          )}

          {/* Details Card */}
          <div className="editorial-card p-6 sm:p-8 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517] space-y-6">
            {/* Athlete Profile Information */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-sans uppercase block font-bold">Athlete</span>
                <span className="text-lg font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
                  {statusRecord.participant?.fullName}
                </span>
                <span className="text-xs text-[#7E7060] dark:text-[#B8B1A5] block capitalize">
                  {statusRecord.participant?.gender} Athlete • {statusRecord.participant?.department}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] uppercase block font-bold font-mono">Department</span>
                <span className="text-sm font-bold text-[#3E342B] dark:text-[#F5F1E8] bg-white dark:bg-[#15191C] px-3 py-1 rounded-lg border border-[#E8E1D5] dark:border-[#2B3034] inline-block font-mono">
                  {statusRecord.participant?.department}
                </span>
              </div>
            </div>

            {/* YOUR EVENTS SECTION */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                <Trophy className="w-4 h-4 text-[#E74C3C]" />
                <h3 className="font-serif font-bold text-xs text-[#3E342B] dark:text-[#F5F1E8] uppercase tracking-wider">
                  ENROLLED CHAMPIONSHIP EVENTS
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(statusRecord.events || (statusRecord.participant?.gender === 'female'
                  ? (statusRecord.registration?.doublesPartnerName ? ['Girls Singles', 'Girls Doubles', 'Mixed Doubles'] : ['Girls Singles', 'Mixed Doubles'])
                  : ['Boys Singles', 'Boys Doubles', 'Mixed Doubles'])
                ).map((evt) => (
                  <div
                    key={evt}
                    className="p-3.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2.5 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">{evt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PARTNER STATUS SECTION (Dynamically Updated) */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                <Shield className="w-4 h-4 text-[#4A4238] dark:text-[#D4A94C]" />
                <h3 className="font-serif font-bold text-xs text-[#3E342B] dark:text-[#F5F1E8] uppercase tracking-wider">
                  PARTNER NOMINATION & VALIDATION
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Doubles Partner Card */}
                <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2">
                  <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-sans uppercase font-bold tracking-wider block">
                    {statusRecord.participant?.gender === 'male' ? 'Boys Doubles Partner' : 'Girls Doubles Partner'}
                  </span>
                  <div className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                    {statusRecord.registration?.participateDoubles === false || statusRecord.doublesValidation?.status === 'not_participating'
                      ? 'Not Enrolled in Doubles'
                      : statusRecord.registration?.doublesPartnerName || 'Not nominated'}
                  </div>

                  <div>
                    {statusRecord.registration?.participateDoubles === false || statusRecord.doublesValidation?.status === 'not_participating' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-white dark:bg-[#15191C] text-[#7E7060] dark:text-[#817B72] px-3 py-1 rounded-full border border-[#E8E1D5] dark:border-[#2B3034] font-mono">
                        <Info className="w-3 h-3 text-[#B8A47E]" /> Optional — Not Enrolled
                      </span>
                    ) : statusRecord.doublesValidation?.status === 'valid_paired' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] px-3 py-1 rounded-full border border-[#D5C4A1] dark:border-[rgba(212,169,76,0.3)] font-bold font-mono">
                        <Trophy className="w-3 h-3 text-[#E74C3C]" /> Team Paired
                      </span>
                    ) : statusRecord.doublesValidation?.status === 'partner_registered' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Partner Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-white dark:bg-[#15191C] text-[#7E7060] dark:text-[#817B72] px-3 py-1 rounded-full border border-[#E8E1D5] dark:border-[#2B3034] font-mono">
                        <Clock className="w-3 h-3 text-[#B8A47E]" /> Partner Not Registered Yet
                      </span>
                    )}
                  </div>
                </div>

                {/* Mixed Doubles Partner Card */}
                <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2">
                  <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-sans uppercase font-bold tracking-wider block">
                    Mixed Doubles Partner
                  </span>
                  <div className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                    {statusRecord.registration?.participateMixedDoubles === false || statusRecord.mixedDoublesValidation?.status === 'not_participating'
                      ? 'Not Enrolled in Mixed Doubles'
                      : statusRecord.registration?.mixedDoublesPartnerName || 'Not nominated'}
                  </div>

                  <div>
                    {statusRecord.registration?.participateMixedDoubles === false || statusRecord.mixedDoublesValidation?.status === 'not_participating' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-white dark:bg-[#15191C] text-[#7E7060] dark:text-[#817B72] px-3 py-1 rounded-full border border-[#E8E1D5] dark:border-[#2B3034] font-mono">
                        <Info className="w-3 h-3 text-[#B8A47E]" /> Optional — Not Enrolled
                      </span>
                    ) : statusRecord.mixedDoublesValidation?.status === 'valid_paired' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-white dark:bg-[#15191C] text-[#3E342B] dark:text-[#F5F1E8] px-3 py-1 rounded-full border border-[#D5C4A1] dark:border-[rgba(212,169,76,0.3)] font-bold font-mono">
                        <Trophy className="w-3 h-3 text-[#E74C3C]" /> Team Paired
                      </span>
                    ) : statusRecord.mixedDoublesValidation?.status === 'partner_registered' ? (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-bold font-mono">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Partner Registered
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] bg-white dark:bg-[#15191C] text-[#7E7060] dark:text-[#817B72] px-3 py-1 rounded-full border border-[#E8E1D5] dark:border-[#2B3034] font-mono">
                        <Clock className="w-3 h-3 text-[#B8A47E]" /> Partner Not Registered Yet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Read-Only Notice: Admin Override Only */}
            <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] flex items-start gap-3 text-xs text-[#7E7060] dark:text-[#B8B1A5]">
              <Lock className="w-4 h-4 text-[#4A4238] dark:text-[#D4A94C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#3E342B] dark:text-[#F5F1E8] block font-bold">Registration Locked:</strong>
                <span>
                  This registration record is locked. If any details or partner nominations contain an error, only tournament administrators can make corrections from the control room.
                </span>
              </div>
            </div>

            {/* Navigation actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E8E1D5] dark:border-[#2B3034]">
              <button
                type="button"
                onClick={() => setStatusRecord(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white dark:bg-[#15191C] hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-bold text-[#4A4238] dark:text-[#F5F1E8] transition-colors cursor-pointer"
              >
                ← Back to Lookup
              </button>

              <Link
                href="/brackets"
                className="w-full sm:w-auto btn-primary text-xs font-bold text-center"
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
          className="editorial-card p-6 sm:p-10 space-y-6 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517] shadow-sm"
        >
          <div className="text-center space-y-2">
            <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-xl tracking-tight">
              Check Registration Status
            </h3>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
              Enter your Full Legal Name to view your approved entry, locked events, and partner verification status.
            </p>
          </div>

          {lookupError && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold">
              {lookupError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-[#4A4238] dark:text-[#F5F1E8] font-bold block uppercase font-mono">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={lookupName}
              onChange={(e) => setLookupName(e.target.value)}
              placeholder="e.g. Aryan Sharma"
              className="w-full h-12 bg-[#FAF9F6] dark:bg-[#181C1F] px-4 text-xs font-medium text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#D5C4A1] dark:border-[#2B3034] focus:outline-none focus:border-[#4A4238] dark:focus:border-[#D4A94C] tracking-wide"
            />
          </div>

          <button
            type="submit"
            disabled={lookupLoading}
            className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 uppercase tracking-wider"
          >
            <span>{lookupLoading ? 'Checking Records...' : 'Check Status →'}</span>
          </button>
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. NEW ATHLETE REGISTRATION FORM                                          */}
      {/* ========================================================================= */}
      {!statusRecord && activeTab === 'register' && (
        <form onSubmit={handleSubmit} className="editorial-card p-6 sm:p-10 space-y-8 rounded-2xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517] shadow-sm">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Athlete Information */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
              <Users className="w-5 h-5 text-[#4A4238] dark:text-[#D4A94C]" />
              <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base">
                1. Athlete Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs text-[#4A4238] dark:text-[#F5F1E8] font-bold block mb-1.5 uppercase font-mono">
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aryan Sharma"
                  className="w-full h-11 bg-[#FAF9F6] dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#E8E1D5] dark:border-[#2B3034] focus:outline-none focus:border-[#4A4238] dark:focus:border-[#D4A94C]"
                />
              </div>

              <div>
                <label className="text-xs text-[#4A4238] dark:text-[#F5F1E8] font-bold block mb-1.5 uppercase font-mono">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full h-11 bg-[#FAF9F6] dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#E8E1D5] dark:border-[#2B3034] focus:outline-none focus:border-[#4A4238] dark:focus:border-[#D4A94C]"
                >
                  <option value="male">Male (Boys Singles, Boys Doubles, Mixed)</option>
                  <option value="female">Female (Girls Singles, Girls Doubles, Mixed)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-[#4A4238] dark:text-[#F5F1E8] font-bold block mb-1.5 uppercase font-mono">
                  Department / Major *
                </label>
                <input
                  type="text"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full h-11 bg-[#FAF9F6] dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#E8E1D5] dark:border-[#2B3034] focus:outline-none focus:border-[#4A4238] dark:focus:border-[#D4A94C]"
                />
              </div>
            </div>
          </div>

          {/* 2. Division Selection (Participation is Completely Optional) */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#E74C3C]" />
                <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base">
                  2. Select Divisions (Optional Participation)
                </h3>
              </div>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#F4EFE6] dark:bg-[#181C1F] text-[#4A4238] dark:text-[#D5C4A1] border border-[#D5C4A1] dark:border-[#2B3034] font-bold">
                {getCombinationLabel()}
              </span>
            </div>

            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
              Participation in each division is completely <strong>OPTIONAL</strong>. You can choose 1, 2, or all 3 divisions. If you enter Doubles or Mixed Doubles, you must nominate your own partner.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Singles Division Option */}
              <div
                onClick={() => handleToggleDivision('participateSingles')}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 select-none ${
                  formData.participateSingles
                    ? 'bg-white dark:bg-[#181C1F] border-emerald-500 dark:border-emerald-500/80 shadow-xs'
                    : 'bg-[#FAF9F6] dark:bg-[#121517] border-[#E8E1D5] dark:border-[#2B3034] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#7E7060] dark:text-[#817B72]">
                    1 Player
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.participateSingles}
                    onChange={() => {}} // handled by parent div onClick
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                  />
                </div>
                <div className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                  {formData.gender === 'male' ? 'Boys Singles' : 'Girls Singles'}
                </div>
                <p className="text-[11px] text-[#7E7060] dark:text-[#B8B1A5] leading-tight">
                  Individual knockout championship. No partner needed.
                </p>
              </div>

              {/* Doubles Division Option */}
              <div
                onClick={() => handleToggleDivision('participateDoubles')}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 select-none ${
                  formData.participateDoubles
                    ? 'bg-white dark:bg-[#181C1F] border-emerald-500 dark:border-emerald-500/80 shadow-xs'
                    : 'bg-[#FAF9F6] dark:bg-[#121517] border-[#E8E1D5] dark:border-[#2B3034] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#7E7060] dark:text-[#817B72]">
                    2 Players (Same Gender)
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.participateDoubles}
                    onChange={() => {}} // handled by parent div onClick
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                  />
                </div>
                <div className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                  {formData.gender === 'male' ? 'Boys Doubles' : 'Girls Doubles'}
                </div>
                <p className="text-[11px] text-[#7E7060] dark:text-[#B8B1A5] leading-tight">
                  Requires your own {formData.gender === 'male' ? 'male' : 'female'} partner.
                </p>
              </div>

              {/* Mixed Doubles Division Option */}
              <div
                onClick={() => handleToggleDivision('participateMixedDoubles')}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 select-none ${
                  formData.participateMixedDoubles
                    ? 'bg-white dark:bg-[#181C1F] border-emerald-500 dark:border-emerald-500/80 shadow-xs'
                    : 'bg-[#FAF9F6] dark:bg-[#121517] border-[#E8E1D5] dark:border-[#2B3034] opacity-75 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#7E7060] dark:text-[#817B72]">
                    1 Male + 1 Female
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.participateMixedDoubles}
                    onChange={() => {}} // handled by parent div onClick
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                  />
                </div>
                <div className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                  Mixed Doubles
                </div>
                <p className="text-[11px] text-[#7E7060] dark:text-[#B8B1A5] leading-tight">
                  Requires your own partner of opposite gender ({formData.gender === 'male' ? 'Female' : 'Male'}).
                </p>
              </div>
            </div>
          </div>

          {/* 3. Partner Nominations (Conditional) */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
              <Shield className="w-5 h-5 text-[#4A4238] dark:text-[#D4A94C]" />
              <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base">
                3. Partner Nominations
              </h3>
            </div>

            {/* If neither Doubles nor Mixed Doubles is checked */}
            {!formData.participateDoubles && !formData.participateMixedDoubles ? (
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1 text-emerald-900 dark:text-emerald-300">
                <p className="font-bold uppercase text-[11px] font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Singles Only Selected
                </p>
                <p>
                  No partner nomination required. You will compete individually, and only opponents will be randomized during the tournament draw.
                </p>
              </div>
            ) : (
              <>
                <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-xs space-y-1 text-[#7E7060] dark:text-[#B8B1A5]">
                  <p className="font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase text-[11px] font-mono">Independent Partner Matching:</p>
                  <p>
                    Partners are always chosen by the players (never randomly assigned). Your nominated partner can register before or after you; the system will verify and pair your team automatically.
                  </p>
                </div>

                <div className="space-y-4">
                  {formData.participateDoubles && (
                    <div>
                      <label className="text-[11px] text-[#4A4238] dark:text-[#F5F1E8] font-bold block mb-1.5 uppercase font-mono">
                        {formData.gender === 'male' ? 'Boys Doubles Partner Full Name *' : 'Girls Doubles Partner Full Name *'}
                      </label>
                      <input
                        type="text"
                        name="doublesPartnerName"
                        required
                        value={formData.doublesPartnerName}
                        onChange={handleChange}
                        placeholder={formData.gender === 'male' ? 'e.g. Siddharth Rao (Male)' : 'e.g. Priya Nair (Female)'}
                        className="w-full h-11 bg-[#FAF9F6] dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#E8E1D5] dark:border-[#2B3034] focus:outline-none focus:border-[#4A4238] dark:focus:border-[#D4A94C]"
                      />
                    </div>
                  )}

                  {formData.participateMixedDoubles && (
                    <div>
                      <label className="text-[11px] text-[#4A4238] dark:text-[#F5F1E8] font-bold block mb-1.5 uppercase font-mono">
                        Mixed Doubles Partner Full Name *
                      </label>
                      <input
                        type="text"
                        name="mixedDoublesPartnerName"
                        required
                        value={formData.mixedDoublesPartnerName}
                        onChange={handleChange}
                        placeholder={formData.gender === 'male' ? 'e.g. Ananya Patel (Female)' : 'e.g. Siddharth Rao (Male)'}
                        className="w-full h-11 bg-[#FAF9F6] dark:bg-[#181C1F] px-4 text-xs text-[#3E342B] dark:text-[#F5F1E8] rounded-xl border border-[#E8E1D5] dark:border-[#2B3034] focus:outline-none focus:border-[#4A4238] dark:focus:border-[#D4A94C]"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034]">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl btn-primary text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 uppercase tracking-wider"
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


