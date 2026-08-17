'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Activity, Crown, Clock, RefreshCw, Trophy, CheckCircle2, Play, Timer } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <MainBoardBadge />
          <span className="text-[11px] font-mono text-[#D4AF37] font-bold uppercase tracking-widest">
            Single Physical Board Arena
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Live Arena Match Center
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Real-time scorecards and sequential queue tracking on the Main Carrom Board.
        </p>
      </div>

      {/* 1. CURRENT MATCH SPOTLIGHT */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-display text-white flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${currentMatch ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            <span>CURRENT MATCH (LIVE)</span>
          </h2>
          <span className="text-xs text-[#64748B] flex items-center gap-1 font-mono">
            <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />
            <span>Live Stream</span>
          </span>
        </div>

        {currentMatch ? (
          <div className="sport-card p-6 sm:p-8 space-y-6 border-2 border-emerald-500/50 bg-gradient-to-b from-[#0E1626] to-[#070B16]">
            {/* Top line */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1C2B48] text-xs">
              <div className="flex items-center gap-2">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="font-mono text-[#D4AF37] font-semibold">{currentMatch.roundName}</span>
              </div>
              <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                LIVE IN PLAY
              </span>
            </div>

            {/* Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-white text-base sm:text-lg truncate">{currentMatch.team1?.name}</h4>
                <span className="text-[11px] text-[#94A3B8]">Player / Team 1</span>
              </div>

              <div>
                <div className="font-mono text-4xl sm:text-5xl font-black text-[#D4AF37]">
                  {currentMatch.finalScore?.team1BoardsWon || 0} - {currentMatch.finalScore?.team2BoardsWon || 0}
                </div>
                <span className="text-[10px] text-[#64748B] uppercase font-semibold">Boards Won (Best of 3)</span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-base sm:text-lg truncate">{currentMatch.team2?.name}</h4>
                <span className="text-[11px] text-[#94A3B8]">Player / Team 2</span>
              </div>
            </div>

            {/* Boards strip */}
            {currentMatch.boards && (
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {currentMatch.boards.map((b) => {
                  const isActive = b.boardWinner === null && (!currentMatch.boards[b.boardNumber - 2] || currentMatch.boards[b.boardNumber - 2].boardWinner);
                  return (
                    <div
                      key={b.boardNumber}
                      className={`p-3 rounded-xl border ${
                        isActive
                          ? 'bg-[#070B16] border-[#D4AF37] shadow-sm'
                          : 'bg-[#070B16]/50 border-[#1C2B48]'
                      }`}
                    >
                      <span className="text-[10px] text-[#94A3B8] block font-mono font-semibold">Board {b.boardNumber}</span>
                      <span className="font-mono font-bold text-white text-sm">{b.team1Score} - {b.team2Score} pts</span>
                      {b.boardWinner ? (
                        <span className="text-[10px] text-[#D4AF37] block font-semibold">
                          {b.boardWinner === 'team1' ? currentMatch.team1?.name?.split(' ')[0] : currentMatch.team2?.name?.split(' ')[0]} Won
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-400 block font-mono">In Progress</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active board Queen & Fouls info */}
            {(() => {
              const activeBoard = currentMatch.boards?.find((b) => b.boardWinner === null) || currentMatch.boards?.[0];
              if (!activeBoard) return null;
              return (
                <div className="pt-3 border-t border-[#1C2B48] flex flex-wrap items-center justify-between gap-2 text-xs text-[#94A3B8]">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-red-400" />
                    <span>
                      {activeBoard.queenPocketedBy === 'none'
                        ? 'Queen is on the board'
                        : `${activeBoard.queenPocketedBy === 'team1' ? currentMatch.team1?.name : currentMatch.team2?.name} pocketed Queen ${activeBoard.queenCovered ? '(Covered)' : '(Not covered)'}`}
                    </span>
                  </div>
                  <div className="font-mono text-[11px]">
                    Fouls: {currentMatch.team1?.name?.split(' ')[0]} ({activeBoard.team1Fouls}) • {currentMatch.team2?.name?.split(' ')[0]} ({activeBoard.team2Fouls})
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="p-12 text-center sport-card space-y-2">
            <Activity className="w-8 h-8 text-[#64748B] mx-auto" />
            <h3 className="text-sm font-bold text-white">Main Carrom Board is Currently Free</h3>
            <p className="text-xs text-[#94A3B8]">
              {nextMatch ? `Next match is scheduled to start soon: ${nextMatch.team1?.name} vs ${nextMatch.team2?.name}.` : 'No active matches at the moment.'}
            </p>
          </div>
        )}
      </section>

      {/* 2. NEXT MATCH ON MAIN CARROM BOARD */}
      {nextMatch && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span>NEXT MATCH (Queue Position #1)</span>
          </h2>

          <div className="sport-card p-5 space-y-3 border-blue-500/30">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-[#1C2B48]">
              <div className="flex items-center gap-2">
                <CategoryBadge category={nextMatch.category} />
                <span className="font-mono text-[#D4AF37]">{nextMatch.roundName}</span>
              </div>
              <div className="font-mono text-slate-300">
                Est. Start:{' '}
                {nextMatch.scheduledTime
                  ? new Date(nextMatch.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Immediately after current match'}
              </div>
            </div>

            <div className="flex items-center justify-between text-sm font-bold text-white">
              <span className="truncate">{nextMatch.team1?.name}</span>
              <span className="text-xs text-[#64748B] uppercase font-mono px-3">VS</span>
              <span className="truncate text-right">{nextMatch.team2?.name}</span>
            </div>
          </div>
        </section>
      )}

      {/* 3. READY QUEUE */}
      {readyQueue.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>Upcoming READY Queue (Main Carrom Board)</span>
            </h2>
            <span className="text-xs text-[#94A3B8] font-mono">{readyQueue.length} Matches</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {readyQueue.map((m, idx) => (
              <div key={m._id} className="sport-card p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-[#1C2B48]">
                  <span className="font-mono font-bold text-[#D4AF37]">Queue #{m.queuePosition || idx + 1}</span>
                  <CategoryBadge category={m.category} />
                </div>
                <div className="text-xs font-bold text-white truncate">{m.team1?.name}</div>
                <div className="text-[10px] text-[#64748B] font-mono">VS</div>
                <div className="text-xs font-bold text-white truncate">{m.team2?.name}</div>
                <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-[10px] text-[#94A3B8] font-mono">
                  <span>{m.roundName}</span>
                  <span>
                    {m.scheduledTime
                      ? new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Sequential'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. RECENT RESULTS */}
      {completedMatches.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
            <span>Recent Completed Matches</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedMatches.map((m) => (
              <div key={m._id} className="sport-card p-4 space-y-2 border-blue-500/20">
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-[#1C2B48]">
                  <CategoryBadge category={m.category} />
                  <span className="font-mono text-[#94A3B8]">{m.roundName}</span>
                </div>
                <div className="text-xs font-bold text-white">
                  <div className={m.winnerTeam?._id === m.team1?._id ? 'text-[#D4AF37]' : ''}>
                    {m.team1?.name} ({m.finalScore?.team1BoardsWon || 0})
                  </div>
                  <div className={m.winnerTeam?._id === m.team2?._id ? 'text-[#D4AF37]' : ''}>
                    {m.team2?.name} ({m.finalScore?.team2BoardsWon || 0})
                  </div>
                </div>
                <div className="pt-1.5 border-t border-[#1C2B48] text-[10px] text-emerald-400 font-semibold">
                  Winner: {m.winnerTeam?.name}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
