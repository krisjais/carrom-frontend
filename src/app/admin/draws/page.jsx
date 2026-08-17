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

function AdminDrawsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'boys_singles';

  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [bracketData, setBracketData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleGenerateDraw = async () => {
    if (N < 2) {
      alert(`At least 2 approved teams are required to generate a draw. Currently have ${N}.`);
      return;
    }

    if (bracketData?.isLocked) {
      alert('This draw is already locked and cannot be regenerated.');
      return;
    }

    if (!confirm(`Generate a random dynamic knockout draw for ${selectedCat.replace('_', ' ').toUpperCase()} with ${N} teams?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.generateCategoryDraw(selectedCat);
      if (res.success) {
        alert(res.message);
        fetchCategoryData();
      }
    } catch (err) {
      alert(err.message || 'Failed to generate draw.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishAndLock = async () => {
    if (!confirm(`Publish and LOCK the draw for ${selectedCat.replace('_', ' ').toUpperCase()}? Once locked, the draw cannot be regenerated.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await api.publishAndLockDraw(selectedCat);
      if (res.success) {
        alert(res.message);
        fetchCategoryData();
      }
    } catch (err) {
      alert(err.message || 'Failed to publish & lock draw.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1C2B48]">
        <div>
          <span className="text-xs font-mono text-[#D4AF37] font-bold uppercase tracking-widest">
            Knockout Draw Engine
          </span>
          <h1 className="text-3xl font-black font-display text-white mt-1">Dynamic Bracket Manager</h1>
          <p className="text-xs text-[#94A3B8]">
            Sequential pairing algorithm: Even entries produce 0 byes, Odd entries produce 1 bye per round.
          </p>
        </div>

        {/* Generate / Lock Action Buttons */}
        <div className="flex items-center gap-3">
          {!bracketData?.isLocked && (
            <button
              onClick={handleGenerateDraw}
              disabled={actionLoading || N < 2}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#070B16] font-bold text-xs shadow-md hover:bg-[#E5C358] disabled:opacity-50 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{actionLoading ? 'Generating...' : 'Generate Random Draw'}</span>
            </button>
          )}

          {bracketData?.rawMatches?.length > 0 && !bracketData?.isLocked && (
            <button
              onClick={handlePublishAndLock}
              disabled={actionLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Publish & Lock Draw</span>
            </button>
          )}

          {bracketData?.isLocked && (
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold font-mono">
              <Shield className="w-4 h-4" />
              <span>DRAW LOCKED & PUBLISHED</span>
            </div>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-[#1C2B48]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-display font-bold transition-all ${
                isSelected
                  ? 'bg-[#D4AF37] text-[#070B16] shadow-md'
                  : 'bg-[#0E1626] text-[#94A3B8] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Bracket Mathematical Calculation Overview Card */}
      <div className="sport-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryBadge category={selectedCat} />
            <h3 className="font-bold text-white text-base">
              Tournament Pairing Parameters ({N} Approved Entries)
            </h3>
          </div>
          <span className="text-xs font-mono text-[#94A3B8]">Sequential Pairing Rule</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Approved Entries (N)</span>
            <span className="text-xl font-black font-mono text-white">{N}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Round 1 Playable Matches</span>
            <span className="text-xl font-black font-mono text-[#D4AF37]">{r1Matches} Matches</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Round 1 Byes (N % 2)</span>
            <span className="text-xl font-black font-mono text-purple-400">{r1Byes} Bye</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#070B16] border border-[#1C2B48]">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Advancing to Round 2</span>
            <span className="text-xl font-black font-mono text-emerald-400">{r2Advancing} Entries</span>
          </div>
        </div>
      </div>

      {/* Interactive Bracket Viewer */}
      {loading ? (
        <div className="py-24 text-center text-[#94A3B8] text-sm flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-[#D4AF37]" />
          <span>Loading dynamic bracket...</span>
        </div>
      ) : (
        <BracketView
          rounds={bracketData?.rounds || []}
          category={selectedCat}
          isLocked={bracketData?.isLocked}
          isPublished={bracketData?.isPublished}
        />
      )}
    </div>
  );
}

export default function AdminDrawsPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-[#94A3B8] text-sm">Loading draw engine...</div>}>
      <AdminDrawsContent />
    </Suspense>
  );
}
