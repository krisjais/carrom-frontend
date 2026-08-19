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
import { useToast } from '@/context/ToastContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const toast = useToast();
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
      toast.error(err.message || 'Failed to start match.');
      fetchDashboardData();
    } finally {
      setStartingMatchId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="py-24 text-center text-xs text-[#D4DEEE] flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-[#FFD691]" />
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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#35538C]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono text-[#FFD691] font-bold uppercase tracking-widest">
              Single-Arena Tournament Desk
            </span>
            <MainBoardBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
            Admin Arena Control
          </h1>
          <p className="text-xs text-[#D4DEEE]">
            Sequential match scheduling, live scorekeeper desk, and FIFO ready queue management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1E3258] border border-[#35538C] hover:border-[#D7A859] text-xs font-bold text-[#D4DEEE] hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/matches"
            className="px-4 py-2.5 rounded-xl bg-[#1E3258] border border-[#35538C] hover:border-[#D7A859] text-xs font-bold text-white transition-colors"
          >
            All Fixtures
          </Link>
          <Link
            href="/admin/draws"
            className="px-5 py-2.5 rounded-xl btn-cream text-xs font-black shadow-md transition-colors"
          >
            Draws & Brackets
          </Link>
        </div>
      </div>

      {/* 2. PROMINENT ARENA MATCH CONTROL (CURRENT MATCH & NEXT MATCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT MATCH CARD */}
        <div className={`sport-card p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-3xl border-2 ${
          currentMatch ? 'border-emerald-500/60 bg-gradient-to-br from-[#1E3258] to-[#152442]' : 'border-[#35538C]'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#35538C]">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${currentMatch ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                <h2 className="text-base font-bold font-display text-white uppercase tracking-wider">
                  CURRENT MATCH (LIVE)
                </h2>
              </div>
              <MainBoardBadge />
            </div>

            {currentMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={currentMatch.category} />
                  <span className="font-mono text-[#FFD691] font-bold">{currentMatch.roundName} · Match #{currentMatch.matchNumber}</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#152442] border border-[#35538C] space-y-3">
                  <div className="grid grid-cols-3 items-center text-center gap-2">
                    <div className="text-left font-black text-white text-sm truncate">
                      {currentMatch.team1?.name}
                    </div>
                    <div>
                      <div className="w-10 h-10 rounded-full bg-[#1E3258] border border-[#D7A859]/50 text-xs font-mono font-black text-[#FFD691] flex items-center justify-center mx-auto">
                        VS
                      </div>
                      <span className="text-[9px] text-[#D4DEEE] uppercase font-bold mt-1 block">Knockout</span>
                    </div>
                    <div className="text-right font-black text-white text-sm truncate">
                      {currentMatch.team2?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Main Carrom Board is in play · Scorekeeper active</span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1E3258] text-[#FFD691] flex items-center justify-center mx-auto">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Main Carrom Board is Free</h3>
                  <p className="text-xs text-[#D4DEEE]">
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
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>OPEN SCOREKEEPER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : nextMatch && (!readiness || readiness.canStart) ? (
              <button
                onClick={() => handleStartMatch(nextMatch._id)}
                disabled={startingMatchId === nextMatch._id}
                className="w-full py-3.5 rounded-2xl btn-cream text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{startingMatchId === nextMatch._id ? 'Starting...' : 'START NEXT MATCH NOW'}</span>
              </button>
            ) : (
              <div className="text-center text-xs text-[#D4DEEE] py-2 italic font-mono">
                {readyQueue.length === 0 ? 'No matches ready in queue' : 'Awaiting start requirements'}
              </div>
            )}
          </div>
        </div>

        {/* NEXT MATCH CARD */}
        <div className="sport-card p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-3xl border-[#35538C]">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#35538C]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFD691]" />
                <h2 className="text-base font-bold font-display text-white uppercase tracking-wider">
                  NEXT MATCH
                </h2>
              </div>
              {nextMatch && (
                <span className="text-[11px] font-mono px-3 py-0.5 rounded-full bg-[#FFD691]/15 text-[#FFD691] border border-[#FFD691]/30 font-bold">
                  Queue Position #1
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={nextMatch.category} />
                  <span className="font-mono text-[#FFD691] font-bold">{nextMatch.roundName} · Match #{nextMatch.matchNumber}</span>
                </div>

                <div className="p-5 rounded-2xl bg-[#152442] border border-[#35538C] space-y-3">
                  <div className="flex items-center justify-between text-sm font-bold text-white">
                    <span className="truncate max-w-[180px]">{nextMatch.team1?.name}</span>
                    <span className="text-xs text-[#D7A859] uppercase font-mono font-bold px-2">VS</span>
                    <span className="truncate max-w-[180px] text-right">{nextMatch.team2?.name}</span>
                  </div>

                  <div className="pt-2 border-t border-[#35538C] flex items-center justify-between text-xs">
                    <span className="text-[#D4DEEE]">Estimated Start:</span>
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
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                      <Timer className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Waiting for Current Match on Main Carrom Board to complete.</span>
                    </div>
                  ) : readiness && !readiness.canStart ? (
                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                      <Timer className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{readiness.reason}</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>All players rested & Main Carrom Board ready!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1E3258] text-[#D4DEEE] flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No Next Match in Ready Queue</h3>
                  <p className="text-xs text-[#D4DEEE]">
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
                className="w-full py-3.5 rounded-2xl btn-cream text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
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

      {/* 3. FOUR TOURNAMENT OVERVIEW STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sport-card p-5 space-y-1 rounded-2xl">
          <span className="text-[11px] text-[#D4DEEE] font-semibold uppercase">Total Participants</span>
          <div className="text-3xl font-black font-mono text-white">
            {stats?.totalParticipants || 0}
          </div>
          <span className="text-[10px] text-emerald-300 font-bold block">
            {stats?.maleParticipants || 0} Boys · {stats?.femaleParticipants || 0} Girls
          </span>
        </div>

        <div className="sport-card p-5 space-y-1 rounded-2xl">
          <span className="text-[11px] text-[#D4DEEE] font-semibold uppercase">Approved Entries</span>
          <div className="text-3xl font-black font-mono text-[#FFD691]">
            {stats?.totalTeams || 0}
          </div>
          <span className="text-[10px] text-[#D4DEEE] block">Across 5 Divisions</span>
        </div>

        <div className="sport-card p-5 space-y-1 rounded-2xl">
          <span className="text-[11px] text-[#D4DEEE] font-semibold uppercase">Main Carrom Board</span>
          <div className={`text-xl font-black font-mono ${isBoardOccupied ? 'text-emerald-400' : 'text-[#FFD691]'}`}>
            {isBoardOccupied ? 'LIVE IN PLAY' : 'AVAILABLE'}
          </div>
          <span className="text-[10px] text-[#D4DEEE] block">
            {readyQueue.length} Matches in READY Queue
          </span>
        </div>

        <div className="sport-card p-5 space-y-1 rounded-2xl">
          <span className="text-[11px] text-[#D4DEEE] font-semibold uppercase">Completed Matches</span>
          <div className="text-3xl font-black font-mono text-white">
            {stats?.completedMatches || 0}
          </div>
          <span className="text-[10px] text-[#D4DEEE] block">Results Confirmed</span>
        </div>
      </div>

      {/* 4. READY QUEUE & UPCOMING MATCHES LIST */}
      <div className="sport-card p-6 space-y-4 rounded-3xl border border-[#35538C]">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#35538C]">
          <div>
            <h3 className="font-bold text-white text-base font-display flex items-center gap-2">
              <span>Main Carrom Board — READY Queue</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFD691]/15 text-[#FFD691] font-mono text-xs border border-[#FFD691]/30 font-bold">
                {readyQueue.length} Ready
              </span>
            </h3>
            <p className="text-xs text-[#D4DEEE]">
              FIFO sequential queue of matches with determined opponents waiting for Main Carrom Board.
            </p>
          </div>

          <Link
            href="/admin/matches"
            className="text-xs font-bold text-[#FFD691] hover:underline flex items-center gap-1"
          >
            <span>Manage All Rounds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {readyQueue.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#D4DEEE] space-y-1">
            <p>No matches currently waiting in the READY queue.</p>
            {waitingCount > 0 && (
              <p className="text-amber-400 font-semibold">
                {waitingCount} subsequent round matches are currently WAITING for previous-round winners.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#35538C] text-[#D4DEEE] font-bold uppercase text-[11px]">
                <tr>
                  <th className="pb-3">Queue #</th>
                  <th className="pb-3">Category & Match</th>
                  <th className="pb-3">Opponents</th>
                  <th className="pb-3">Est. Start Time</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#35538C]/60">
                {readyQueue.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-[#1E3258]/50 transition-colors">
                    <td className="py-3.5 font-mono font-bold text-[#FFD691]">
                      #{m.queuePosition || idx + 1}
                    </td>
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <CategoryBadge category={m.category} />
                        <span className="text-[10px] text-[#D4DEEE] block font-mono">
                          {m.roundName} · M#{m.matchNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 font-bold text-white">
                      <span>{m.team1?.name}</span>
                      <span className="text-[#D7A859] mx-2 font-mono text-[10px]">vs</span>
                      <span>{m.team2?.name}</span>
                    </td>
                    <td className="py-3.5 font-mono text-[#D4DEEE]">
                      {m.scheduledTime
                        ? new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Sequential'}
                    </td>
                    <td className="py-3.5">
                      <StatusBadge status={m.status} queuePosition={m.queuePosition || idx + 1} />
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/admin/matches/${m._id}/score`}
                        className="px-3.5 py-1.5 rounded-xl bg-[#1E3258] border border-[#D7A859]/50 hover:border-[#FFD691] text-xs font-bold text-[#FFD691] transition-colors"
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
        <div className="sport-card p-6 space-y-4 rounded-3xl border border-[#35538C]">
          <div className="flex items-center justify-between pb-3 border-b border-[#35538C]">
            <div>
              <h3 className="font-bold text-white text-base font-display">Completed Matches</h3>
              <p className="text-xs text-[#D4DEEE]">Recently confirmed match results on Main Carrom Board</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div key={m._id} className="p-4 rounded-2xl bg-[#152442] border border-[#35538C] space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#35538C]">
                  <CategoryBadge category={m.category} />
                  <span className="font-mono text-[#D4DEEE]">M#{m.matchNumber}</span>
                </div>

                <div className="text-xs font-bold text-white">
                  <div className={m.winnerTeam?._id === m.team1?._id ? 'text-[#FFD691]' : ''}>
                    {m.team1?.name}
                  </div>
                  <div className={m.winnerTeam?._id === m.team2?._id ? 'text-[#FFD691]' : ''}>
                    {m.team2?.name}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#35538C] flex items-center justify-between text-[10px] text-emerald-300 font-bold">
                  <span>Winner: {m.winnerTeam?.name || 'Confirmed'}</span>
                  <Link href={`/admin/matches/${m._id}/score`} className="text-[#FFD691] hover:underline">
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
