'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Calendar, Clock, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest block">
          Sequential Schedule
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Match Fixtures
        </h1>
        <p className="text-xs sm:text-sm text-[#D4DEEE]">
          Sequential timeline of upcoming and completed matches on the Main Carrom Board.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#35538C]">
        <button
          onClick={() => setSelectedCat('')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedCat === ''
              ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
              : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
          }`}
        >
          All Divisions
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCat === c.id
                ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
                : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Fixtures List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-[#D4DEEE] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#FFD691]" />
          <span>Loading fixtures...</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center sport-card rounded-3xl space-y-2">
          <Calendar className="w-8 h-8 text-[#FFD691] mx-auto opacity-70" />
          <p className="text-xs text-[#D4DEEE]">No fixtures scheduled yet for this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => (
            <div key={m._id} className="sport-card p-6 space-y-4 rounded-3xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#35538C] text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-[#FFD691]">M#{m.matchNumber}</span>
                  <CategoryBadge category={m.category} />
                </div>
                <StatusBadge status={m.status} queuePosition={m.queuePosition} />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#152442] border border-[#35538C] font-bold text-white flex items-center justify-between">
                  <span className="truncate pr-2">{m.team1 ? m.team1.name : 'Waiting for Round...'}</span>
                  {m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id) && (
                    <span className="text-[10px] text-[#FFD691] font-mono font-black">🏆 WINNER</span>
                  )}
                </div>

                <div className="text-center font-mono font-black text-[#D7A859] text-[10px]">VS</div>

                <div className="p-3 rounded-2xl bg-[#152442] border border-[#35538C] font-bold text-white flex items-center justify-between">
                  <span className="truncate pr-2">{m.isBye ? 'BYE (Automatic Advance)' : m.team2 ? m.team2.name : 'Waiting for Round...'}</span>
                  {m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id) && (
                    <span className="text-[10px] text-[#FFD691] font-mono font-black">🏆 WINNER</span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#35538C] flex items-center justify-between text-[11px] text-[#D4DEEE]">
                <span className="font-mono">{m.roundName}</span>
                <span className="font-mono text-[#FFD691]">Main Carrom Board</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
