'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import { Trophy, Medal, Crown, ArrowRight, Sparkles } from 'lucide-react';
import { CategoryBadge } from '@/components/ui/Badge';

export default function ChampionsPage() {
  const [champions, setChampions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const res = await api.getMatches({ status: 'completed' });
        if (res.success) {
          const finalMatches = (res.matches || []).filter((m) => m.roundName?.toLowerCase().includes('final'));
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFBA00] font-bold uppercase tracking-widest block">
          Tournament Glory
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Hall of Champions
        </h1>
        <p className="text-xs sm:text-sm text-[#D8C7F0]">
          Honoring the champions and runners-up across all 5 collegiate tournament divisions.
        </p>
      </div>

      {/* Champions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => {
          const champ = champions[cat.id];

          return (
            <div key={cat.id} className="sport-card p-6 space-y-5 rounded-3xl border border-[#4A138C]">
              <div className="flex items-center justify-between pb-3 border-b border-[#4A138C]">
                <CategoryBadge category={cat.id} />
                <Trophy className="w-4 h-4 text-[#FFBA00]" />
              </div>

              {champ?.winner ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-[#140129] border border-[#FFBA00]/40 space-y-1 shadow-lg shadow-[#FFBA00]/10">
                    <div className="flex items-center gap-1.5 text-[#FFBA00] text-[11px] font-bold">
                      <Crown className="w-4 h-4" />
                      <span>CHAMPION</span>
                    </div>
                    <div className="font-black text-white text-base font-display">{champ.winner.name}</div>
                  </div>

                  {champ.runnerUp && (
                    <div className="p-3.5 rounded-xl bg-[#140129] border border-[#4A138C] space-y-0.5">
                      <div className="flex items-center gap-1 text-[#D8C7F0] text-[10px] font-bold">
                        <Medal className="w-3.5 h-3.5 text-[#FDB095]" />
                        <span>RUNNER-UP</span>
                      </div>
                      <div className="text-xs text-slate-200 font-semibold">{champ.runnerUp.name}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[#D8C7F0] space-y-2">
                  <p>Knockouts In Progress</p>
                  <Link href={`/brackets?category=${cat.id}`} className="text-[#FFBA00] font-bold hover:underline inline-flex items-center gap-1">
                    <span>View Division Bracket</span>
                    <ArrowRight className="w-3 h-3" />
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
