'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, Crown, ArrowRight } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="eyebrow-label">
          Hall of Fame
        </span>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Tournament Champions
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
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
              className="arena-card arena-card-hover p-6 space-y-6 rounded-3xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#2A313C]">
                <CategoryBadge category={cat.id} />
                <span className="text-[10px] font-mono text-[#F2C94C] font-bold uppercase tracking-wider">Edition 2026</span>
              </div>

              <div className="py-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#F2C94C]/15 border border-[#F2C94C]/40 text-[#F2C94C] flex items-center justify-center mx-auto shadow-lg shadow-[#F2C94C]/15">
                  <Trophy className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#D4A94C] font-bold block tracking-widest">
                    {champ ? 'Official Champion' : 'Knockout In Progress'}
                  </span>
                  <h3 className="text-2xl font-black font-display text-white mt-1 uppercase tracking-wide">
                    {champ ? champ.teamName || champ.name : 'Contested in Arena'}
                  </h3>
                </div>
              </div>

              <div className="pt-4 border-t border-[#2A313C] flex items-center justify-between text-xs font-mono">
                <span className="text-[#F5F1E8]/60 text-[11px]">Main Carrom Board</span>
                <Link
                  href={`/brackets?category=${cat.id}`}
                  className="text-[#F2C94C] hover:underline font-bold flex items-center gap-1 uppercase"
                >
                  <span>Bracket View</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
