'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { CategoryCoinPair, CarromCoin } from '@/components/ui/CarromElements';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          CHAMPIONSHIP DIVISIONS
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Tournament Categories
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Explore approved rosters, division requirements, and dynamic single-elimination tournament brackets.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCat === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`pill-tab cursor-pointer flex items-center gap-2 ${isSelected ? 'pill-tab-active' : 'pill-tab-inactive'}`}
            >
              <CategoryCoinPair category={cat.id} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Division Content Card */}
      <div className="editorial-card rounded-2xl p-6 sm:p-10 border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517] space-y-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div className="flex items-center gap-3">
            <CategoryBadge category={selectedCat} />
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                {CATEGORIES.find((c) => c.id === selectedCat)?.name}
              </h2>
              <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">
                {teams.length} Verified Entries • Single-Elimination Knockout
              </p>
            </div>
          </div>

          <Link
            href={`/brackets?category=${selectedCat}`}
            className="btn-primary text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <span>View Knockout Bracket</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Entries Table */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-[#3E342B] dark:text-[#F5F1E8]">Approved Entry Roster</h3>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
              <span>Loading roster...</span>
            </div>
          ) : teams.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono bg-[#FAF9F6] dark:bg-[#181C1F] rounded-xl border border-[#E8E1D5] dark:border-[#2B3034]">
              No approved entries in this division yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t, idx) => (
                <div key={t._id} className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-[#3E342B] dark:text-[#F5F1E8] font-bold">#{idx + 1}</span>
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40 font-mono">
                      Approved ✓
                    </span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">{t.name}</h4>
                  <div className="text-[11px] text-[#7E7060] dark:text-[#B8B1A5] font-mono space-y-0.5">
                    <div>P1: {t.player1?.fullName}{t.player1?.department ? ` (${t.player1.department})` : ''}</div>
                    {t.player2 && <div>P2: {t.player2?.fullName}{t.player2?.department ? ` (${t.player2.department})` : ''}</div>}
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


