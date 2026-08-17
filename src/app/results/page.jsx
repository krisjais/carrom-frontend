'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, CheckCircle2 } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

export default function ResultsPage() {
  const [matches, setMatches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = { status: 'completed' };
        if (selectedCategory) params.category = selectedCategory;
        const res = await api.getMatches(params);
        if (res.success) setMatches(res.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Match Results
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Official confirmed outcomes and board scores from completed tournament matches.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#1C2B48]">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === ''
              ? 'bg-[#D4AF37] text-[#070B16]'
              : 'bg-[#0E1626] text-[#94A3B8] hover:text-white'
          }`}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === c.id
                ? 'bg-[#D4AF37] text-[#070B16]'
                : 'bg-[#0E1626] text-[#94A3B8] hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Results Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#94A3B8] text-xs">Loading results...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center sport-card">
          <Trophy className="w-8 h-8 text-[#64748B] mx-auto mb-2" />
          <p className="text-xs text-[#94A3B8]">No completed matches found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => {
            const isT1Win = m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id);
            const isT2Win = m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id);

            return (
              <div key={m._id} className="sport-card p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#1C2B48] text-[11px]">
                  <CategoryBadge category={m.category} />
                  <span className="font-mono text-[#94A3B8]">{m.roundName} • M#{m.matchNumber}</span>
                </div>

                {/* Match Winner Summary */}
                <div className="grid grid-cols-3 items-center gap-2 text-center">
                  <div className={`p-2 rounded-lg ${isT1Win ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-slate-300'}`}>
                    <span className="text-xs truncate block">{m.team1?.name}</span>
                    {isT1Win && <span className="text-[9px] text-[#D4AF37] font-bold block">WON</span>}
                  </div>

                  <div>
                    <div className="font-mono text-xl font-black text-[#D4AF37]">
                      {m.finalScore?.team1BoardsWon} - {m.finalScore?.team2BoardsWon}
                    </div>
                    <span className="text-[9px] text-[#64748B] uppercase">Best of 3</span>
                  </div>

                  <div className={`p-2 rounded-lg ${isT2Win ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold' : 'text-slate-300'}`}>
                    <span className="text-xs truncate block">{m.team2?.name}</span>
                    {isT2Win && <span className="text-[9px] text-[#D4AF37] font-bold block">WON</span>}
                  </div>
                </div>

                {/* Board Breakdown */}
                <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-around text-xs text-[#94A3B8]">
                  {m.boards.map((b) => (
                    <div key={b.boardNumber} className="text-center font-mono">
                      <span className="text-[10px] text-[#64748B] block">B{b.boardNumber}</span>
                      <span className="text-white text-xs font-semibold">{b.team1Score}-{b.team2Score}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
