'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

export default function CategoriesPage() {
  const [selectedCat, setSelectedCat] = useState('boys_singles');
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const res = await api.getTeams(selectedCat);
        if (res.success) setTeams(res.teams || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [selectedCat]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest block">
          Championship Divisions
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Tournament Categories
        </h1>
        <p className="text-xs sm:text-sm text-[#D4DEEE]">
          Explore approved rosters, division requirements, and dynamic tournament brackets.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-2 border-b border-[#35538C]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FFD691] text-[#233A66] shadow-md shadow-[#FFD691]/20 font-black'
                  : 'bg-[#1E3258] text-[#D4DEEE] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Division Content Card */}
      <div className="sport-card rounded-4xl p-6 sm:p-10 border border-[#35538C] space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
          <div className="flex items-center gap-3">
            <CategoryBadge category={selectedCat} />
            <div>
              <h2 className="text-2xl font-black font-display text-white">
                {CATEGORIES.find((c) => c.id === selectedCat)?.name}
              </h2>
              <p className="text-xs text-[#D4DEEE]">
                {teams.length} Verified Entries • Single-Elimination Knockout
              </p>
            </div>
          </div>

          <Link
            href={`/brackets?category=${selectedCat}`}
            className="px-6 py-3 rounded-2xl btn-cream text-xs font-black shadow-md flex items-center gap-1.5 transition-all"
          >
            <span>View Knockout Bracket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Entries Table */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-base font-display">Approved Entry Roster</h3>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#D4DEEE] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#FFD691]" />
              <span>Loading roster...</span>
            </div>
          ) : teams.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#D4DEEE] bg-[#152442] rounded-2xl border border-[#35538C]">
              No approved entries in this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t, idx) => (
                <div key={t._id} className="p-4 rounded-2xl bg-[#152442] border border-[#35538C] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#FFD691] font-bold">#{idx + 1}</span>
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Approved ✓
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{t.name}</h4>
                  <div className="text-[11px] text-[#D4DEEE] space-y-0.5">
                    <div>P1: {t.player1?.fullName} ({t.player1?.studentId})</div>
                    {t.player2 && <div>P2: {t.player2?.fullName} ({t.player2?.studentId})</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
