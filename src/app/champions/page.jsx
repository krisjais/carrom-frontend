'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, Medal, Crown } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

export default function ChampionsPage() {
  const [champions, setChampions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const res = await api.getMatches({ status: 'completed' });
        if (res.success) {
          const finalMatches = (res.matches || []).filter((m) => m.roundNumber === 3 || m.roundName?.toLowerCase().includes('final'));
          const map = {};
          finalMatches.forEach((m) => {
            if (m.winnerTeam) {
              map[m.category] = {
                winner: m.winnerTeam,
                runnerUp: m.team1?._id === m.winnerTeam?._id ? m.team2 : m.team1,
                match: m
              };
            }
          });
          setChampions(map);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChampions();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Hall of Champions
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Honoring the champions and runners-up across all 5 tournament categories.
        </p>
      </div>

      {/* Champions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const champ = champions[cat.id];

          return (
            <div key={cat.id} className="sport-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1C2B48]">
                <CategoryBadge category={cat.id} />
                <Trophy className="w-4 h-4 text-[#D4AF37]" />
              </div>

              {champ?.winner ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#070B16] border border-[#D4AF37]/30 space-y-1">
                    <div className="flex items-center gap-1.5 text-[#D4AF37] text-[11px] font-bold">
                      <Crown className="w-3.5 h-3.5" />
                      <span>CHAMPION</span>
                    </div>
                    <div className="font-bold text-white text-sm">{champ.winner.name}</div>
                  </div>

                  {champ.runnerUp && (
                    <div className="p-2.5 rounded-lg bg-[#070B16] border border-[#1C2B48] space-y-0.5">
                      <div className="flex items-center gap-1 text-[#94A3B8] text-[10px] font-semibold">
                        <Medal className="w-3 h-3 text-slate-400" />
                        <span>RUNNER-UP</span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium">{champ.runnerUp.name}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#94A3B8] space-y-1">
                  <p>Tournament ongoing.</p>
                  <Link href={`/brackets?category=${cat.id}`} className="text-[#D4AF37] font-semibold hover:underline">
                    View Live Bracket →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
