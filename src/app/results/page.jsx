'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, CheckCircle2, Crown } from 'lucide-react';
import { CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="eyebrow-label">
          Official Tournament Records
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Match Results
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Confirmed knockout outcomes and advancing winners from tournament matches on the Main Carrom Board.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#2A313C]">
        <button
          onClick={() => setSelectedCategory('')}
          className={`pill-tab ${selectedCategory === '' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
        >
          All Divisions
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`pill-tab ${selectedCategory === c.id ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Results Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#F5F1E8]/60 text-xs font-mono">Loading championship results...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center arena-card rounded-3xl space-y-3">
          <Trophy className="w-10 h-10 text-[#F2C94C] mx-auto opacity-70" />
          <p className="text-xs text-[#F5F1E8]/70 font-mono">No completed matches found in this division yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isT1Win = m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id);
            const isT2Win = m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id);

            return (
              <div key={m._id} className="arena-card arena-card-hover p-6 space-y-5 rounded-3xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#2A313C] text-[11px] font-mono">
                  <CategoryBadge category={m.category} />
                  <span className="text-[#F5F1E8]/70">{m.roundName} • M#{m.matchNumber}</span>
                </div>

                {/* Match Winner Summary */}
                <div className="grid grid-cols-3 items-center gap-2.5 text-center py-1">
                  <div className={`p-3 rounded-2xl border transition-all ${isT1Win ? 'bg-[#F2C94C]/20 border-[#F2C94C] text-white font-bold shadow-sm' : 'bg-[#14171A] border-[#2A313C] text-[#F5F1E8]/40'}`}>
                    <span className="text-xs truncate block font-bold">{m.team1?.name}</span>
                    {isT1Win && (
                      <span className="text-[10px] text-[#F2C94C] font-mono font-bold flex items-center justify-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-[#F2C94C]" />
                        <span>WINNER</span>
                      </span>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-mono font-black text-[#D4A94C] block">VS</span>
                    <span className="text-[9px] text-[#F5F1E8]/50 uppercase font-mono font-bold">Knockout</span>
                  </div>

                  <div className={`p-3 rounded-2xl border transition-all ${isT2Win ? 'bg-[#F2C94C]/20 border-[#F2C94C] text-white font-bold shadow-sm' : 'bg-[#14171A] border-[#2A313C] text-[#F5F1E8]/40'}`}>
                    <span className="text-xs truncate block font-bold">{m.team2?.name}</span>
                    {isT2Win && (
                      <span className="text-[10px] text-[#F2C94C] font-mono font-bold flex items-center justify-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-[#F2C94C]" />
                        <span>WINNER</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2A313C] flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-[#F5F1E8]/60">Main Carrom Board</span>
                  <span className="text-emerald-300 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{m.winnerTeam?.name || (isT1Win ? m.team1?.name : m.team2?.name)} Advanced</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
