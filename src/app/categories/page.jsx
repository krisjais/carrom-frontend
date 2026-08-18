'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { ArrowRight, Users, Shield, Trophy } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

export default function CategoriesPage() {
  const [stats, setStats] = useState(null);
  const [selectedCat, setSelectedCat] = useState('boys_singles');
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.getOverviewStats();
        if (res.success) setStats(res.stats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoadingTeams(true);
      try {
        const res = await api.getTeams(selectedCat);
        if (res.success) setTeams(res.teams || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTeams(false);
      }
    };
    fetchTeams();
  }, [selectedCat]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFBA00] font-bold uppercase tracking-widest block">
          Division Breakdown
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Championship Divisions
        </h1>
        <p className="text-xs sm:text-sm text-[#D8C7F0]">
          Select a division to view verified rosters and dynamic single-elimination brackets.
        </p>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#4A138C]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          const catStat = stats?.categories?.[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FFBA00] text-[#210440] shadow-md shadow-[#FFBA00]/20'
                  : 'bg-[#2C0854] text-[#D8C7F0] hover:text-white'
              }`}
            >
              {cat.name} ({catStat?.teams || 0})
            </button>
          );
        })}
      </div>

      {/* Selected Category Roster Card */}
      <div className="sport-card p-6 sm:p-8 space-y-6 rounded-3xl border border-[#4A138C]">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#4A138C]">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <CategoryBadge category={selectedCat} />
              <h2 className="text-2xl font-black font-display text-white">
                {CATEGORIES.find((c) => c.id === selectedCat)?.name} Roster
              </h2>
            </div>
            <p className="text-xs text-[#D8C7F0]">
              {teams.length} verified entries ready for dynamic single-game knockout draw
            </p>
          </div>

          <Link
            href={`/brackets?category=${selectedCat}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gold text-xs font-black"
          >
            <span>View Knockout Bracket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Teams Grid */}
        {loadingTeams ? (
          <div className="py-16 text-center text-[#D8C7F0] text-xs">Loading team roster...</div>
        ) : teams.length === 0 ? (
          <div className="py-12 text-center text-[#D8C7F0] text-xs">
            No approved teams found for this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teams.map((team, idx) => (
              <div key={team._id} className="p-4 rounded-2xl bg-[#140129] border border-[#4A138C] space-y-1.5 hover:border-[#FFBA00]/40 transition-all">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[#FFBA00] font-bold">Entry #{idx + 1}</span>
                  <span className="text-emerald-400 font-bold text-[10px]">Verified ✓</span>
                </div>
                <h4 className="font-bold text-white text-xs truncate">{team.name}</h4>
                <p className="text-[11px] text-[#D8C7F0] truncate">
                  {team.player1?.fullName}
                  {team.player2 ? ` & ${team.player2.fullName}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
