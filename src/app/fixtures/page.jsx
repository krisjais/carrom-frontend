'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Calendar, Clock, RefreshCw, Trophy, ArrowRight, Crown } from 'lucide-react';
import { StatusBadge, MainBoardBadge, CategoryBadge } from '@/components/ui/Badge';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="eyebrow-label">
          Sequential Schedule
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Match Fixtures
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Sequential timeline of upcoming and completed matches on the Main Carrom Board.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#2A313C]">
        <button
          onClick={() => setSelectedCat('')}
          className={`pill-tab ${selectedCat === '' ? 'pill-tab-active' : 'pill-tab-inactive'}`}
        >
          All Divisions
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`pill-tab ${selectedCat === c.id ? 'pill-tab-active' : 'pill-tab-inactive'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Fixtures List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#F5F1E8]/60 font-mono flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#F2C94C]" />
          <span>Loading fixtures...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center arena-card rounded-3xl space-y-2">
          <Calendar className="w-8 h-8 text-[#F2C94C] mx-auto opacity-70" />
          <p className="text-xs text-[#F5F1E8]/70 font-mono">No fixtures scheduled yet for this division.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => (
            <div key={m._id} className="arena-card arena-card-hover p-6 space-y-4 rounded-3xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#2A313C] text-[11px] font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#F2C94C]">M#{m.matchNumber}</span>
                  <CategoryBadge category={m.category} />
                </div>
                <StatusBadge status={m.status} queuePosition={m.queuePosition} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#14171A] border border-[#2A313C] font-bold text-white flex items-center justify-between">
                  <span className="truncate pr-2">{m.team1 ? m.team1.name : 'Waiting for Round...'}</span>
                  {m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id) && (
                    <span className="text-[10px] text-[#F2C94C] font-mono font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-[#F2C94C]" />
                      <span>WINNER</span>
                    </span>
                  )}
                </div>

                <div className="text-center font-mono font-black text-[#D4A94C] text-[10px]">VS</div>

                <div className="p-3 rounded-2xl bg-[#14171A] border border-[#2A313C] font-bold text-white flex items-center justify-between">
                  <span className="truncate pr-2">{m.isBye ? 'BYE (Automatic Advance)' : m.team2 ? m.team2.name : 'Waiting for Round...'}</span>
                  {m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id) && (
                    <span className="text-[10px] text-[#F2C94C] font-mono font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-[#F2C94C]" />
                      <span>WINNER</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#2A313C] flex items-center justify-between text-[11px] text-[#F5F1E8]/70 font-mono">
                <span>{m.roundName}</span>
                <span className="text-[#F2C94C]">Main Carrom Board</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
