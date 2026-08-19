'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Activity, Clock, RefreshCw, Trophy, Flame } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-[#0B0D0E]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MainBoardBadge />
          <span className="text-[11px] font-mono text-[#F2C94C] font-black uppercase tracking-widest">
            Single Arena Broadcast
          </span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black font-display text-white tracking-tight uppercase">
          Live Arena Match Center
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F1E8]/70 font-mono">
          Real-time scorecards and sequential FIFO queue tracking on the Main Carrom Board.
        </p>
      </div>

      {/* 1. CURRENT MATCH SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A313C] pb-3">
          <h2 className="text-xl font-black font-display text-white flex items-center gap-2.5 uppercase tracking-wide">
            <span className="live-dot" />
            <span>CURRENT MATCH (LIVE ARENA)</span>
          </h2>
          <span className="text-xs text-[#F5F1E8]/70 flex items-center gap-1.5 font-mono">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F2C94C]" />
            <span>Live Sync</span>
          </span>
        </div>

        {currentMatch ? (
          <div className="arena-card p-6 sm:p-8 space-y-6 border border-[#F2C94C]/40 bg-gradient-to-br from-[#1A1E24] via-[#14171A] to-[#0E1012] shadow-2xl">
            {/* Top line */}
            <div className="flex items-center justify-between pb-4 border-b border-[#2A313C] text-xs">
              <div className="flex items-center gap-2.5">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="font-mono text-[#F2C94C] font-bold">{currentMatch.roundName}</span>
              </div>
              <span className="text-rose-400 font-bold text-xs flex items-center gap-1.5 font-mono uppercase tracking-wider">
                <span className="live-dot" />
                LIVE IN PLAY
              </span>
            </div>

            {/* Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4 py-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4A94C] uppercase font-bold tracking-widest block">Team 1</span>
                <h4 className="font-black text-white text-xl sm:text-3xl truncate font-display">{currentMatch.team1?.name}</h4>
              </div>

              <div>
                <div className="w-14 h-14 rounded-full bg-[#14171A] border border-[#D4A94C]/50 text-xs font-mono font-black text-[#F2C94C] flex items-center justify-center mx-auto shadow-inner">
                  VS
                </div>
                <span className="text-[10px] text-[#F5F1E8]/60 uppercase font-bold mt-1.5 block font-mono tracking-wider">
                  Knockout Single Game
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#D4A94C] uppercase font-bold tracking-widest block">Team 2</span>
                <h4 className="font-black text-white text-xl sm:text-3xl truncate font-display">{currentMatch.team2?.name}</h4>
              </div>
            </div>

            <div className="pt-4 border-t border-[#2A313C] flex items-center justify-between text-xs text-[#F5F1E8]/70 font-mono">
              <span className="text-[#F2C94C]">Main Carrom Board Arena</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Official Match in Play · Winner Advances
              </span>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center arena-card space-y-2">
            <Activity className="w-8 h-8 text-[#F2C94C] mx-auto opacity-75" />
            <h3 className="text-base font-black text-white font-display uppercase tracking-wide">Main Carrom Board is Free</h3>
            <p className="text-xs text-[#F5F1E8]/70 font-mono">
              {nextMatch ? `Next match on deck: ${nextMatch.team1?.name} vs ${nextMatch.team2?.name}.` : 'No active match at this moment.'}
            </p>
          </div>
        )}
      </section>

      {/* 2. SEQUENTIAL ARENA READY QUEUE */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A313C] pb-3">
          <h2 className="text-xl font-black font-display text-white flex items-center gap-2 uppercase tracking-wide">
            <Clock className="w-5 h-5 text-[#F2C94C]" />
            <span>SEQUENTIAL ARENA QUEUE (READY)</span>
          </h2>
          <span className="text-xs text-[#F2C94C] font-mono font-bold">{readyQueue.length} On Deck</span>
        </div>

        {readyQueue.length === 0 ? (
          <div className="p-8 text-center arena-card text-xs text-[#F5F1E8]/60 font-mono">
            No matches currently waiting in the ready queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {readyQueue.map((match, idx) => (
              <div
                key={match._id}
                className="arena-card arena-card-hover p-5 space-y-3 rounded-2xl"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#2A313C]">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={match.category} />
                    <span className="font-mono text-[#F5F1E8]/70">{match.roundName}</span>
                  </div>
                  <StatusBadge status={match.status} queuePosition={match.queuePosition || idx + 1} />
                </div>

                <div className="flex items-center justify-between py-1 text-sm font-bold text-white">
                  <span className="truncate pr-2">{match.team1?.name}</span>
                  <span className="text-[#F2C94C] font-mono px-2">vs</span>
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
          <div className="flex items-center justify-between border-b border-[#2A313C] pb-3">
            <h2 className="text-xl font-black font-display text-white flex items-center gap-2 uppercase tracking-wide">
              <Trophy className="w-5 h-5 text-[#F2C94C]" />
              <span>RECENT RESULTS</span>
            </h2>
            <Link href="/results" className="text-xs font-mono font-bold text-[#F2C94C] hover:underline uppercase">
              View All Results →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div key={m._id} className="arena-card p-5 space-y-2.5 rounded-2xl">
                <div className="flex items-center justify-between text-[11px] text-[#F5F1E8]/70 font-mono">
                  <CategoryBadge category={m.category} />
                  <span>M#{m.matchNumber}</span>
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
