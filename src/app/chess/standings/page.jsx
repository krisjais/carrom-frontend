'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessFooter } from '@/components/chess/ChessFooter';
import {
  History,
  Swords,
  Crown,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import Link from 'next/link';

const formatClock = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getPublicVictoryDetails = (match) => {
  if (match.status !== 'completed') {
    if (match.status === 'live') {
      return {
        label: 'Live Duel In Progress',
        color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40',
        scoreText: 'LIVE',
        icon: '⚡'
      };
    }
    return {
      label: 'Scheduled Match',
      color: 'text-[#77736B] dark:text-[#8E8E93] bg-[#EFEAE1]/50 dark:bg-[#1E1E1C] border-[#D5CFC5]/50 dark:border-[#2E2E2B]',
      scoreText: 'VS',
      icon: '⏳'
    };
  }

  const winnerName =
    match.winner === 'player1'
      ? match.player1?.fullName || 'White Player'
      : match.winner === 'player2'
      ? match.player2?.fullName || 'Black Player'
      : null;

  if (match.winner === 'draw' || match.resultType === 'draw_agreed') {
    return {
      label: 'Draw by Agreement',
      color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
      scoreText: '½ - ½',
      icon: '🤝'
    };
  }

  const scoreText = match.winner === 'player1' ? '1 - 0' : match.winner === 'player2' ? '0 - 1' : '½ - ½';

  switch (match.resultType) {
    case 'checkmate':
      return {
        label: `${winnerName} won by Checkmate`,
        color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
        scoreText,
        icon: '👑'
      };
    case 'time_out':
      return {
        label: `${winnerName} won on Time (Timeout)`,
        color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
        scoreText,
        icon: '⏱️'
      };
    case 'resignation':
      return {
        label: `${winnerName} won by Resignation`,
        color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/40',
        scoreText,
        icon: '🏳️'
      };
    default:
      return {
        label: `${winnerName || 'Winner'} claimed Victory`,
        color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
        scoreText,
        icon: '🏆'
      };
  }
};

export default function ChessPublicStandingsPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  async function loadMatches() {
    setLoading(true);
    try {
      const res = await chessApi.getMatches();
      if (res.success && res.data) {
        const sorted = [...res.data].sort((a, b) => {
          if (a.status === 'completed' && b.status !== 'completed') return -1;
          if (b.status === 'completed' && a.status !== 'completed') return 1;
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return 1;
          return new Date(b.updatedAt || b.actualEndTime || b.createdAt) - new Date(a.updatedAt || a.actualEndTime || a.createdAt);
        });
        setMatches(sorted);
      } else {
        setMatches([]);
      }
    } catch (err) {
      console.error('Error loading matches history:', err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
  }, []);

  const uniqueStages = useMemo(() => {
    const set = new Set();
    matches.forEach((m) => {
      if (m.roundName) set.add(m.roundName);
      else if (m.round) set.add(`Round ${m.round}`);
    });
    return Array.from(set);
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (stageFilter !== 'all') {
        const stageName = m.roundName || `Round ${m.round}`;
        if (stageName !== stageFilter) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mId = (m.matchId || '').toLowerCase();
        const rName = (m.roundName || `round ${m.round}`).toLowerCase();
        const p1Name = (m.player1?.fullName || '').toLowerCase();
        const p2Name = (m.player2?.fullName || '').toLowerCase();
        return mId.includes(q) || rName.includes(q) || p1Name.includes(q) || p2Name.includes(q);
      }
      return true;
    });
  }, [matches, stageFilter, search]);

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        
        {/* Editorial Header Banner */}
        <div className="relative overflow-hidden bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-6 sm:p-12 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-[#FAF8F3]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#8E8E93] font-semibold">
                  OFFICIAL CHAMPIONSHIP ARCHIVE
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.1]">
                Chess Match History
              </h1>
              <p className="text-xs sm:text-sm text-[#4E4C47] dark:text-[#9E9B93] mt-3 font-sans leading-relaxed">
                Official archive of all concluded duels, checkmates, time-control results, and championship tournament outcomes.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadMatches}
                className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77736B]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by player name or match ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#F5F2EB] dark:bg-[#1A1A18] text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736B]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-full sm:w-56">
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#F5F2EB] dark:bg-[#1A1A18] text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none cursor-pointer"
            >
              <option value="all">All Stages & Rounds</option>
              {uniqueStages.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matches Feed */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#FAF8F3]/60 dark:bg-[#151514]/60 border border-[#D5CFC5]/50 dark:border-[#262624]/50 rounded-2xl p-6 h-36"
              />
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-12 text-center space-y-3">
            <History className="w-8 h-8 mx-auto text-[#77736B]" />
            <h3 className="font-serif font-bold text-base">No Matches in History</h3>
            <p className="text-xs text-[#77736B] max-w-sm mx-auto">
              No concluded tournament matches match the criteria yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((m) => {
              const victory = getPublicVictoryDetails(m);
              const p1 = m.player1 || { fullName: 'TBD', playerId: 'CHS-???', department: 'Competitor' };
              const p2 = m.player2 || { fullName: 'TBD', playerId: 'CHS-???', department: 'Competitor' };
              const isP1Winner = m.status === 'completed' && m.winner === 'player1';
              const isP2Winner = m.status === 'completed' && m.winner === 'player2';

              return (
                <div
                  key={m._id || m.matchId}
                  className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 hover:border-[#171715]/40 dark:hover:border-[#FAF8F3]/40 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-3 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{m.matchId}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        🏆 {m.roundName || `Round ${m.round}`}
                      </span>
                      {m.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          Concluded
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#77736B]">
                      {m.actualEndTime ? new Date(m.actualEndTime).toLocaleDateString() : 'Championship'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                    {/* White */}
                    <div className={`md:col-span-5 p-3.5 rounded-xl border ${isP1Winner ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#F5F2EB]/50 dark:bg-[#1A1A18] border-[#D5CFC5]/50 dark:border-[#262624]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">♔</span>
                          <div>
                            <div className="text-[10px] font-mono uppercase text-[#77736B] font-bold">
                              White • {p1.playerId}
                            </div>
                            <h4 className="font-serif font-bold text-sm sm:text-base">
                              {p1.fullName}
                            </h4>
                          </div>
                        </div>
                        {isP1Winner && (
                          <span className="text-[9px] font-mono font-bold uppercase bg-amber-500 text-black px-1.5 py-0.5 rounded">
                            👑 Winner
                          </span>
                        )}
                      </div>
                    </div>

                    {/* VS */}
                    <div className="md:col-span-1 text-center font-mono font-bold text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-[#22221F] dark:bg-[#FAF8F3] text-white dark:text-black">
                        {victory.scoreText}
                      </span>
                    </div>

                    {/* Black */}
                    <div className={`md:col-span-5 p-3.5 rounded-xl border ${isP2Winner ? 'bg-amber-500/10 border-amber-500/40' : 'bg-[#F5F2EB]/50 dark:bg-[#1A1A18] border-[#D5CFC5]/50 dark:border-[#262624]'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">♚</span>
                          <div>
                            <div className="text-[10px] font-mono uppercase text-[#77736B] font-bold">
                              Black • {p2.playerId}
                            </div>
                            <h4 className="font-serif font-bold text-sm sm:text-base">
                              {p2.fullName}
                            </h4>
                          </div>
                        </div>
                        {isP2Winner && (
                          <span className="text-[9px] font-mono font-bold uppercase bg-amber-500 text-black px-1.5 py-0.5 rounded">
                            👑 Winner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold border ${victory.color}`}>
                      <span>{victory.icon}</span>
                      <span>{victory.label}</span>
                    </span>

                    <Link
                      href={`/chess/matches/${m._id}`}
                      className="text-xs font-semibold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>View Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <ChessFooter />
    </div>
  );
}
