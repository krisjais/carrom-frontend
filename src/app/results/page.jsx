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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest block">
          Official Tournament Records
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Match Results
        </h1>
        <p className="text-xs sm:text-sm text-[#D4DEEE]">
          Confirmed outcomes and advancing winners from completed tournament matches on the Main Carrom Board.
        </p>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#35538C]">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === ''
              ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
              : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
          }`}
        >
          All Divisions
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
                : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Results Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#D4DEEE] text-xs">Loading championship results...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 text-center sport-card rounded-3xl space-y-3">
          <Trophy className="w-10 h-10 text-[#FFD691] mx-auto opacity-70" />
          <p className="text-xs text-[#D4DEEE]">No completed matches found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isT1Win = m.winnerTeam && (m.winnerTeam._id === m.team1?._id || m.winnerTeam === m.team1?._id);
            const isT2Win = m.winnerTeam && (m.winnerTeam._id === m.team2?._id || m.winnerTeam === m.team2?._id);

            return (
              <div key={m._id} className="sport-card p-6 space-y-5 rounded-3xl">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#35538C] text-[11px]">
                  <CategoryBadge category={m.category} />
                  <span className="font-mono text-[#D4DEEE]">{m.roundName} • M#{m.matchNumber}</span>
                </div>

                {/* Match Winner Summary */}
                <div className="grid grid-cols-3 items-center gap-2.5 text-center py-1">
                  <div className={`p-3 rounded-2xl border transition-all ${isT1Win ? 'bg-[#FFD691]/20 border-[#FFD691] text-white font-bold shadow-sm' : 'bg-[#152442] border-[#35538C] text-slate-400'}`}>
                    <span className="text-xs truncate block font-bold">{m.team1?.name}</span>
                    {isT1Win && <span className="text-[10px] text-[#FFD691] font-mono font-black block mt-1">🏆 WINNER</span>}
                  </div>

                  <div className="text-center">
                    <span className="text-xs font-mono font-black text-[#D7A859] block">VS</span>
                    <span className="text-[9px] text-[#D4DEEE] uppercase font-mono font-bold">Knockout</span>
                  </div>

                  <div className={`p-3 rounded-2xl border transition-all ${isT2Win ? 'bg-[#FFD691]/20 border-[#FFD691] text-white font-bold shadow-sm' : 'bg-[#152442] border-[#35538C] text-slate-400'}`}>
                    <span className="text-xs truncate block font-bold">{m.team2?.name}</span>
                    {isT2Win && <span className="text-[10px] text-[#FFD691] font-mono font-black block mt-1">🏆 WINNER</span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#35538C] flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#D4DEEE]">Main Carrom Board</span>
                  <span className="text-emerald-300 text-[11px] font-bold">
                    ✓ {m.winnerTeam?.name || (isT1Win ? m.team1?.name : m.team2?.name)} Advanced
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
