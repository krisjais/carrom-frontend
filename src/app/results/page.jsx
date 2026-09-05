'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, CheckCircle2, Crown, Award } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { CategoryCoinPair } from '@/components/ui/CarromElements';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 text-[#171614] dark:text-[#F7F4EC]">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#857B6C] font-semibold block">
          OFFICIAL TOURNAMENT ARCHIVE
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#171614] dark:text-[#F7F4EC]">
          Match Results
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6A60] dark:text-[#A8A194] leading-relaxed">
          Confirmed knockout outcomes, verified victor scorecards, and advancing entries from Main Carrom Board.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-4 border-b border-[#DCD6C8] dark:border-[#2E2B25]">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            selectedCategory === ''
              ? 'bg-[#171614] text-[#F7F4EC] dark:bg-[#F7F4EC] dark:text-[#171614] shadow-xs'
              : 'bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#38342C] text-[#6F6A60] dark:text-[#A8A194] hover:text-[#171614] dark:hover:text-[#F7F4EC]'
          }`}
        >
          All Divisions
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === c.id
                ? 'bg-[#171614] text-[#F7F4EC] dark:bg-[#F7F4EC] dark:text-[#171614] shadow-xs'
                : 'bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#38342C] text-[#6F6A60] dark:text-[#A8A194] hover:text-[#171614] dark:hover:text-[#F7F4EC]'
            }`}
          >
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Results Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-[#857B6C] flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-full border-2 border-[#171614] border-t-transparent animate-spin" />
          <span>Retrieving official score records...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-3">
          <Trophy className="w-10 h-10 text-[#857B6C] mx-auto opacity-60" />
          <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] font-mono">
            No completed matches recorded in this division yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isT1Win = m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id);
            const isT2Win = m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id);

            return (
              <div
                key={m._id}
                className="rounded-3xl p-6 space-y-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs hover:border-[#171614] dark:hover:border-[#C2A268] transition-colors"
              >
                {/* Match Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#DCD6C8]/80 dark:border-[#38342C] text-[11px] font-mono">
                  <CategoryBadge category={m.category} />
                  <span className="text-[#857B6C] font-semibold">{m.roundName} · M#{m.matchNumber}</span>
                </div>

                {/* Matchup & Winner Highlight */}
                <div className="grid grid-cols-11 items-center gap-2 text-center py-2">
                  <div
                    className={`col-span-5 p-3 rounded-2xl border transition-all text-left ${
                      isT1Win
                        ? 'bg-white dark:bg-[#24221E] border-[#171614] dark:border-[#C2A268] shadow-sm'
                        : 'bg-white/40 dark:bg-white/5 border-transparent opacity-60'
                    }`}
                  >
                    <span className="text-xs truncate block font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">
                      {m.team1?.name}
                    </span>
                    {isT1Win && (
                      <span className="text-[10px] text-[#C2A268] font-mono font-bold flex items-center gap-1 mt-1">
                        <Crown className="w-3 h-3 text-[#C2A268]" />
                        <span>WINNER</span>
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 text-center font-serif italic text-xs text-[#857B6C]">
                    vs
                  </div>

                  <div
                    className={`col-span-5 p-3 rounded-2xl border transition-all text-right ${
                      isT2Win
                        ? 'bg-white dark:bg-[#24221E] border-[#171614] dark:border-[#C2A268] shadow-sm'
                        : 'bg-white/40 dark:bg-white/5 border-transparent opacity-60'
                    }`}
                  >
                    <span className="text-xs truncate block font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">
                      {m.team2?.name}
                    </span>
                    {isT2Win && (
                      <span className="text-[10px] text-[#C2A268] font-mono font-bold flex items-center justify-end gap-1 mt-1">
                        <Crown className="w-3 h-3 text-[#C2A268]" />
                        <span>WINNER</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer status */}
                <div className="pt-3 border-t border-[#DCD6C8]/80 dark:border-[#38342C] flex items-center justify-between text-xs font-mono">
                  <span className="text-[#857B6C] text-[11px]">Main Carrom Board</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Advanced to Next Round</span>
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
