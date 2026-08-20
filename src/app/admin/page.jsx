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
  Timer,
  Square
} from 'lucide-react';
import { CategoryBadge, StatusBadge, MainBoardBadge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { CarromCoin } from '@/components/ui/CarromElements';

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

  const [stoppingMatchId, setStoppingMatchId] = useState(null);

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
      <div className="py-24 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] flex items-center justify-center gap-2 font-mono">
        <RefreshCw className="w-4 h-4 animate-spin text-[#E74C3C]" />
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
    <div className="space-y-8 max-w-6xl mx-auto text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* 1. Standard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="eyebrow-label">
              CONTROL ROOM ARENA DESK
            </span>
            <MainBoardBadge />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
            Arena Control Desk
          </h1>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-1">
            Sequential match scheduling, live scorekeeper desk, and FIFO ready queue management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#4A4238] dark:hover:border-[#D4A94C] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/matches"
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#4A4238] dark:hover:border-[#D4A94C] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors shadow-xs"
          >
            All Fixtures
          </Link>
          <Link
            href="/admin/draws"
            className="btn-primary text-xs font-bold px-5 py-2 shadow-xs"
          >
            Draws & Brackets
          </Link>
        </div>
      </div>

      {/* 2. PROMINENT ARENA MATCH CONTROL (CURRENT MATCH & NEXT MATCH) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT MATCH CARD */}
        <div className={`editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-2xl bg-white dark:bg-[#15191C] border shadow-xs ${
          currentMatch ? 'border-[#E74C3C] ring-1 ring-[#E74C3C]/30' : 'border-[#E8E1D5] dark:border-[#2B3034]'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
              <div className="flex items-center gap-2">
                <span className="live-dot" />
                <h2 className="text-base font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase tracking-wider">
                  CURRENT MATCH (LIVE)
                </h2>
              </div>
              <MainBoardBadge />
            </div>

            {currentMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={currentMatch.category} />
                  <span className="font-mono text-[#3E342B] dark:text-[#F5F1E8] font-bold">{currentMatch.roundName} · Match #{currentMatch.matchNumber}</span>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-3">
                  <div className="grid grid-cols-3 items-center text-center gap-2">
                    <div className="text-left font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base truncate">
                      {currentMatch.team1?.name}
                    </div>
                    <div>
                      <div className="w-9 h-9 rounded-full bg-white dark:bg-[#15191C] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-center mx-auto shadow-xs">
                        VS
                      </div>
                      <span className="text-[9px] text-[#7E7060] dark:text-[#817B72] uppercase font-bold mt-1 block font-mono">Knockout</span>
                    </div>
                    <div className="text-right font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base truncate">
                      {currentMatch.team2?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#E74C3C] font-mono font-bold">
                  <span className="live-dot" />
                  <span>Main Carrom Board is in play · Referee desk active</span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] text-[#7E7060] dark:text-[#817B72] flex items-center justify-center mx-auto border border-[#E8E1D5] dark:border-[#2B3034]">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">Main Carrom Board is Free</h3>
                  <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
                    No match is currently live. The arena is ready for the Next Match in queue.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            {currentMatch ? (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Link
                  href={`/admin/matches/${currentMatch._id}/score`}
                  className="flex-1 w-full py-3 rounded-xl btn-primary text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <span>OPEN SCOREKEEPER</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleStopLive(currentMatch._id)}
                  disabled={stoppingMatchId === currentMatch._id}
                  className="py-3 px-4 rounded-xl bg-white dark:bg-[#181C1F] hover:bg-[#FDEDEC] dark:hover:bg-[#E74C3C]/15 text-[#E74C3C] border border-[#E74C3C]/30 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  title="Stop live match if started mistakenly"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{stoppingMatchId === currentMatch._id ? 'STOPPING...' : 'STOP LIVE'}</span>
                </button>
              </div>
            ) : nextMatch && (!readiness || readiness.canStart) ? (

              <button
                onClick={() => handleStartMatch(nextMatch._id)}
                disabled={startingMatchId === nextMatch._id}
                className="w-full py-3 rounded-xl btn-primary text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{startingMatchId === nextMatch._id ? 'Starting...' : 'START NEXT MATCH NOW'}</span>
              </button>
            ) : (
              <div className="text-center text-xs text-[#7E7060] dark:text-[#817B72] py-2 italic font-mono">
                {readyQueue.length === 0 ? 'No matches ready in queue' : 'Awaiting start requirements'}
              </div>
            )}
          </div>
        </div>

        {/* NEXT MATCH CARD */}
        <div className="editorial-card p-6 sm:p-7 flex flex-col justify-between space-y-6 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3E342B] dark:bg-[#D4A94C]" />
                <h2 className="text-base font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] uppercase tracking-wider">
                  NEXT MATCH
                </h2>
              </div>
              {nextMatch && (
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] border border-[#D5C4A1] dark:border-[#2B3034] font-bold">
                  Queue Position #1
                </span>
              )}
            </div>

            {nextMatch ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <CategoryBadge category={nextMatch.category} />
                  <span className="font-mono text-[#3E342B] dark:text-[#F5F1E8] font-bold">{nextMatch.roundName} · Match #{nextMatch.matchNumber}</span>
                </div>

                <div className="p-5 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-3">
                  <div className="flex items-center justify-between text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                    <span className="truncate max-w-[180px]">{nextMatch.team1?.name}</span>
                    <span className="text-xs text-[#7E7060] dark:text-[#817B72] font-mono font-bold px-2">VS</span>
                    <span className="truncate max-w-[180px] text-right">{nextMatch.team2?.name}</span>
                  </div>

                  <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs">
                    <span className="text-[#7E7060] dark:text-[#817B72]">Estimated Start:</span>
                    <span className="font-mono text-[#3E342B] dark:text-[#F5F1E8] font-bold">
                      {nextMatch.scheduledTime
                        ? new Date(nextMatch.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'Next in Queue'}
                    </span>
                  </div>
                </div>

                {/* Rest / Readiness indicator */}
                <div className="text-xs">
                  {isBoardOccupied ? (
                    <div className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-[#7E7060] dark:text-[#B8B1A5] flex items-center gap-2 font-mono">
                      <Timer className="w-4 h-4 shrink-0 text-[#E74C3C]" />
                      <span>Waiting for Current Match on Main Carrom Board to complete.</span>
                    </div>
                  ) : readiness && !readiness.canStart ? (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 flex items-center gap-2 font-mono">
                      <Timer className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>{readiness.reason}</span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 font-mono">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>All players rested & Main Carrom Board ready!</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] text-[#7E7060] dark:text-[#817B72] flex items-center justify-center mx-auto border border-[#E8E1D5] dark:border-[#2B3034]">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">No Next Match in Ready Queue</h3>
                  <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">
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
                className="w-full py-3 rounded-xl btn-primary text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
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
        <div className="editorial-card p-5 space-y-1 rounded-xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-bold uppercase font-mono">Total Athletes</span>
          <div className="text-3xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">
            {stats?.totalParticipants || 0}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold font-mono block">
            {stats?.maleParticipants || 0} Boys · {stats?.femaleParticipants || 0} Girls
          </span>
        </div>

        <div className="editorial-card p-5 space-y-1 rounded-xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-bold uppercase font-mono">Approved Entries</span>
          <div className="text-3xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">
            {stats?.totalTeams || 0}
          </div>
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono block">Across 5 Divisions</span>
        </div>

        <div className="editorial-card p-5 space-y-1 rounded-xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-bold uppercase font-mono">Main Carrom Board</span>
          <div className={`text-xl font-serif font-bold ${isBoardOccupied ? 'text-[#E74C3C]' : 'text-emerald-700 dark:text-emerald-400'}`}>
            {isBoardOccupied ? 'LIVE IN PLAY' : 'AVAILABLE'}
          </div>
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono block">
            {readyQueue.length} Matches in READY Queue
          </span>
        </div>

        <div className="editorial-card p-5 space-y-1 rounded-xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-bold uppercase font-mono">Completed Matches</span>
          <div className="text-3xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">
            {stats?.completedMatches || 0}
          </div>
          <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] font-mono block">Results Confirmed</span>
        </div>
      </div>

      {/* 4. READY QUEUE & UPCOMING MATCHES LIST */}
      <div className="editorial-card p-6 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034]">
          <div>
            <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base flex items-center gap-2 uppercase tracking-wide">
              <span>Main Carrom Board — READY Queue</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] text-[#3E342B] dark:text-[#F5F1E8] font-mono text-xs border border-[#D5C4A1] dark:border-[#2B3034] font-bold">
                {readyQueue.length} Ready
              </span>
            </h3>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] mt-0.5">
              FIFO sequential queue of matches waiting for Main Carrom Board.
            </p>
          </div>

          <Link
            href="/admin/matches"
            className="text-xs font-bold text-[#E74C3C] hover:underline flex items-center gap-1 font-mono uppercase"
          >
            <span>Manage All Rounds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {readyQueue.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#7E7060] dark:text-[#B8B1A5] space-y-1 font-mono">
            <p>No matches currently waiting in the READY queue.</p>
            {waitingCount > 0 && (
              <p className="text-[#3E342B] dark:text-[#F5F1E8] font-semibold">
                {waitingCount} subsequent round matches are currently WAITING for previous-round winners.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E8E1D5] dark:border-[#2B3034] text-[#7E7060] dark:text-[#817B72] font-bold uppercase text-[10px] font-mono">
                <tr>
                  <th className="pb-3">Queue #</th>
                  <th className="pb-3">Division & Match</th>
                  <th className="pb-3">Opponents</th>
                  <th className="pb-3">Est. Start</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5] dark:divide-[#2B3034]">
                {readyQueue.map((m, idx) => (
                  <tr key={m._id} className="hover:bg-[#FAF9F6] dark:hover:bg-[#181C1F] transition-colors">
                    <td className="py-3.5 font-mono font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                      #{m.queuePosition || idx + 1}
                    </td>
                    <td className="py-3.5">
                      <div className="space-y-0.5">
                        <CategoryBadge category={m.category} />
                        <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block font-mono">
                          {m.roundName} · M#{m.matchNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-sm">
                      <span>{m.team1?.name}</span>
                      <span className="text-[#7E7060] dark:text-[#817B72] mx-2 font-mono text-[10px]">vs</span>
                      <span>{m.team2?.name}</span>
                    </td>
                    <td className="py-3.5 font-mono text-[#7E7060] dark:text-[#817B72]">
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
                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] hover:border-[#3E342B] dark:hover:border-[#D4A94C] text-xs font-bold text-[#3E342B] dark:text-[#F5F1E8] transition-colors inline-block font-mono uppercase shadow-xs"
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
        <div className="editorial-card p-6 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5] dark:border-[#2B3034]">
            <div>
              <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-base uppercase tracking-wide">Completed Matches</h3>
              <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5]">Recently confirmed match results on Main Carrom Board</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedMatches.map((m) => (
              <div key={m._id} className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2">
                <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#E8E1D5] dark:border-[#2B3034] font-mono">
                  <CategoryBadge category={m.category} />
                  <span className="text-[#7E7060] dark:text-[#817B72]">M#{m.matchNumber}</span>
                </div>

                <div className="text-xs font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8]">
                  <div className={m.winnerTeam?._id === m.team1?._id ? 'text-[#E74C3C] dark:text-[#D4A94C]' : ''}>
                    {m.team1?.name}
                  </div>
                  <div className={m.winnerTeam?._id === m.team2?._id ? 'text-[#E74C3C] dark:text-[#D4A94C]' : ''}>
                    {m.team2?.name}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300 font-bold font-mono">
                  <span>Winner: {m.winnerTeam?.name || 'Confirmed'}</span>
                  <Link href={`/admin/matches/${m._id}/score`} className="text-[#E74C3C] dark:text-[#D4A94C] hover:underline">
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


