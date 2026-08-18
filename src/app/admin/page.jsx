'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import {
  Activity,
  Play,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Sparkles,
  Layers,
  Users,
  Timer
} from 'lucide-react';
import { CategoryBadge, StatusBadge, MainBoardBadge } from '@/components/ui/Badge';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [arenaState, setArenaState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingMatchId, setStartingMatchId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, arenaRes] = await Promise.all([
        api.getOverviewStats(),
        api.getLiveMatches()
      ]);
      if (statsRes.success) setStats(statsRes.stats);
      if (arenaRes.success) setArenaState(arenaRes);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleStartMatch = async (matchId) => {
    setStartingMatchId(matchId);
    try {
      const res = await api.startMatch(matchId);
      if (res.success) {
        router.push(`/admin/matches/${matchId}/score`);
      }
    } catch (err) {
      alert(err.message || 'Failed to start match.');
      fetchDashboardData();
    } finally {
      setStartingMatchId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="py-24 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
        <span>Loading tournament arena desk...</span>
      </div>
    );
  }

  const currentMatch = arenaState?.currentMatch;
  const nextMatch = arenaState?.nextMatch;
  const readiness = arenaState?.nextMatchReadiness;
  const readyQueue = arenaState?.readyQueue || [];
  const completedMatches = arenaState?.completedMatches || [];
  const waitingCount = arenaState?.waitingMatchesCount || 0;
  const isBoardOccupied = Boolean(currentMatch);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1C2B48]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-[#D4AF37] font-bold uppercase tracking-widest">
              Single-Arena Tournament Desk
            </span>
            <MainBoardBadge />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
            Admin Arena Control
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Sequential match scheduling, live scorekeeper desk, and FIFO ready queue management.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0E1626] border border-[#1C2B48] hover:border-[#D4AF37]/50 text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/matches"
            className="px-4 py-2 rounded-xl bg-[#0E1626] border border-[#1C2B48] hover:border-[#D4AF37]/50 text-xs font-semibold text-white transition-colors"
          >
            All Fixtures
          </Link>
          <Link
            href="/admin/draws"
            className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] text-xs font-bold shadow-sm transition-colors"
          >
            Draws & Brackets
          </Link>
        </div>
      </div>

      {/* 2. PROMINENT ARENA MATCH CONTROL (CURRENT MATCH & NEXT MATCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT MATCH CARD */}
        <div className={`sport-card p-6 flex flex-col justify-between space-y-5 border-2 ${
          currentMatch ? 'border-emerald-500/50 bg-gradient-to-b from-[#0E1626] to-[#070B16]' : 'border-[#1C2B48]'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2B48]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentMatch ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <h2 className="text-base font-bold font-display text-white uppercase tracking-wider">
                  CURRENT MATCH
                </h2>
              </div>
              <MainBoardBadge />
            </div>

            {currentMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={currentMatch.category} />
                  <span className="font-mono text-[#D4AF37] font-semibold">{currentMatch.roundName} · Match #{currentMatch.matchNumber}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-3">
                  <div className="grid grid-cols-3 items-center text-center gap-2">
                    <div className="text-left font-bold text-white text-sm truncate">
                      {currentMatch.team1?.name}
                    </div>
                    <div>
                      <div className="font-mono text-3xl font-black text-[#D4AF37]">
                        {currentMatch.finalScore?.team1BoardsWon || 0} - {currentMatch.finalScore?.team2BoardsWon || 0}
                      </div>
                      <span className="text-[9px] text-[#64748B] uppercase font-semibold">Boards Won</span>
                    </div>
                    <div className="text-right font-bold text-white text-sm truncate">
                      {currentMatch.team2?.name}
                    </div>
                  </div>

                  {/* Active Board preview */}
                  {currentMatch.boards && (
                    <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-[11px] text-[#94A3B8]">
                      <span>Board in play:</span>
                      <span className="font-mono font-bold text-white">
                        {(() => {
                          const active = currentMatch.boards.find((b) => b.boardWinner === null) || currentMatch.boards[0];
                          return `Board ${active.boardNumber}: ${active.team1Score} pts vs ${active.team2Score} pts`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Main Carrom Board is in play · Scorekeeper active</span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#141F36] text-slate-400 flex items-center justify-center mx-auto">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Main Carrom Board is Free</h3>
                  <p className="text-xs text-[#94A3B8]">
                    No match is currently live. The arena is ready for the Next Match.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            {currentMatch ? (
              <Link
                href={`/admin/matches/${currentMatch._id}/score`}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-colors"
              >
                <span>OPEN SCOREKEEPER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : nextMatch && (!readiness || readiness.canStart) ? (
              <button
                onClick={() => handleStartMatch(nextMatch._id)}
                disabled={startingMatchId === nextMatch._id}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] text-[#070B16] font-bold text-xs shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{startingMatchId === nextMatch._id ? 'Starting...' : 'START NEXT MATCH NOW'}</span>
              </button>
            ) : (
              <div className="text-center text-xs text-[#64748B] py-2 italic font-mono">
                {readyQueue.length === 0 ? 'No matches ready in queue' : 'Awaiting start requirements'}
              </div>
            )}
          </div>
        </div>

        {/* NEXT MATCH CARD */}
        <div className="sport-card p-6 flex flex-col justify-between space-y-5 border-[#1C2B48]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1C2B48]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                <h2 className="text-base font-bold font-display text-white uppercase tracking-wider">
                  NEXT MATCH
                </h2>
              </div>
              {nextMatch && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-bold">
                  Queue Position #1
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={nextMatch.category} />
                  <span className="font-mono text-[#D4AF37] font-semibold">{nextMatch.roundName} · Match #{nextMatch.matchNumber}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold text-white">
                    <span className="truncate max-w-[180px]">{nextMatch.team1?.name}</span>
                    <span className="text-xs text-[#64748B] uppercase font-mono font-semibold px-2">VS</span>
                    <span className="truncate max-w-[180px] text-right">{nextMatch.team2?.name}</span>
                  </div>

                  <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-xs">
                    <span className="text-[#94A3B8]">Estimated Start:</span>
                    <span className="font-mono text-white font-bold">
                      {nextMatch.scheduledTime
                        ? new Date(nextMatch.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Next in Queue'}
                    </span>
                  </div>
                </div>

                {/* Rest / Readiness indicator */}
                <div className="text-xs">
                  {isBoardOccupied ? (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                      <Timer className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Waiting for Current Match on Main Carrom Board to complete.</span>
                    </div>
                  ) : readiness && !readiness.canStart ? (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                      <Timer className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{readiness.reason}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>All players rested & Main Carrom Board ready!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#141F36] text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No Next Match in Ready Queue</h3>
                  <p className="text-xs text-[#94A3B8]">
                    {waitingCount > 0
                      ? `${waitingCount} matches are waiting for previous-round results.`
                      : 'Generate category draws to create tournament fixtures.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            {nextMatch && (
              <button
                onClick={() => handleStartMatch(nextMatch._id)}
                disabled={isBoardOccupied || (readiness && !readiness.canStart) || startingMatchId === nextMatch._id}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#E5C358] disabled:bg-[#1C2B48] disabled:text-[#64748B] text-[#070B16] font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {startingMatchId === nextMatch._id
                    ? 'Starting Match...'
                    : isBoardOccupied
                    ? 'START MATCH (BOARD OCCUPIED)'
                    : readiness && !readiness.canStart
                    ? 'START MATCH (PLAYERS RESTING)'
                    : 'START MATCH'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOUR TOURNAMENT OVERVIEW STATS (NO MULTIPLE BOARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sport-card p-5 space-y-1">
          <span className="text-[11px] text-[#94A3B8] font-semibold uppercase">Total Participants</span>
          <div className="text-3xl font-bold font-mono text-white">
            {stats?.totalParticipants || 0}
          </div>
          <span className="text-[10px] text-emerald-400 font-medium block">
            {stats?.maleParticipants || 0} Boys · {stats?.femaleParticipants || 0} Girls
          </span>
        </div>

        <div className="sport-card p-5 space-y-1">
          <span className="text-[11px] text-[#94A3B8] font-semibold uppercase">Approved Tournament Entries</span>
          <div className="text-3xl font-bold font-mono text-[#D4AF37]">
            {stats?.totalTeams || 0}
          </div>
          <span className="text-[10px] text-[#94A3B8] block">Across 5 Divisions (Total: {stats?.totalTeams || 0})</span>
        </div>

        <div className="sport-card p-5 space-y-1">
          <span className="text-[11px] text-[#94A3B8] font-semibold uppercase">Main Carrom Board</span>
          <div className={`text-xl font-bold font-mono ${isBoardOccupied ? 'text-emerald-400' : 'text-blue-400'}`}>
            {isBoardOccupied ? 'LIVE IN PLAY' : 'AVAILABLE'}
          </div>
          <span className="text-[10px] text-[#94A3B8] block">
            {readyQueue.length} Matches in READY Queue
          </span>
        </div>

        <div className="sport-card p-5 space-y-1">
          <span className="text-[11px] text-[#94A3B8] font-semibold uppercase">Completed Matches</span>
          <div className="text-3xl font-bold font-mono text-slate-300">
            {stats?.completedMatches || 0}
          </div>
          <span className="text-[10px] text-[#94A3B8] block">Results Confirmed</span>
        </div>
      </div>

      {/* 3.1 DYNAMIC CATEGORY BREAKDOWN (TOTAL APPROVED TOURNAMENT ENTRIES = 35) */}
      <div className="sport-card p-5 space-y-3 border border-[#1C2B48]">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#1C2B48]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider font-display">
              Approved Tournament Entries Breakdown
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-lg border border-[#D4AF37]/20">
            Total: {stats?.totalTeams || 0} Entries
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1">
            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Boys Singles</span>
            <div className="text-xl font-mono font-bold text-white">
              {stats?.categories?.boys_singles?.teams || 0}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">10 Players</span>
          </div>

          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1">
            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Girls Singles</span>
            <div className="text-xl font-mono font-bold text-white">
              {stats?.categories?.girls_singles?.teams || 0}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">8 Players</span>
          </div>

          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1">
            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Boys Doubles</span>
            <div className="text-xl font-mono font-bold text-white">
              {stats?.categories?.boys_doubles?.teams || 0}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">5 Teams (10 Players)</span>
          </div>

          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1">
            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Girls Doubles</span>
            <div className="text-xl font-mono font-bold text-white">
              {stats?.categories?.girls_doubles?.teams || 0}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">4 Teams (8 Players)</span>
          </div>

          <div className="p-3 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-1">
            <span className="text-[10px] text-[#94A3B8] uppercase font-semibold block">Mixed Doubles</span>
            <div className="text-xl font-mono font-bold text-[#D4AF37]">
              {stats?.categories?.mixed_doubles?.teams || 0}
            </div>
            <span className="text-[10px] text-slate-400 block font-mono">8 Teams (16 Players)</span>
          </div>
        </div>
      </div>

      {/* 4. READY QUEUE & UPCOMING MATCHES LIST */}
      <div className="sport-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1C2B48]">
          <div>
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <span>Main Carrom Board — READY Queue</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono text-xs border border-blue-500/20">
                {readyQueue.length} Ready
              </span>
            </h3>
            <p className="text-xs text-[#94A3B8]">
              FIFO sequential queue of matches with determined opponents waiting for Main Carrom Board.
            </p>
          </div>

          <Link
            href="/admin/matches"
            className="text-xs font-semibold text-[#D4AF37] hover:underline flex items-center gap-1"
          >
            <span>Manage All Rounds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {readyQueue.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#94A3B8] space-y-1">
            <p>No matches currently waiting in the READY queue.</p>
            {waitingCount > 0 && (
              <p className="text-amber-400">
                {waitingCount} subsequent round matches are currently WAITING for previous-round winners.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#1C2B48] text-[#94A3B8] font-semibold uppercase text-[11px]">
                <tr>
                  <th className="pb-3">Queue #</th>
                  <th className="pb-3">Category & Match</th>
                  <th className="pb-3">Opponents</th>
                  <th className="pb-3">Est. Start Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1C2B48]/60">
                {readyQueue.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-[#141F36]/40">
                    <td className="py-3 font-mono font-bold text-[#D4AF37]">
                      #{m.queuePosition || idx + 1}
                    </td>
                    <td className="py-3">
                      <div className="space-y-0.5">
                        <CategoryBadge category={m.category} />
                        <span className="text-[10px] text-[#94A3B8] block font-mono">
                          {m.roundName} · M#{m.matchNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-medium text-white">
                      <span className="text-slate-200">{m.team1?.name}</span>
                      <span className="text-[#64748B] mx-2 font-mono text-[10px]">vs</span>
                      <span className="text-slate-200">{m.team2?.name}</span>
                    </td>
                    <td className="py-3 font-mono text-slate-300">
                      {m.scheduledTime
                        ? new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Sequential'}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={m.status} queuePosition={m.queuePosition || idx + 1} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/matches/${m._id}/score`}
                        className="px-3 py-1.5 rounded-lg bg-[#070B16] border border-[#1C2B48] hover:border-[#D4AF37]/50 text-xs font-semibold text-[#D4AF37] transition-colors"
                      >
                        Score Desk →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. RECENTLY COMPLETED MATCHES */}
      {completedMatches.length > 0 && (
        <div className="sport-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1C2B48]">
            <div>
              <h3 className="font-bold text-white text-base font-display">Completed Matches</h3>
              <p className="text-xs text-[#94A3B8]">Recently confirmed match results on Main Carrom Board</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div key={m._id} className="p-4 rounded-xl bg-[#070B16] border border-[#1C2B48] space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-[#1C2B48]">
                  <CategoryBadge category={m.category} />
                  <span className="font-mono text-[#94A3B8]">M#{m.matchNumber}</span>
                </div>

                <div className="text-xs font-bold text-white">
                  <div className={m.winnerTeam?._id === m.team1?._id ? 'text-[#D4AF37]' : ''}>
                    {m.team1?.name} ({m.finalScore?.team1BoardsWon || 0})
                  </div>
                  <div className={m.winnerTeam?._id === m.team2?._id ? 'text-[#D4AF37]' : ''}>
                    {m.team2?.name} ({m.finalScore?.team2BoardsWon || 0})
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1C2B48] flex items-center justify-between text-[10px] text-emerald-400 font-semibold">
                  <span>Winner: {m.winnerTeam?.name || 'Confirmed'}</span>
                  <Link href={`/admin/matches/${m._id}/score`} className="text-[#94A3B8] hover:text-white">
                    Scorecard →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
