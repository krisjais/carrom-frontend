'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Activity,
  Play,
  Clock,
  CheckCircle2,
  Trophy,
  RefreshCw,
  ArrowRight,
  Users,
  Timer,
  Square,
  Shield,
  Layers
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
  const [stoppingMatchId, setStoppingMatchId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, arenaRes] = await Promise.all([
        api.getOverviewStats().catch((err) => {
          console.warn('Overview stats fetch warning:', err.message);
          return { success: false, stats: null };
        }),
        api.getLiveMatches().catch((err) => {
          console.warn('Live matches fetch warning:', err.message);
          return { success: false, currentMatch: null, queue: [] };
        })
      ]);
      if (statsRes?.success && statsRes.stats) setStats(statsRes.stats);
      if (arenaRes?.success) setArenaState(arenaRes);
    } catch (err) {
      console.warn('Failed to load admin dashboard data:', err);
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

  const handleStopLive = async (matchId) => {
    if (!window.confirm('Are you sure you want to stop this live match? It will be reverted back to Scheduled queue and free up the Main Carrom Board.')) {
      return;
    }
    setStoppingMatchId(matchId);
    try {
      const res = await api.stopLiveMatch(matchId);
      if (res.success) {
        toast.success(res.message || 'Match stopped from LIVE and reverted to scheduled queue.');
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to stop live match.');
    } finally {
      setStoppingMatchId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#171614] dark:border-[#F7F4EC] border-t-transparent animate-spin" />
        <span className="text-xs font-mono uppercase tracking-widest text-[#857B6C]">Loading Arena Operations...</span>
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
    <div className="space-y-8 max-w-7xl mx-auto text-[#171614] dark:text-[#F7F4EC]">
      
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#DCD6C8] dark:border-[#2E2B25]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#857B6C] font-semibold">
              ARENA CONTROL DESK
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#171614] text-[#F7F4EC] dark:bg-[#F7F4EC] dark:text-[#171614] text-[10px] font-mono font-bold tracking-wider uppercase">
              MAIN BOARD
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#171614] dark:text-[#F7F4EC]">
            Tournament Operations
          </h1>
          <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] mt-1 font-sans">
            Sequential Board 1 referee scoring, automated bracket propagation, and ready queue management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#38342C] hover:bg-white dark:hover:bg-[#24221E] text-xs font-bold text-[#171614] dark:text-[#F7F4EC] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#857B6C]" />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/matches"
            className="px-4 py-2.5 rounded-xl bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#38342C] hover:bg-white dark:hover:bg-[#24221E] text-xs font-bold text-[#171614] dark:text-[#F7F4EC] transition-colors shadow-xs"
          >
            All Fixtures
          </Link>
          <Link
            href="/admin/draws"
            className="px-5 py-2.5 rounded-xl bg-[#171614] hover:bg-[#2A2824] dark:bg-[#F7F4EC] dark:hover:bg-white text-[#F7F4EC] dark:text-[#171614] text-xs font-bold tracking-wide uppercase transition-all shadow-md"
          >
            Draws & Brackets
          </Link>
        </div>
      </div>

      {/* 2. ARENA MATCH CONTROL (CURRENT MATCH & NEXT MATCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CURRENT MATCH (LIVE) CARD */}
        <div className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 border transition-all ${
          currentMatch
            ? 'bg-[#171614] text-[#F7F4EC] border-[#171614] shadow-xl'
            : 'bg-[#F7F4EC] dark:bg-[#1D1C19] text-[#171614] dark:text-[#F7F4EC] border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs'
        }`}>
          <div className="space-y-4">
            <div className={`flex items-center justify-between pb-3 border-b ${
              currentMatch ? 'border-white/10' : 'border-[#DCD6C8] dark:border-[#2E2B25]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D93829] animate-pulse" />
                <h2 className="text-sm font-serif font-bold uppercase tracking-wider">
                  CURRENT MATCH (LIVE ARENA)
                </h2>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                currentMatch ? 'bg-[#D93829] text-white' : 'bg-[#171614]/10 dark:bg-white/10 text-inherit'
              }`}>
                MAIN BOARD
              </span>
            </div>

            {currentMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={currentMatch.category} />
                  <span className="font-mono text-white/70 font-semibold">{currentMatch.roundName} · Match #{currentMatch.matchNumber}</span>
                </div>

                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="grid grid-cols-11 items-center text-center gap-2">
                    <div className="col-span-5 text-left font-serif font-bold text-lg text-white truncate">
                      {currentMatch.team1?.name}
                    </div>
                    <div className="col-span-1">
                      <span className="font-serif italic text-xs text-[#C2A268]">vs</span>
                    </div>
                    <div className="col-span-5 text-right font-serif font-bold text-lg text-white truncate">
                      {currentMatch.team2?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#C2A268] font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#C2A268] animate-ping" />
                  <span>Main Carrom Board is in play · Live referee desk active</span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#24221E] text-[#857B6C] flex items-center justify-center mx-auto border border-[#DCD6C8] dark:border-[#38342C]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold">Main Carrom Board is Free</h3>
                  <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] mt-1">
                    No fixture is currently in play. The arena is ready for the Next Match in queue.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            {currentMatch ? (
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                <Link
                  href={`/admin/matches/${currentMatch._id}/score`}
                  className="flex-1 w-full py-3 rounded-xl bg-[#F7F4EC] hover:bg-white text-[#171614] text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <span>Open Scorekeeper</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleStopLive(currentMatch._id)}
                  disabled={stoppingMatchId === currentMatch._id}
                  className="py-3 px-4 rounded-xl bg-white/10 hover:bg-[#D93829] text-white border border-white/20 hover:border-transparent text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  title="Stop live match if started mistakenly"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{stoppingMatchId === currentMatch._id ? 'Stopping...' : 'STOP LIVE'}</span>
                </button>
              </div>
            ) : nextMatch && (!readiness || readiness.canStart) ? (
              <button
                onClick={() => handleStartMatch(nextMatch._id)}
                disabled={startingMatchId === nextMatch._id}
                className="w-full py-3.5 rounded-xl bg-[#171614] hover:bg-[#2A2824] dark:bg-[#F7F4EC] dark:hover:bg-white text-[#F7F4EC] dark:text-[#171614] text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{startingMatchId === nextMatch._id ? 'Starting...' : 'Start Next Match Now'}</span>
              </button>
            ) : (
              <div className="text-center text-xs text-[#857B6C] py-2 italic font-mono">
                {readyQueue.length === 0 ? 'No matches ready in queue' : 'Awaiting start requirements'}
              </div>
            )}
          </div>
        </div>

        {/* NEXT MATCH ON-DECK CARD */}
        <div className="rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD6C8] dark:border-[#2E2B25]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#171614] dark:bg-[#C2A268]" />
                <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-[#171614] dark:text-[#F7F4EC]">
                  NEXT MATCH ON-DECK
                </h2>
              </div>
              {nextMatch && (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white dark:bg-[#24221E] text-[#171614] dark:text-[#F7F4EC] border border-[#DCD6C8] dark:border-[#38342C] font-bold">
                  Queue Position #1
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={nextMatch.category} />
                  <span className="font-mono text-[#171614] dark:text-[#F7F4EC] font-bold">{nextMatch.roundName} · Match #{nextMatch.matchNumber}</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] space-y-3">
                  <div className="grid grid-cols-11 items-center text-center gap-2">
                    <div className="col-span-5 text-left font-serif font-bold text-base text-[#171614] dark:text-[#F7F4EC] truncate">
                      {nextMatch.team1?.name}
                    </div>
                    <div className="col-span-1">
                      <span className="font-serif italic text-xs text-[#857B6C]">vs</span>
                    </div>
                    <div className="col-span-5 text-right font-serif font-bold text-base text-[#171614] dark:text-[#F7F4EC] truncate">
                      {nextMatch.team2?.name}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#DCD6C8]/80 dark:border-[#38342C] flex items-center justify-between text-xs text-[#6F6A60] dark:text-[#A8A194]">
                    <span>Estimated Call:</span>
                    <span className="font-mono font-bold text-[#171614] dark:text-[#F7F4EC]">
                      {nextMatch.scheduledTime
                        ? new Date(nextMatch.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Immediate Following Current'}
                    </span>
                  </div>
                </div>

                {/* Rest & Readiness Indicator */}
                <div className="text-xs">
                  {isBoardOccupied ? (
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] text-[#6F6A60] dark:text-[#A8A194] flex items-center gap-2 font-mono">
                      <Timer className="w-4 h-4 shrink-0 text-[#D93829]" />
                      <span>Waiting for Current Match on Main Carrom Board to complete.</span>
                    </div>
                  ) : readiness && !readiness.canStart ? (
                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 flex items-center gap-2 font-mono">
                      <Timer className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>{readiness.reason}</span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>All players rested & Main Carrom Board ready!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#24221E] text-[#857B6C] flex items-center justify-center mx-auto border border-[#DCD6C8] dark:border-[#38342C]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">No Next Match in Ready Queue</h3>
                  <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] mt-1">
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
                className="w-full py-3.5 rounded-xl bg-[#171614] hover:bg-[#2A2824] dark:bg-[#F7F4EC] dark:hover:bg-white text-[#F7F4EC] dark:text-[#171614] text-xs font-bold tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {startingMatchId === nextMatch._id
                    ? 'Starting Match...'
                    : isBoardOccupied
                    ? 'Start Match (Board Occupied)'
                    : readiness && !readiness.canStart
                    ? 'Start Match (Players Resting)'
                    : 'Start Match Now'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOUR TOURNAMENT OVERVIEW STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-1">
          <span className="text-[10px] text-[#857B6C] font-mono uppercase tracking-wider font-bold">Total Athletes</span>
          <div className="text-3xl font-serif font-black text-[#171614] dark:text-[#F7F4EC]">
            {stats?.totalParticipants || 0}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono block">
            {stats?.maleParticipants || 0} Boys · {stats?.femaleParticipants || 0} Girls
          </span>
        </div>

        <div className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-1">
          <span className="text-[10px] text-[#857B6C] font-mono uppercase tracking-wider font-bold">Approved Teams</span>
          <div className="text-3xl font-serif font-black text-[#171614] dark:text-[#F7F4EC]">
            {stats?.totalTeams || 0}
          </div>
          <span className="text-[11px] text-[#6F6A60] dark:text-[#A8A194] font-mono block">Across 5 Divisions</span>
        </div>

        <div className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-1">
          <span className="text-[10px] text-[#857B6C] font-mono uppercase tracking-wider font-bold">Main Carrom Board</span>
          <div className={`text-xl font-serif font-bold ${isBoardOccupied ? 'text-[#D93829]' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {isBoardOccupied ? 'LIVE IN PLAY' : 'AVAILABLE'}
          </div>
          <span className="text-[11px] text-[#6F6A60] dark:text-[#A8A194] font-mono block">
            {readyQueue.length} In Ready Queue
          </span>
        </div>

        <div className="rounded-2xl p-5 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] space-y-1">
          <span className="text-[10px] text-[#857B6C] font-mono uppercase tracking-wider font-bold">Completed Matches</span>
          <div className="text-3xl font-serif font-black text-[#171614] dark:text-[#F7F4EC]">
            {stats?.completedMatches || 0}
          </div>
          <span className="text-[11px] text-[#6F6A60] dark:text-[#A8A194] font-mono block">Results Confirmed</span>
        </div>
      </div>

      {/* 4. READY QUEUE & UPCOMING MATCHES LIST */}
      <div className="rounded-3xl p-6 sm:p-7 space-y-4 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DCD6C8] dark:border-[#2E2B25]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-[#171614] dark:text-[#F7F4EC] text-lg uppercase tracking-wide">
                Main Carrom Board — Ready Queue
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-white dark:bg-[#24221E] text-[#171614] dark:text-[#F7F4EC] font-mono text-xs border border-[#DCD6C8] dark:border-[#38342C] font-bold">
                {readyQueue.length} In Queue
              </span>
            </div>
            <p className="text-xs text-[#6F6A60] dark:text-[#A8A194] mt-0.5">
              FIFO sequential queue of matches waiting for Main Carrom Board.
            </p>
          </div>

          <Link
            href="/admin/matches"
            className="text-xs font-bold text-[#171614] dark:text-[#F7F4EC] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Manage All Rounds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {readyQueue.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6F6A60] dark:text-[#A8A194] space-y-1 font-mono">
            <p>No matches currently waiting in the READY queue.</p>
            {waitingCount > 0 && (
              <p className="text-[#171614] dark:text-[#F7F4EC] font-semibold">
                {waitingCount} subsequent round matches are currently WAITING for previous-round winners.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCD6C8] dark:border-[#2E2B25] text-[#857B6C] font-bold uppercase text-[10px] font-mono">
                <tr>
                  <th className="pb-3">Queue #</th>
                  <th className="pb-3">Division & Match</th>
                  <th className="pb-3">Opponents</th>
                  <th className="pb-3">Est. Call</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Referee Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCD6C8]/80 dark:divide-[#2E2B25]">
                {readyQueue.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-white/60 dark:hover:bg-[#24221E]/60 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#171614] dark:text-[#F7F4EC]">
                      #{m.queuePosition || idx + 1}
                    </td>
                    <td className="py-4">
                      <div className="space-y-0.5">
                        <CategoryBadge category={m.category} />
                        <span className="text-[10px] text-[#6F6A60] dark:text-[#A8A194] block font-mono">
                          {m.roundName} · M#{m.matchNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 font-serif font-bold text-[#171614] dark:text-[#F7F4EC] text-sm">
                      <span>{m.team1?.name}</span>
                      <span className="text-[#857B6C] mx-2 font-mono text-[10px]">vs</span>
                      <span>{m.team2?.name}</span>
                    </td>
                    <td className="py-4 font-mono text-[#6F6A60] dark:text-[#A8A194]">
                      {m.scheduledTime
                        ? new Date(m.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Sequential'}
                    </td>
                    <td className="py-4">
                      <StatusBadge status={m.status} queuePosition={m.queuePosition || idx + 1} />
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/admin/matches/${m._id}/score`}
                        className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] hover:border-[#171614] dark:hover:border-[#C2A268] text-xs font-bold text-[#171614] dark:text-[#F7F4EC] transition-colors inline-block uppercase font-mono shadow-xs"
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
        <div className="rounded-3xl p-6 sm:p-7 space-y-4 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCD6C8] dark:border-[#2E2B25]">
            <div>
              <h3 className="font-serif font-bold text-[#171614] dark:text-[#F7F4EC] text-lg uppercase tracking-wide">
                Completed Matches
              </h3>
              <p className="text-xs text-[#6F6A60] dark:text-[#A8A194]">
                Recently confirmed match results on Main Carrom Board
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-2xl bg-white dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] space-y-2.5"
              >
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#DCD6C8]/80 dark:border-[#38342C] font-mono">
                  <CategoryBadge category={m.category} />
                  <span className="text-[#857B6C]">M#{m.matchNumber}</span>
                </div>

                <div className="text-xs font-serif font-bold text-[#171614] dark:text-[#F7F4EC] space-y-1">
                  <div className={m.winnerTeam?._id === m.team1?._id ? 'text-[#D93829] dark:text-[#C2A268]' : ''}>
                    {m.team1?.name}
                  </div>
                  <div className={m.winnerTeam?._id === m.team2?._id ? 'text-[#D93829] dark:text-[#C2A268]' : ''}>
                    {m.team2?.name}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#DCD6C8]/80 dark:border-[#38342C] flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  <span>Winner: {m.winnerTeam?.name || 'Confirmed'}</span>
                  <Link href={`/admin/matches/${m._id}/score`} className="text-[#171614] dark:text-[#F7F4EC] hover:underline">
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
