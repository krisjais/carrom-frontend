'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { BracketView } from '@/components/bracket/BracketView';
import {
  GitFork,
  Shield,
  Sparkles,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

function AdminDrawsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'boys_singles';

  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [bracketData, setBracketData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // In-app Modals
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    action: null
  });

  const fetchCategoryData = async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        api.getBracketTree(selectedCat),
        api.getTeams(selectedCat)
      ]);
      if (bRes.success) setBracketData(bRes);
      if (tRes.success) setTeams(tRes.teams || []);
    } catch (err) {
      console.error(err);
      setBracketData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [selectedCat]);

  const N = teams.length;
  const r1Matches = N >= 2 ? Math.floor(N / 2) : 0;
  const r1Byes = N >= 2 ? N % 2 : 0;
  const r2Advancing = N >= 2 ? r1Matches + r1Byes : 0;

  const handleGenerateDraw = () => {
    if (N < 2) {
      setFeedbackMessage({
        type: 'error',
        text: `At least 2 approved teams are required to generate a draw. Currently have ${N}.`
      });
      return;
    }

    if (bracketData?.isLocked) {
      setFeedbackMessage({
        type: 'error',
        text: 'This draw is already locked and cannot be regenerated.'
      });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Generate Random Draw?',
      message: `This will randomly shuffle all ${N} approved entries in ${selectedCat.replace('_', ' ').toUpperCase()} and create the single-elimination tournament matchups.`,
      confirmText: 'Generate Draw',
      action: async () => {
        setActionLoading(true);
        try {
          const res = await api.generateCategoryDraw(selectedCat);
          if (res.success) {
            setFeedbackMessage({ type: 'success', text: res.message });
            fetchCategoryData();
          }
        } catch (err) {
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to generate draw.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handlePublishAndLock = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Publish & Lock Draw?',
      message: `Lock the draw for ${selectedCat.replace('_', ' ').toUpperCase()}? Once locked, the tournament draw cannot be regenerated.`,
      confirmText: 'Lock & Publish',
      action: async () => {
        setActionLoading(true);
        try {
          const res = await api.publishAndLockDraw(selectedCat);
          if (res.success) {
            setFeedbackMessage({ type: 'success', text: res.message });
            fetchCategoryData();
          }
        } catch (err) {
          setFeedbackMessage({ type: 'error', text: err.message || 'Failed to lock draw.' });
        } finally {
          setActionLoading(false);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono'
          }`}
        >
          <span>{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold px-2 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
        <div>
          <span className="eyebrow-label">
            KNOCKOUT DRAW ENGINE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1 tracking-wide">Dynamic Bracket Manager</h1>
          <p className="text-xs text-[#D4DEEE] mt-1">
            Single-game knockout tournament bracket. Winners advance automatically to the next round as each match is played.
          </p>
        </div>

        {/* Generate / Lock Action Buttons */}
        <div className="flex items-center gap-3">
          {!bracketData?.isLocked && (
            <button
              onClick={handleGenerateDraw}
              disabled={actionLoading || N < 2}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#FFD691] hover:bg-[#FFE2AA] text-[#1E3258] font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 font-display uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              <span>{actionLoading ? 'Generating...' : 'Generate Random Draw'}</span>
            </button>
          )}

          {bracketData?.rawMatches?.length > 0 && !bracketData?.isLocked && (
            <button
              onClick={handlePublishAndLock}
              disabled={actionLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer font-display uppercase tracking-wider"
            >
              <Lock className="w-4 h-4" />
              <span>Publish & Lock Draw</span>
            </button>
          )}

          {bracketData?.isLocked && (
            <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFD691]/15 border border-[#D7A859]/50 text-[#FFD691] text-xs font-bold font-mono">
              <Shield className="w-4 h-4" />
              <span>DRAW LOCKED & PUBLISHED</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#35538C]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`pill-tab ${isSelected ? 'pill-tab-active' : 'pill-tab-inactive'}`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Pairing Summary Parameters */}
      <div className="sport-card p-6 space-y-4 rounded-3xl border border-[#35538C]">
        <div className="flex items-center justify-between text-xs pb-3 border-b border-[#35538C]">
          <div className="flex items-center gap-2.5">
            <CategoryBadge category={selectedCat} />
            <span className="font-bold text-white font-display text-sm">Tournament Pairing Parameters ({N} Approved Entries)</span>
          </div>
          <span className="font-mono text-[#FFD691] text-xs font-bold">Single-Elimination Knockout</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[11px] text-[#D4DEEE] block uppercase">Approved Entries (N)</span>
            <span className="font-black text-white text-xl">{N}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[11px] text-[#D4DEEE] block uppercase">Round 1 Matches</span>
            <span className="font-black text-[#FFD691] text-xl">{r1Matches} Matches</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[11px] text-[#D4DEEE] block uppercase">Round 1 Byes (N % 2)</span>
            <span className="font-black text-[#D7A859] text-xl">{r1Byes} Bye</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#152442] border border-[#35538C]">
            <span className="text-[11px] text-[#D4DEEE] block uppercase">Advancing to Round 2</span>
            <span className="font-black text-emerald-300 text-xl">{r2Advancing} Entries</span>
          </div>
        </div>
      </div>

      {/* Bracket Tree View */}
      {loading ? (
        <div className="py-20 text-center text-[#D4DEEE] text-xs font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FFD691]" />
          <span>Loading bracket tree...</span>
        </div>
      ) : (
        <BracketView
          rounds={bracketData?.rounds || []}
          category={selectedCat}
          isLocked={bracketData?.isLocked}
          isPublished={bracketData?.isPublished}
        />
      )}

      {/* In-App Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        maxWidth="max-w-md"
      >
        <div className="space-y-4 py-1">
          <p className="text-xs text-slate-200 leading-relaxed">
            {confirmModal.message}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#35538C]">
            <button
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#D4DEEE] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmModal.action}
              disabled={actionLoading}
              className="px-6 py-2.5 rounded-full bg-[#FFD691] text-[#1E3258] font-black text-xs shadow-lg transition-all cursor-pointer font-display uppercase tracking-wider hover:bg-[#FFE2AA]"
            >
              {actionLoading ? 'Processing...' : confirmModal.confirmText}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function AdminDrawsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-[#D4DEEE] text-xs font-mono">Loading admin draws...</div>}>
      <AdminDrawsContent />
    </Suspense>
  );
}
