'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Activity, Clock, RefreshCw, Trophy, ArrowRight, Radio, Award } from 'lucide-react';
import { StatusBadge, CategoryBadge } from '@/components/ui/Badge';
import { CarromCoin } from '@/components/ui/CarromElements';

export default function LivePage() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await api.getLiveMatches();
      if (res?.success) {
        setLiveData(res);
      }
    } catch (err) {
      console.warn('Live matches fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentMatch = liveData?.currentMatch;
  const nextMatch = liveData?.nextMatch;
  const readyQueue = liveData?.readyQueue || [];
  const completedMatches = liveData?.completedMatches || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 text-[#171614] dark:text-[#F7F4EC]">
      
      {/* 1. Broadcast Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#171614]/5 dark:bg-white/10 text-xs font-mono font-semibold tracking-wider uppercase border border-[#DCD6C8] dark:border-[#38342C]">
          <span className="w-2 h-2 rounded-full bg-[#D93829] animate-pulse" />
          <span>OFFICIAL TOURNAMENT BROADCAST</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-[#171614] dark:text-[#F7F4EC]">
          Live Board Broadcast
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6A60] dark:text-[#A8A194] leading-relaxed">
          Real-time scorecards, official referee decisions, and sequential on-deck queue exclusively on Board 1.
        </p>
      </div>

      {/* 2. CURRENT MATCH SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCD6C8] dark:border-[#2E2B25] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#D93829] animate-ping" />
            <h2 className="text-lg sm:text-xl font-serif font-bold uppercase tracking-wider">
              Current Live Match · Board 1
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#857B6C] font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#857B6C]" />
            <span>4s Live Sync</span>
          </div>
        </div>

        {currentMatch ? (
          <div className="rounded-3xl p-6 sm:p-10 space-y-8 bg-[#171614] text-[#F7F4EC] border border-[#171614] shadow-2xl relative overflow-hidden">
            {/* Background ambient gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C2A268]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Top metadata strip */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#171614] dark:bg-white text-white dark:text-[#171614] text-[10px] font-mono font-bold tracking-wider uppercase border border-white/20 dark:border-transparent">
                  CHAMPIONSHIP BOARD
                </span>
                <CategoryBadge category={currentMatch.category} />
                <span className="font-mono text-white/70 font-semibold">{currentMatch.roundName}</span>
              </div>
              <span className="text-[#D93829] font-bold text-xs flex items-center gap-2 font-mono uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D93829] animate-pulse" />
                LIVE IN PLAY
              </span>
            </div>

            {/* Head to Head Stage (Responsive on phone view) */}
            <div className="flex flex-col sm:grid sm:grid-cols-11 items-center text-center gap-4 py-6 relative z-10">
              <div className="w-full sm:col-span-5 space-y-1.5 sm:space-y-2 text-center sm:text-left">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C2A268] block">Side A · White</span>
                <h3 className="font-serif font-bold text-xl sm:text-3xl lg:text-5xl text-white tracking-tight leading-tight break-words">
                  {currentMatch.team1?.name || 'TBD'}
                </h3>
              </div>

              <div className="sm:col-span-1 flex flex-col items-center justify-center my-2 sm:my-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/20 text-xs font-serif italic text-[#C2A268] flex items-center justify-center shadow-inner">
                  vs
                </div>
                <span className="text-[9px] text-white/50 uppercase font-mono tracking-wider mt-1.5 block">
                  M#{currentMatch.matchNumber}
                </span>
              </div>

              <div className="w-full sm:col-span-5 space-y-1.5 sm:space-y-2 text-center sm:text-right">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#C2A268] block">Side B · Black</span>
                <h3 className="font-serif font-bold text-xl sm:text-3xl lg:text-5xl text-white tracking-tight leading-tight break-words">
                  {currentMatch.team2?.name || 'TBD'}
                </h3>
              </div>
            </div>

            {/* Bottom broadcast status bar */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-white/60 gap-2 text-center sm:text-left relative z-10">
              <span>Championship Table 01 • Certified Carrom Board</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Adjudication Active · Single Game Decider
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl p-8 sm:p-12 text-center bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] flex items-center justify-center mx-auto text-[#857B6C]">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-board-free text-xl sm:text-2xl text-[#171614] dark:text-[#F7F4EC]">Main Carrom Board is Free</h3>
            <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] max-w-md mx-auto leading-relaxed">
              {nextMatch
                ? `Next match on deck: ${nextMatch.team1?.name} vs ${nextMatch.team2?.name}. Waiting for players to report to the referee desk.`
                : 'No match is currently in progress. Subsequent rounds will stream here live as draws are seeded.'}
            </p>
          </div>
        )}
      </section>

      {/* 3. SEQUENTIAL READY QUEUE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCD6C8] dark:border-[#2E2B25] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-[#857B6C]" />
            <h2 className="text-base sm:text-xl font-serif font-bold uppercase tracking-wider">
              On-Deck Ready Queue
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#38342C]">
            {readyQueue.length} In Line
          </span>
        </div>

        {readyQueue.length === 0 ? (
          <div className="rounded-2xl p-6 sm:p-8 text-center bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] text-xs text-[#6F6A60] dark:text-[#A8A194] font-mono">
            No matches currently waiting in the ready queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {readyQueue.map((match, idx) => (
              <div
                key={match._id}
                className="rounded-2xl p-4 sm:p-5 space-y-3 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs hover:border-[#171614] dark:hover:border-[#C2A268] transition-colors"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#DCD6C8]/80 dark:border-[#38342C]">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={match.category} />
                    <span className="font-mono text-[#6F6A60] dark:text-[#A8A194] text-[11px]">{match.roundName}</span>
                  </div>
                  <StatusBadge status={match.status} queuePosition={match.queuePosition || idx + 1} />
                </div>

                <div className="flex flex-col sm:grid sm:grid-cols-11 items-center py-1 text-xs sm:text-sm font-serif font-bold text-[#171614] dark:text-[#F7F4EC] gap-1 sm:gap-0">
                  <span className="w-full sm:col-span-5 text-center sm:text-left truncate">{match.team1?.name}</span>
                  <span className="sm:col-span-1 text-center text-[#857B6C] font-serif italic text-xs">vs</span>
                  <span className="w-full sm:col-span-5 text-center sm:text-right truncate">{match.team2?.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. RECENTLY COMPLETED */}
      {completedMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#DCD6C8] dark:border-[#2E2B25] pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C2A268]" />
              <h2 className="text-lg sm:text-xl font-serif font-bold uppercase tracking-wider">
                Recent Results Confirmed
              </h2>
            </div>
            <Link
              href="/results"
              className="text-xs font-bold text-[#171614] dark:text-[#F7F4EC] hover:underline uppercase flex items-center gap-1.5"
            >
              <span>View All Results</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div
                key={m._id}
                className="rounded-2xl p-5 space-y-2.5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-[#6F6A60] dark:text-[#A8A194] font-mono pb-2 border-b border-[#DCD6C8]/80 dark:border-[#38342C]">
                  <CategoryBadge category={m.category} />
                  <span>Match #{m.matchNumber}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold block">
                    Winner Confirmed
                  </span>
                  <p className="font-serif font-bold text-[#171614] dark:text-[#F7F4EC] text-base truncate">
                    {m.winnerTeam?.name || 'Winner Confirmed'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
