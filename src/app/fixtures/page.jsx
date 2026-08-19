'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Calendar, Clock, RefreshCw, Trophy, ArrowRight, Crown } from 'lucide-react';
import { StatusBadge, MainBoardBadge, CategoryBadge } from '@/components/ui/Badge';
import { CarromCoin } from '@/components/ui/CarromElements';

export default function FixturesPage() {
  const [matches, setMatches] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCat) params.category = selectedCat;
        const res = await api.getMatches(params);
        if (res.success) setMatches(res.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFixtures();
  }, [selectedCat]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          SEQUENTIAL ARENA SCHEDULE
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Match Fixtures
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Sequential timeline of scheduled and completed fixtures on the Main Carrom Board.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <button
          onClick={() => setSelectedCat('')}
          className={`pill-tab cursor-pointer ${selectedCat === '' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
        >
          All Divisions
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`pill-tab cursor-pointer ${selectedCat === c.id ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Fixtures List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
          <span>Loading fixtures...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center editorial-card bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] rounded-2xl space-y-2">
          <Calendar className="w-8 h-8 text-[#7E7060] dark:text-[#817B72] mx-auto opacity-70" />
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-normal">No fixtures scheduled yet for this division.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => (
            <div key={m._id} className="editorial-card p-6 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034] text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#3E342B] dark:text-[#F5F1E8]">M#{m.matchNumber}</span>
                  <CategoryBadge category={m.category} />
                </div>
                <StatusBadge status={m.status} queuePosition={m.queuePosition} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <CarromCoin type={m.team1 ? "black" : "white"} size="xs" />
                    <span className="truncate font-semibold">{m.team1 ? m.team1.name : 'Waiting for Round...'}</span>
                  </div>
                  {m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id) && (
                    <span className="text-[10px] text-[#E74C3C] dark:text-[#D4A94C] font-mono font-bold flex items-center gap-1 shrink-0">
                      <Crown className="w-3 h-3 text-[#E74C3C] dark:text-[#D4A94C]" />
                      <span>WIN</span>
                    </span>
                  )}
                </div>

                <div className="text-center font-mono font-bold text-[#7E7060] dark:text-[#817B72] text-[10px]">VS</div>

                <div className="p-2.5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <CarromCoin type={m.isBye ? "white" : m.team2 ? "black" : "white"} size="xs" />
                    <span className="truncate font-semibold">{m.isBye ? 'BYE (Automatic Advance)' : m.team2 ? m.team2.name : 'Waiting for Round...'}</span>
                  </div>
                  {m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id) && (
                    <span className="text-[10px] text-[#E74C3C] dark:text-[#D4A94C] font-mono font-bold flex items-center gap-1 shrink-0">
                      <Crown className="w-3 h-3 text-[#E74C3C] dark:text-[#D4A94C]" />
                      <span>WIN</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
                <span>{m.roundName}</span>
                <span className="text-[#3E342B] dark:text-[#F5F1E8] font-bold">Main Carrom Board</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


