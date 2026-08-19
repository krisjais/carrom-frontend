'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Activity, Clock, RefreshCw, Trophy, ArrowRight } from 'lucide-react';
import { StatusBadge, MainBoardBadge, CategoryBadge } from '@/components/ui/Badge';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MainBoardBadge />
          <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] font-bold uppercase tracking-widest">
            Single Physical Arena
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Main Board Live Arena
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Real-time scorecards and sequential FIFO queue tracking exclusively on the Main Carrom Board.
        </p>
      </div>

      {/* 1. CURRENT MATCH SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2B3034] pb-3">
          <h2 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center gap-2.5">
            <span className="live-dot" />
            <span>CURRENT MATCH (MAIN CARROM BOARD)</span>
          </h2>
          <span className="text-xs text-[#7E7060] dark:text-[#B8B1A5] flex items-center gap-1.5 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E74C3C]" />
            <span>Live Sync</span>
          </span>
        </div>

        {currentMatch ? (
          <div className="editorial-card p-6 sm:p-8 space-y-6 border border-[#D5C4A1] dark:border-[#2B3034] bg-white dark:bg-[#15191C] shadow-xs">
            {/* Top line */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034] text-xs">
              <div className="flex items-center gap-2.5">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="font-mono text-[#3E342B] dark:text-[#F5F1E8] font-bold">{currentMatch.roundName}</span>
              </div>
              <span className="text-[#E74C3C] font-bold text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <span className="live-dot" />
                LIVE IN PLAY
              </span>
            </div>

            {/* Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4 py-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] uppercase font-bold tracking-widest block">Team 1</span>
                <h4 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-xl sm:text-3xl truncate">{currentMatch.team1?.name}</h4>
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-center mx-auto shadow-inner">
                  VS
                </div>
                <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] uppercase font-semibold mt-1.5 block font-mono tracking-wider">
                  Knockout Match #{currentMatch.matchNumber}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] uppercase font-bold tracking-widest block">Team 2</span>
                <h4 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-xl sm:text-3xl truncate">{currentMatch.team2?.name}</h4>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs font-mono">
              <span className="text-[#7E7060] dark:text-[#B8B1A5]">Single Championship Arena</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Official Match in Play · Winner Advances
              </span>
            </div>
          </div>
        ) : (
          <div className="p-10 text-center editorial-card bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2">
            <Activity className="w-8 h-8 text-[#7E7060] dark:text-[#817B72] mx-auto opacity-75" />
            <h3 className="text-base font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">Main Carrom Board is Free</h3>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
              {nextMatch ? `Next match on deck: ${nextMatch.team1?.name} vs ${nextMatch.team2?.name}.` : 'No active match at this moment.'}
            </p>
          </div>
        )}
      </section>

      {/* 2. SEQUENTIAL ARENA READY QUEUE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2B3034] pb-3">
          <h2 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#4A4238] dark:text-[#D4A94C]" />
            <span>SEQUENTIAL ARENA QUEUE (READY)</span>
          </h2>
          <span className="text-xs text-[#3E342B] dark:text-[#F5F1E8] font-mono font-bold">{readyQueue.length} On Deck</span>
        </div>

        {readyQueue.length === 0 ? (
          <div className="p-8 text-center editorial-card bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">
            No matches currently waiting in the ready queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyQueue.map((match, idx) => (
              <div
                key={match._id}
                className="editorial-card p-5 space-y-3 rounded-xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034]"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034]">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={match.category} />
                    <span className="font-mono text-[#7E7060] dark:text-[#B8B1A5]">{match.roundName}</span>
                  </div>
                  <StatusBadge status={match.status} queuePosition={match.queuePosition || idx + 1} />
                </div>

                <div className="flex items-center justify-between py-1 text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                  <span className="truncate pr-2">{match.team1?.name}</span>
                  <span className="text-[#7E7060] dark:text-[#817B72] font-mono px-2 text-xs">vs</span>
                  <span className="truncate pl-2 text-right">{match.team2?.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. RECENTLY COMPLETED */}
      {completedMatches.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2B3034] pb-3">
            <h2 className="text-xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#E74C3C]" />
              <span>RECENT RESULTS</span>
            </h2>
            <Link href="/results" className="text-xs font-mono font-bold text-[#E74C3C] hover:underline uppercase flex items-center gap-1">
              <span>View All Results</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div key={m._id} className="editorial-card p-5 space-y-2.5 rounded-xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034]">
                <div className="flex items-center justify-between text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
                  <CategoryBadge category={m.category} />
                  <span>M#{m.matchNumber}</span>
                </div>
                <div className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-xs">
                  <span className="text-emerald-700 dark:text-emerald-400 font-sans font-bold">Winner: </span>
                  {m.winnerTeam?.name || 'Winner Confirmed'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


