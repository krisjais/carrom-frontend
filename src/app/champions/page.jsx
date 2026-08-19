'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, Crown, ArrowRight } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';
import { CategoryCoinPair, CarromCoin } from '@/components/ui/CarromElements';

export default function ChampionsPage() {
  const [champions, setChampions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const res = await api.getChampions?.();
        if (res?.success) setChampions(res.champions || []);
      } catch (err) {
        // Fallback gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          HALL OF FAME
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Tournament Champions
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Celebrating the collegiate champions across all 5 tournament divisions.
        </p>
      </div>

      {/* Champions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => {
          const champ = champions.find((c) => c.category === cat.id);

          return (
            <div
              key={cat.id}
              className="editorial-card p-6 space-y-6 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                <div className="flex items-center gap-2">
                  <CategoryCoinPair category={cat.id} />
                  <CategoryBadge category={cat.id} />
                </div>
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] font-bold uppercase tracking-wider">Edition 2026</span>
              </div>

              <div className="py-4 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center mx-auto shadow-xs">
                  <CarromCoin type="queen" size="sm" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#7E7060] dark:text-[#817B72] font-bold block tracking-widest">
                    {champ ? 'Official Champion' : 'Knockout In Progress'}
                  </span>
                  <h3 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
                    {champ ? champ.teamName || champ.name : 'Contested in Arena'}
                  </h3>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs font-mono">
                <span className="text-[#7E7060] dark:text-[#817B72] text-[11px]">Main Carrom Board</span>
                <Link
                  href={`/brackets?category=${cat.id}`}
                  className="text-[#E74C3C] hover:underline font-bold flex items-center gap-1 uppercase text-xs"
                >
                  <span>Bracket View</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


