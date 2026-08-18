'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Activity, Clock, RefreshCw, Trophy } from 'lucide-react';
import { StatusBadge, MainBoardBadge, CategoryBadge } from '@/components/ui/Badge';

export default function LivePage() {
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLive = async () => {
    try {
      const res = await api.getLiveMatches();
      if (res.success) {
        setLiveData(res);
      }
    } catch (err) {
      console.error(err);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MainBoardBadge />
          <span className="text-[11px] font-mono text-[#FFD691] font-black uppercase tracking-widest">
            Single Equipment Arena
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Live Arena Match Center
        </h1>
        <p className="text-xs sm:text-sm text-[#D4DEEE]">
          Real-time scorecards and sequential queue tracking on the Main Carrom Board.
        </p>
      </div>

      {/* 1. CURRENT MATCH SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${currentMatch ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            <span>CURRENT MATCH (LIVE)</span>
          </h2>
          <span className="text-xs text-[#D4DEEE] flex items-center gap-1.5 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>Live Sync</span>
          </span>
        </div>

        {currentMatch ? (
          <div className="glass-card p-6 sm:p-8 space-y-6 border-2 border-emerald-500/50 bg-gradient-to-br from-[#1E3258] to-[#152442] shadow-2xl">
            {/* Top line */}
            <div className="flex items-center justify-between pb-4 border-b border-[#35538C] text-xs">
              <div className="flex items-center gap-2.5">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="font-mono text-[#FFD691] font-bold">{currentMatch.roundName}</span>
              </div>
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LIVE IN PLAY
              </span>
            </div>

            {/* Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4 py-3">
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#D7A859] uppercase font-bold block">Team 1</span>
                <h4 className="font-black text-white text-xl sm:text-2xl truncate font-display">{currentMatch.team1?.name}</h4>
              </div>

              <div>
                <div className="w-14 h-14 rounded-full bg-[#152442] border border-[#D7A859]/50 text-xs font-mono font-black text-[#FFD691] flex items-center justify-center mx-auto shadow-inner">
                  VS
                </div>
                <span className="text-[10px] text-[#D4DEEE] uppercase font-bold mt-1.5 block font-mono">Single-Game Knockout</span>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-[#D7A859] uppercase font-bold block">Team 2</span>
                <h4 className="font-black text-white text-xl sm:text-2xl truncate font-display">{currentMatch.team2?.name}</h4>
              </div>
            </div>

            <div className="pt-4 border-t border-[#35538C] flex items-center justify-between text-xs text-[#D4DEEE]">
              <span className="font-mono text-[#FFD691]">Main Carrom Board Arena</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live In Play · Winner Advances
              </span>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center sport-card space-y-2">
            <Activity className="w-8 h-8 text-[#FFD691] mx-auto opacity-70" />
            <h3 className="text-sm font-bold text-white">Main Carrom Board is Currently Free</h3>
            <p className="text-xs text-[#D4DEEE]">
              {nextMatch ? `Next match is scheduled to start soon: ${nextMatch.team1?.name} vs ${nextMatch.team2?.name}.` : 'No active matches at the moment.'}
            </p>
          </div>
        )}
      </section>

      {/* 2. SEQUENTIAL ARENA READY QUEUE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#FFD691]" />
            <span>SEQUENTIAL ARENA QUEUE (READY)</span>
          </h2>
          <span className="text-xs text-[#D4DEEE] font-mono">{readyQueue.length} In Line</span>
        </div>

        {readyQueue.length === 0 ? (
          <div className="p-8 text-center sport-card text-xs text-[#D4DEEE]">
            No matches currently queued for the board.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyQueue.map((match, idx) => (
              <div
                key={match._id}
                className="sport-card sport-card-hover p-5 space-y-3 rounded-2xl"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#35538C]">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={match.category} />
                    <span className="font-mono text-[#D4DEEE]">{match.roundName}</span>
                  </div>
                  <StatusBadge status={match.status} queuePosition={match.queuePosition || idx + 1} />
                </div>

                <div className="flex items-center justify-between py-1 text-sm font-bold text-white">
                  <span className="truncate pr-2">{match.team1?.name}</span>
                  <span className="text-[#FFD691] font-mono px-2">vs</span>
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
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FFD691]" />
              <span>RECENT RESULTS</span>
            </h2>
            <Link href="/results" className="text-xs font-bold text-[#FFD691] hover:underline">
              View All Results →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div key={m._id} className="sport-card p-5 space-y-2.5 rounded-2xl">
                <div className="flex items-center justify-between text-[11px] text-[#D4DEEE]">
                  <CategoryBadge category={m.category} />
                  <span className="font-mono">M#{m.matchNumber}</span>
                </div>
                <div className="font-bold text-white text-xs">
                  <span className="text-emerald-400 font-bold">Winner: </span>
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
