'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { AdminSidebar } from '@/components/chess/AdminSidebar';
import {
  History,
  Swords,
  Trophy,
  Crown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Calendar,
  X,
  Play
} from 'lucide-react';
import { useToast, useConfirm } from '@/context/ToastContext';
import { getSocket, subscribeToChessLive } from '@/lib/socket';
import Link from 'next/link';

/**
 * Formats seconds into MM:SS format
 */
const formatClock = (seconds) => {
  if (seconds === null || seconds === undefined) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Returns formatted victory reason badge and label
 */
const getVictoryDetails = (match) => {
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
    case 'admin_override':
      return {
        label: `${winnerName} awarded victory by Arbiter`,
        color: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/40',
        scoreText,
        icon: '⚖️'
      };
    case 'points':
      return {
        label: `${winnerName} won on Material Points`,
        color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40',
        scoreText,
        icon: '📊'
      };
    case 'bye':
      return {
        label: `${winnerName} advanced via BYE`,
        color: 'text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/40',
        scoreText: 'BYE',
        icon: '⏩'
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

export default function ChessMatchHistoryPage() {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Load all matches
  const loadMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await chessApi.getAdminMatches();
      if (res.success && res.data) {
        // Sort: completed matches with newest actualEndTime or updatedAt first, then live, then scheduled
        const sorted = [...res.data].sort((a, b) => {
          if (a.status === 'completed' && b.status !== 'completed') return -1;
          if (b.status === 'completed' && a.status !== 'completed') return 1;
          if (a.status === 'live' && b.status !== 'live') return -1;
          if (b.status === 'live' && a.status !== 'live') return 1;
          return new Date(b.updatedAt || b.actualEndTime || b.createdAt) - new Date(a.updatedAt || a.actualEndTime || a.createdAt);
        });
        setMatches(sorted);
      }
    } catch (err) {
      console.error('Error loading matches history:', err);
      toast.error('Failed to load chess match history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!chessApi.isAdminAuthenticated()) {
      router.push('/chess/admin/login');
      return;
    }
    loadMatches();

    // Real-time socket updates for match status & completion
    const unsubscribe = subscribeToChessLive((data) => {
      if (data?.type === 'match_completed' || data?.type === 'match_update' || data?.type === 'state_sync') {
        loadMatches(true);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    toast.success('Match history refreshed!');
  };

  // Restart match handler
  const handleRestartMatch = async (matchId) => {
    const isConfirmed = await confirm({
      title: 'Restart Chess Match?',
      message: 'Are you sure you want to restart this match? The result will be cleared, clocks will reset to 10 minutes, and the match can be replayed.',
      confirmText: 'Restart Match',
      cancelText: 'Cancel',
      type: 'warning'
    });
    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      const res = await chessApi.restartMatch(matchId);
      if (res.success) {
        toast.success(res.message || 'Match restarted successfully!');
        setSelectedMatch(null);
        await loadMatches(true);
      } else {
        toast.error(res.message || 'Failed to restart match.');
      }
    } catch (err) {
      toast.error(err.message || 'Error restarting match.');
    } finally {
      setActionLoading(false);
    }
  };

  // Available unique stages from matches
  const uniqueStages = useMemo(() => {
    const set = new Set();
    matches.forEach((m) => {
      if (m.roundName) set.add(m.roundName);
      else if (m.round) set.add(`Round ${m.round}`);
    });
    return Array.from(set);
  }, [matches]);

  // Filtered matches
  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      // Stage filter
      if (stageFilter !== 'all') {
        const stageName = m.roundName || `Round ${m.round}`;
        if (stageName !== stageFilter) return false;
      }

      // Status / Result filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'completed' && m.status !== 'completed') return false;
        if (statusFilter === 'live' && m.status !== 'live') return false;
        if (statusFilter === 'checkmate' && (m.status !== 'completed' || m.resultType !== 'checkmate')) return false;
        if (statusFilter === 'time_out' && (m.status !== 'completed' || m.resultType !== 'time_out')) return false;
        if (statusFilter === 'draw' && (m.status !== 'completed' || m.winner !== 'draw')) return false;
      }

      // Search filter (player1, player2, matchId, roundName)
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const mId = (m.matchId || '').toLowerCase();
        const rName = (m.roundName || `round ${m.round}`).toLowerCase();
        const p1Name = (m.player1?.fullName || '').toLowerCase();
        const p1Id = (m.player1?.playerId || '').toLowerCase();
        const p2Name = (m.player2?.fullName || '').toLowerCase();
        const p2Id = (m.player2?.playerId || '').toLowerCase();
        return (
          mId.includes(q) ||
          rName.includes(q) ||
          p1Name.includes(q) ||
          p1Id.includes(q) ||
          p2Name.includes(q) ||
          p2Id.includes(q)
        );
      }

      return true;
    });
  }, [matches, stageFilter, statusFilter, search]);

  // Metrics summary
  const metrics = useMemo(() => {
    const total = matches.length;
    const completed = matches.filter((m) => m.status === 'completed').length;
    const live = matches.filter((m) => m.status === 'live').length;
    const checkmates = matches.filter((m) => m.status === 'completed' && m.resultType === 'checkmate').length;
    const timeouts = matches.filter((m) => m.status === 'completed' && m.resultType === 'time_out').length;
    const draws = matches.filter((m) => m.status === 'completed' && m.winner === 'draw').length;
    return { total, completed, live, checkmates, timeouts, draws };
  }, [matches]);

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col lg:flex-row font-sans text-[#171715] dark:text-[#FAF8F3] antialiased transition-colors">
      <AdminSidebar />

      <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-5 sm:space-y-6">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-semibold text-[#77736B] dark:text-[#A8A49C] uppercase tracking-widest block">
                CHAMPIONSHIP LOGS & TOURNAMENT ARCHIVE
              </span>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                <History className="w-3 h-3" />
                Live Sync
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
              Chess Match History
            </h1>
            <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] mt-1 max-w-2xl">
              Complete log of all played matches, victory decisions (checkmate, timeout, resignation), referee clocks, and tournament outcomes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Refresh match history"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Refresh History'}</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar: 4 Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#77736B] dark:text-[#8E8E93]">
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider">Total Recorded</span>
              <History className="w-4 h-4 text-[#171715] dark:text-[#FAF8F3]" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
              {metrics.total}
            </div>
            <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] block">
              Across all stages
            </span>
          </div>

          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600 dark:text-emerald-400">
              {metrics.completed}
            </div>
            <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] block">
              Decided matches
            </span>
          </div>

          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider">Checkmates</span>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-600 dark:text-amber-400">
              {metrics.checkmates}
            </div>
            <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] block">
              {metrics.timeouts} timeouts • {metrics.draws} draws
            </span>
          </div>

          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span className="text-[10px] sm:text-[11px] font-mono font-semibold uppercase tracking-wider">Live In Play</span>
              <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-serif text-rose-600 dark:text-rose-400">
              {metrics.live}
            </div>
            <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93] block">
              Clocks ticking now
            </span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77736B] dark:text-[#8E8E93]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by player name, ID (CHS-001), or match code (CHS-M001)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#F5F2EB] dark:bg-[#1A1A18] text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] placeholder-[#77736B] dark:placeholder-[#8E8E93] focus:outline-none focus:border-[#171715] dark:focus:border-[#FAF8F3] transition-colors"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Stage Filter */}
            <div className="w-full sm:w-48">
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#F5F2EB] dark:bg-[#1A1A18] text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none cursor-pointer"
              >
                <option value="all">All Stages & Rounds</option>
                {uniqueStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>

            {/* Outcome Filter */}
            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#F5F2EB] dark:bg-[#1A1A18] text-xs font-semibold text-[#171715] dark:text-[#FAF8F3] focus:outline-none cursor-pointer"
              >
                <option value="all">All Results</option>
                <option value="completed">Completed Only</option>
                <option value="checkmate">Checkmates Only</option>
                <option value="time_out">Timeouts Only</option>
                <option value="draw">Draws Only</option>
                <option value="live">Live Matches Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Match History List */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#FAF8F3]/60 dark:bg-[#151514]/60 border border-[#D5CFC5]/50 dark:border-[#262624]/50 rounded-2xl p-5 sm:p-6 h-36 flex flex-col justify-between"
              >
                <div className="h-4 bg-[#E8E1D5] dark:bg-[#262624] rounded-md w-1/4" />
                <div className="h-10 bg-[#E8E1D5] dark:bg-[#262624] rounded-xl w-full" />
                <div className="h-3 bg-[#E8E1D5] dark:bg-[#262624] rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#EFEAE1] dark:bg-[#1E1E1C] flex items-center justify-center mx-auto text-[#77736B] dark:text-[#8E8E93]">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
              No Matches Found
            </h3>
            <p className="text-xs text-[#77736B] dark:text-[#8E8E93] max-w-md mx-auto">
              {search || stageFilter !== 'all' || statusFilter !== 'all'
                ? 'No chess duels match your search and filter criteria. Try adjusting your filters above.'
                : 'No chess match history has been archived yet. As matches are generated and concluded in the tournament, complete logs will automatically appear here.'}
            </p>
            <div className="pt-2">
              <Link
                href="/chess/admin/matches"
                className="inline-flex items-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Go to Matches Console</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 chess-content-fade-in">
            {filteredMatches.map((m) => {
              const victory = getVictoryDetails(m);
              const p1 = m.player1 || { fullName: 'TBD', playerId: 'CHS-???', department: 'Competitor' };
              const p2 = m.player2 || { fullName: 'TBD', playerId: 'CHS-???', department: 'Competitor' };
              const isP1Winner = m.status === 'completed' && m.winner === 'player1';
              const isP2Winner = m.status === 'completed' && m.winner === 'player2';

              return (
                <div
                  key={m._id || m.matchId}
                  className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] hover:border-[#171715]/40 dark:hover:border-[#FAF8F3]/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs transition-all duration-200"
                >
                  {/* Card Header: Match ID, Stage, Status, Date */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-3 mb-4 text-xs font-mono">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#171715] dark:text-[#FAF8F3] font-mono tracking-tight">
                        {m.matchId}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        🏆 {m.roundName || `Round ${m.round}`}
                      </span>
                      {m.status === 'completed' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Concluded</span>
                        </span>
                      )}
                      {m.status === 'live' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span>Live In Play</span>
                        </span>
                      )}
                      {m.status === 'scheduled' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#77736B] dark:text-[#8E8E93]">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-[#77736B] dark:text-[#8E8E93] flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {m.actualEndTime
                          ? new Date(m.actualEndTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })
                          : m.scheduledTime
                          ? new Date(m.scheduledTime).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })
                          : 'Tournament Schedule'}
                      </span>
                    </div>
                  </div>

                  {/* Duel Arena: White vs Black */}
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
                    
                    {/* White Player (Left) */}
                    <div
                      className={`md:col-span-5 p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isP1Winner
                          ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/40 shadow-xs'
                          : 'bg-[#F5F2EB]/60 dark:bg-[#1A1A18] border-[#D5CFC5]/50 dark:border-[#262624]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* White King Piece Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-white text-[#171715] border border-[#D5CFC5] shadow-xs flex items-center justify-center font-bold text-xl shrink-0">
                            ♔
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93]">
                                WHITE • {p1.playerId}
                              </span>
                              {isP1Winner && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold uppercase bg-amber-500 text-black px-1.5 py-0.2 rounded">
                                  👑 WINNER
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif font-bold text-sm sm:text-base text-[#171715] dark:text-[#FAF8F3] truncate">
                              {p1.fullName}
                            </h3>
                            <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] truncate">
                              {p1.department || 'Player'}
                            </p>
                          </div>
                        </div>

                        {/* Clock Remaining */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                            {formatClock(m.whiteTimeRemaining)}
                          </div>
                          <span className="text-[9px] font-mono text-[#77736B] dark:text-[#8E8E93] uppercase">
                            Clock Left
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* VS & Result Badge (Center) */}
                    <div className="md:col-span-1 text-center py-1 md:py-0">
                      <div className="inline-block px-3 py-1 rounded-xl bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-bold text-xs shadow-xs">
                        {victory.scoreText}
                      </div>
                    </div>

                    {/* Black Player (Right) */}
                    <div
                      className={`md:col-span-5 p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isP2Winner
                          ? 'bg-amber-500/10 dark:bg-amber-950/20 border-amber-500/40 shadow-xs'
                          : 'bg-[#F5F2EB]/60 dark:bg-[#1A1A18] border-[#D5CFC5]/50 dark:border-[#262624]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Black King Piece Avatar */}
                          <div className="w-10 h-10 rounded-xl bg-[#171715] text-[#FAF8F3] border border-[#383733] shadow-xs flex items-center justify-center font-bold text-xl shrink-0">
                            ♚
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93]">
                                BLACK • {p2.playerId}
                              </span>
                              {isP2Winner && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold uppercase bg-amber-500 text-black px-1.5 py-0.2 rounded">
                                  👑 WINNER
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif font-bold text-sm sm:text-base text-[#171715] dark:text-[#FAF8F3] truncate">
                              {p2.fullName}
                            </h3>
                            <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] truncate">
                              {p2.department || 'Player'}
                            </p>
                          </div>
                        </div>

                        {/* Clock Remaining */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                            {formatClock(m.blackTimeRemaining)}
                          </div>
                          <span className="text-[9px] font-mono text-[#77736B] dark:text-[#8E8E93] uppercase">
                            Clock Left
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Card Footer: Victory Reason & Actions */}
                  <div className="mt-4 pt-3 border-t border-[#D5CFC5]/50 dark:border-[#262624] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-semibold border ${victory.color}`}>
                        <span>{victory.icon}</span>
                        <span>{victory.label}</span>
                      </span>

                      <span className="text-[#77736B] dark:text-[#8E8E93] text-[11px] font-mono">
                        {m.durationMinutes || 10}m Rapid Clock {m.movesCount ? `• ${m.movesCount} Moves Logged` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedMatch(m)}
                        className="bg-[#EFEAE1] dark:bg-[#1E1E1C] hover:bg-[#E4DED5] dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] font-semibold px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Match Details</span>
                      </button>

                      <Link
                        href={`/chess/matches/${m._id}`}
                        className="bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-semibold px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider shadow-2xs flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <span>View Board</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* MATCH DETAIL MODAL */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#D5CFC5] dark:border-[#262624] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-bold text-sm shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3]">
                    Match History Dossier
                  </h3>
                  <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] uppercase tracking-wider block">
                    {selectedMatch.matchId} • {selectedMatch.roundName || `Round ${selectedMatch.round}`}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="w-8 h-8 rounded-xl border border-[#D5CFC5] dark:border-[#262624] hover:bg-[#EFEAE1] dark:hover:bg-[#20201E] flex items-center justify-center text-[#77736B] dark:text-[#8E8E93] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Duel Players Card */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F5F2EB]/70 dark:bg-[#1C1C1A] border border-[#D5CFC5]/60 dark:border-[#2A2A28]">
              {/* White */}
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93]">
                  ♔ WHITE PLAYER
                </span>
                <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                  {selectedMatch.player1?.fullName || 'TBD'}
                </h4>
                <p className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                  {selectedMatch.player1?.playerId} • {selectedMatch.player1?.department || 'Player'}
                </p>
                <div className="pt-1">
                  <span className="text-xs font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                    {formatClock(selectedMatch.whiteTimeRemaining)}
                  </span>
                  <span className="text-[9px] font-mono text-[#77736B] ml-1">remaining</span>
                </div>
              </div>

              {/* Black */}
              <div className="space-y-1 text-right">
                <span className="text-[9px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93]">
                  ♚ BLACK PLAYER
                </span>
                <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                  {selectedMatch.player2?.fullName || 'TBD'}
                </h4>
                <p className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                  {selectedMatch.player2?.playerId} • {selectedMatch.player2?.department || 'Player'}
                </p>
                <div className="pt-1">
                  <span className="text-xs font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                    {formatClock(selectedMatch.blackTimeRemaining)}
                  </span>
                  <span className="text-[9px] font-mono text-[#77736B] ml-1">remaining</span>
                </div>
              </div>
            </div>

            {/* Outcome Breakdown */}
            <div className="space-y-2 text-xs">
              <span className="text-[9px] font-mono font-semibold uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                RESULT VERDICT
              </span>
              <div className="p-3.5 rounded-xl border border-[#D5CFC5] dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#151514] flex items-center justify-between">
                <span className="font-semibold text-[#171715] dark:text-[#FAF8F3]">
                  {getVictoryDetails(selectedMatch).label}
                </span>
                <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D]">
                  {getVictoryDetails(selectedMatch).scoreText}
                </span>
              </div>
            </div>

            {/* Timing & Logs */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl border border-[#D5CFC5]/60 dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#151514]">
                <span className="text-[9px] text-[#77736B] uppercase block">Duration Format</span>
                <span className="font-bold">{selectedMatch.durationMinutes || 10} Minutes Rapid</span>
              </div>
              <div className="p-3 rounded-xl border border-[#D5CFC5]/60 dark:border-[#262624] bg-[#FAF8F3] dark:bg-[#151514]">
                <span className="text-[9px] text-[#77736B] uppercase block">Status</span>
                <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  {selectedMatch.status}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#D5CFC5] dark:border-[#262624] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => handleRestartMatch(selectedMatch._id)}
                disabled={actionLoading}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Match</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#D5CFC5] dark:border-[#262624] hover:bg-[#EFEAE1] dark:hover:bg-[#1D1D1B] transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/chess/matches/${selectedMatch._id}`}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <span>Open Duel</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
