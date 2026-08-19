'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, CheckCircle2, Crown } from 'lucide-react';
import { CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';
import { CarromCoin } from '@/components/ui/CarromElements';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          OFFICIAL TOURNAMENT RECORDS
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Match Results
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Confirmed knockout outcomes and advancing winners from tournament matches on the Main Carrom Board.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <button
          onClick={() => setSelectedCategory('')}
          className={`pill-tab cursor-pointer ${selectedCategory === '' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
        >
          All Divisions
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`pill-tab cursor-pointer ${selectedCategory === c.id ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Results Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#7E7060] dark:text-[#B8B1A5] text-xs font-mono">Loading championship results...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center editorial-card bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] rounded-2xl space-y-3">
          <Trophy className="w-10 h-10 text-[#7E7060] dark:text-[#817B72] mx-auto opacity-70" />
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">No completed matches recorded in this division yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isT1Win = m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id);
            const isT2Win = m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id);

            return (
              <div key={m._id} className="editorial-card p-6 space-y-5 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034] text-[11px] font-mono">
                  <CategoryBadge category={m.category} />
                  <span className="text-[#7E7060] dark:text-[#B8B1A5]">{m.roundName} • M#{m.matchNumber}</span>
                </div>

                {/* Match Winner Summary */}
                <div className="grid grid-cols-3 items-center gap-2.5 text-center py-1">
                  <div className={`p-3 rounded-xl border transition-all ${isT1Win ? 'bg-[#FAF9F6] dark:bg-[#1B2024] border-[#3E342B] dark:border-[rgba(212,169,76,0.4)] text-[#3E342B] dark:text-[#F5F1E8] font-bold shadow-xs' : 'bg-white dark:bg-[#121517] border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060]/70 dark:text-[#817B72]'}`}>
                    <span className="text-xs truncate block font-serif font-bold">{m.team1?.name}</span>
                    {isT1Win && (
                      <span className="text-[10px] text-[#E74C3C] dark:text-[#D4A94C] font-mono font-bold flex items-center justify-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-[#E74C3C] dark:text-[#D4A94C]" />
                        <span>WINNER</span>
                      </span>
                    )}
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-mono font-bold text-[#7E7060] dark:text-[#817B72] block">VS</span>
                    <span className="text-[9px] text-[#7E7060] dark:text-[#817B72] uppercase font-mono">Knockout</span>
                  </div>

                  <div className={`p-3 rounded-xl border transition-all ${isT2Win ? 'bg-[#FAF9F6] dark:bg-[#1B2024] border-[#3E342B] dark:border-[rgba(212,169,76,0.4)] text-[#3E342B] dark:text-[#F5F1E8] font-bold shadow-xs' : 'bg-white dark:bg-[#121517] border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060]/70 dark:text-[#817B72]'}`}>
                    <span className="text-xs truncate block font-serif font-bold">{m.team2?.name}</span>
                    {isT2Win && (
                      <span className="text-[10px] text-[#E74C3C] dark:text-[#D4A94C] font-mono font-bold flex items-center justify-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-[#E74C3C] dark:text-[#D4A94C]" />
                        <span>WINNER</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-[#7E7060] dark:text-[#B8B1A5]">Main Carrom Board</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
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


