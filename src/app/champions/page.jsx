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
        const res = await api.getChampions();
        if (res.success) setChampions(res.champions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest block">
          Hall of Fame
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Tournament Champions
        </h1>
        <p className="text-xs sm:text-sm text-[#D4DEEE]">
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
              className="sport-card p-6 space-y-6 rounded-3xl border border-[#35538C] relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#35538C]">
                <CategoryBadge category={cat.id} />
                <span className="text-[10px] font-mono text-[#FFD691] font-bold uppercase">Edition 2026</span>
              </div>

              <div className="py-4 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#FFD691]/20 border border-[#FFD691]/40 text-[#FFD691] flex items-center justify-center mx-auto shadow-lg shadow-[#FFD691]/15">
                  <Trophy className="w-9 h-9" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase text-[#D7A859] font-bold block">
                    {champ ? 'Official Champion' : 'Knockout Tournament In Progress'}
                  </span>
                  <h3 className="text-2xl font-black font-display text-white mt-0.5">
                    {champ ? champ.teamName || champ.name : 'Contested in Arena'}
                  </h3>
                </div>
              </div>

              <div className="pt-4 border-t border-[#35538C] flex items-center justify-between text-xs">
                <span className="text-[#D4DEEE] font-mono text-[11px]">Main Carrom Board</span>
                <Link
                  href={`/brackets?category=${cat.id}`}
                  className="text-[#FFD691] hover:underline font-bold flex items-center gap-1"
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
