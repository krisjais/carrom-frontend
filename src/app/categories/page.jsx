'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Championship Categories
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Select a category to view approved rosters and dynamic brackets.
        </p>
      </div>

      {/* Category selector pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#1C2B48]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          const catStat = stats?.categories?.[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-[#D4AF37] text-[#070B16] shadow-sm'
                  : 'bg-[#0E1626] text-[#94A3B8] hover:text-white'
              }`}
            >
              {cat.name} ({catStat?.teams || 0})
            </button>
          );
        })}
      </div>

      {/* Selected Category Roster Card */}
      <div className="sport-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1C2B48]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CategoryBadge category={selectedCat} />
              <h2 className="text-xl font-bold font-display text-white">
                {CATEGORIES.find((c) => c.id === selectedCat)?.name} Roster
              </h2>
            </div>
            <p className="text-xs text-[#94A3B8]">
              {teams.length} verified teams registered for dynamic knockout draw
            </p>
          </div>

          <Link
            href={`/brackets?category=${selectedCat}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4AF37] text-[#070B16] font-bold text-xs hover:bg-[#E5C358] transition-colors"
          >
            <span>View Knockout Bracket</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Teams Grid */}
        {loadingTeams ? (
          <div className="py-16 text-center text-[#94A3B8] text-xs">Loading team roster...</div>
        ) : teams.length === 0 ? (
          <div className="py-12 text-center text-[#94A3B8] text-xs">
            No approved teams found for this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {teams.map((team, idx) => (
              <div key={team._id} className="p-3.5 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[#64748B] font-bold">#{idx + 1}</span>
                  <span className="text-emerald-400 font-medium text-[10px]">Verified</span>
                </div>
                <h4 className="font-bold text-white text-xs truncate">{team.name}</h4>
                <p className="text-[11px] text-[#94A3B8] truncate">
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
