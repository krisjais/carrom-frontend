'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { DualChessClock } from '@/components/chess/DualChessClock';
import { 
  User, Swords, Clock, Trophy, Crown, Shield, Sparkles, 
  Play, Pause, RotateCcw, Volume2, VolumeX, LogOut, ArrowRight, 
  CheckCircle2, AlertCircle, RefreshCw, Smartphone, Flag, Maximize2 
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

/**
 * Mobile-friendly audio click synthesizer
 */
function playClockTone(type = 'click') {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'flag') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    }
  } catch {
    // Ignore audio errors on un-interacted page
  }
}

export default function ChessPlayerDashboardPage() {
  const router = useRouter();
  const toast = useToast();

  const [player, setPlayer] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Phone Clock State (10:00 Rapid, Turn-Based)
  const [activeTurn, setActiveTurn] = useState('white'); // 'white' | 'black'
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [whiteSeconds, setWhiteSeconds] = useState(600); // 10 mins
  const [blackSeconds, setBlackSeconds] = useState(600); // 10 mins
  const [movesCount, setMovesCount] = useState(0);
  const [flagFall, setFlagFall] = useState(null); // 'white' | 'black'
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showFaceToFaceClock, setShowFaceToFaceClock] = useState(false);
  const [lastTurnState, setLastTurnState] = useState(null);

  const clockIntervalRef = useRef(null);
  const channelRef = useRef(null);

  // 1. Check Authentication on Mount
  useEffect(() => {
    const auth = chessApi.getPlayerAuth();
    if (!auth.isAuthenticated || !auth.player) {
      router.push('/chess/login');
      return;
    }
    setPlayer(auth.player);
  }, [router]);

  // 2. Fetch Player Dashboard Data
  const loadDashboard = useCallback(async (isSilent = false) => {
    const auth = chessApi.getPlayerAuth();
    if (!auth.player) return;

    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const pId = auth.player._id || auth.player.playerId;
      const res = await chessApi.getPlayerDashboard(pId);
      if (res.success && res.data) {
        setDashboardData(res.data);
        if (res.data.player) {
          setPlayer(res.data.player);
        }

        // Synchronize live clock & match state directly from backend
        const m = res.data.currentMatch;
        if (m) {
          let wSec = typeof m.whiteTimeRemaining === 'number' ? m.whiteTimeRemaining : 600;
          let bSec = typeof m.blackTimeRemaining === 'number' ? m.blackTimeRemaining : 600;
          const running = m.isClockRunning ?? (m.status === 'live');
          const turn = m.activeTurn && m.activeTurn !== 'none' ? m.activeTurn : 'white';

          if (running && m.lastClockUpdate) {
            const elapsed = Math.max(0, Math.floor((Date.now() - new Date(m.lastClockUpdate).getTime()) / 1000));
            if (turn === 'white') {
              wSec = Math.max(0, wSec - elapsed);
            } else if (turn === 'black') {
              bSec = Math.max(0, bSec - elapsed);
            }
          }

          setWhiteSeconds(wSec);
          setBlackSeconds(bSec);
          setActiveTurn(turn);
          setIsClockRunning(running && wSec > 0 && bSec > 0);
          setMovesCount(m.movesCount || 0);

          if (wSec <= 0) setFlagFall('white');
          else if (bSec <= 0) setFlagFall('black');
          else setFlagFall(null);
        }
      }
    } catch (err) {
      console.error('Error fetching player dashboard:', err);
    } finally {
      if (!isSilent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (player) {
      loadDashboard(false);
      // Poll every 3 seconds to catch match starts, piece scores and clock updates
      const interval = setInterval(() => {
        loadDashboard(true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [player, loadDashboard]);

  // Instant Multi-Tab Clock Synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;

    const channel = new BroadcastChannel('chess_tournament_clock');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      const currentMatchId = dashboardData?.currentMatch?._id || dashboardData?.currentMatch?.matchId;
      if (data.matchId && currentMatchId && data.matchId !== currentMatchId) return;

      if (typeof data.whiteSeconds === 'number') setWhiteSeconds(data.whiteSeconds);
      else if (typeof data.p1Time === 'number') setWhiteSeconds(data.p1Time);

      if (typeof data.blackSeconds === 'number') setBlackSeconds(data.blackSeconds);
      else if (typeof data.p2Time === 'number') setBlackSeconds(data.p2Time);

      if (data.activeTurn) setActiveTurn(data.activeTurn);

      if (typeof data.isClockRunning === 'boolean') setIsClockRunning(data.isClockRunning);
      else if (typeof data.isRunning === 'boolean') setIsClockRunning(data.isRunning);

      if (typeof data.movesCount === 'number') setMovesCount(data.movesCount);
      if (data.flagFall !== undefined) setFlagFall(data.flagFall);
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, [dashboardData?.currentMatch?._id, dashboardData?.currentMatch?.matchId]);

  // Helper to broadcast clock changes and sync to server
  const broadcastAndSync = useCallback((updates) => {
    const match = dashboardData?.currentMatch;
    const mId = match?._id || match?.matchId;

    const payload = {
      matchId: mId,
      whiteSeconds: updates.whiteSeconds !== undefined ? updates.whiteSeconds : whiteSeconds,
      blackSeconds: updates.blackSeconds !== undefined ? updates.blackSeconds : blackSeconds,
      p1Time: updates.whiteSeconds !== undefined ? updates.whiteSeconds : whiteSeconds,
      p2Time: updates.blackSeconds !== undefined ? updates.blackSeconds : blackSeconds,
      activeTurn: updates.activeTurn !== undefined ? updates.activeTurn : activeTurn,
      isClockRunning: updates.isClockRunning !== undefined ? updates.isClockRunning : isClockRunning,
      isRunning: updates.isClockRunning !== undefined ? updates.isClockRunning : isClockRunning,
      movesCount: updates.movesCount !== undefined ? updates.movesCount : movesCount,
      flagFall: updates.flagFall !== undefined ? updates.flagFall : flagFall,
      timestamp: Date.now()
    };

    try {
      if (channelRef.current) {
        channelRef.current.postMessage(payload);
      } else if (typeof window !== 'undefined' && window.BroadcastChannel) {
        const bc = new BroadcastChannel('chess_tournament_clock');
        bc.postMessage(payload);
        bc.close();
      }
    } catch {
      // BroadcastChannel unavailable
    }

    if (mId) {
      chessApi.syncMatchClock(mId, {
        activeTurn: payload.activeTurn,
        whiteTimeRemaining: payload.whiteSeconds,
        blackTimeRemaining: payload.blackSeconds,
        movesCount: payload.movesCount,
        isClockRunning: payload.isClockRunning,
        status: payload.isClockRunning ? 'live' : undefined
      }).catch(() => {});
    }
  }, [dashboardData?.currentMatch, whiteSeconds, blackSeconds, activeTurn, isClockRunning, movesCount, flagFall]);

  // 3. Countdown Loop for Phone Clock with 1-Second Zero-Latency Broadcast
  useEffect(() => {
    if (!isClockRunning || flagFall) {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
      return;
    }

    const match = dashboardData?.currentMatch;
    const mId = match?._id || match?.matchId;

    clockIntervalRef.current = setInterval(() => {
      if (activeTurn === 'white') {
        setWhiteSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(clockIntervalRef.current);
            setIsClockRunning(false);
            setFlagFall('white');
            if (soundEnabled) playClockTone('flag');
            broadcastAndSync({ whiteSeconds: 0, isClockRunning: false, flagFall: 'white' });
            return 0;
          }
          const nextW = prev - 1;
          const tickPayload = {
            type: 'tick',
            matchId: mId,
            whiteSeconds: nextW,
            blackSeconds,
            p1Time: nextW,
            p2Time: blackSeconds,
            activeTurn: 'white',
            isClockRunning: true,
            isRunning: true,
            movesCount,
            timestamp: Date.now()
          };
          try {
            if (channelRef.current) channelRef.current.postMessage(tickPayload);
            else if (typeof window !== 'undefined' && window.BroadcastChannel) {
              const bc = new BroadcastChannel('chess_tournament_clock');
              bc.postMessage(tickPayload);
              bc.close();
            }
          } catch {}

          // Periodic background sync every 5 seconds for non-local devices
          if (mId && nextW % 5 === 0) {
            chessApi.syncMatchClock(mId, {
              activeTurn: 'white',
              whiteTimeRemaining: nextW,
              blackTimeRemaining: blackSeconds,
              movesCount,
              isClockRunning: true,
              status: 'live'
            }).catch(() => {});
          }

          return nextW;
        });
      } else if (activeTurn === 'black') {
        setBlackSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(clockIntervalRef.current);
            setIsClockRunning(false);
            setFlagFall('black');
            if (soundEnabled) playClockTone('flag');
            broadcastAndSync({ blackSeconds: 0, isClockRunning: false, flagFall: 'black' });
            return 0;
          }
          const nextB = prev - 1;
          const tickPayload = {
            type: 'tick',
            matchId: mId,
            whiteSeconds,
            blackSeconds: nextB,
            p1Time: whiteSeconds,
            p2Time: nextB,
            activeTurn: 'black',
            isClockRunning: true,
            isRunning: true,
            movesCount,
            timestamp: Date.now()
          };
          try {
            if (channelRef.current) channelRef.current.postMessage(tickPayload);
            else if (typeof window !== 'undefined' && window.BroadcastChannel) {
              const bc = new BroadcastChannel('chess_tournament_clock');
              bc.postMessage(tickPayload);
              bc.close();
            }
          } catch {}

          // Periodic background sync every 5 seconds for non-local devices
          if (mId && nextB % 5 === 0) {
            chessApi.syncMatchClock(mId, {
              activeTurn: 'black',
              whiteTimeRemaining: whiteSeconds,
              blackTimeRemaining: nextB,
              movesCount,
              isClockRunning: true,
              status: 'live'
            }).catch(() => {});
          }

          return nextB;
        });
      }
    }, 1000);

    return () => clearInterval(clockIntervalRef.current);
  }, [isClockRunning, activeTurn, flagFall, soundEnabled, movesCount, whiteSeconds, blackSeconds, dashboardData?.currentMatch, broadcastAndSync]);



  // Switch Turn when player moves pawn / piece
  const handlePassTurn = () => {
    const match = dashboardData?.currentMatch;
    if (flagFall || !match || match.status !== 'live') return;

    // Save state snapshot for Undo
    setLastTurnState({
      activeTurn,
      whiteSeconds,
      blackSeconds,
      movesCount
    });

    const nextTurn = activeTurn === 'white' ? 'black' : 'white';
    const nextMoves = movesCount + 1;
    setActiveTurn(nextTurn);
    setIsClockRunning(true);
    setMovesCount(nextMoves);

    if (soundEnabled) playClockTone('click');
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(35);
      }
    } catch {}

    broadcastAndSync({
      activeTurn: nextTurn,
      isClockRunning: true,
      movesCount: nextMoves,
      whiteSeconds,
      blackSeconds
    });
  };

  // Undo accidental turn switch
  const handleUndoTurn = () => {
    const match = dashboardData?.currentMatch;
    if (flagFall || !lastTurnState || match?.status !== 'live') return;

    const prevTurn = lastTurnState.activeTurn;
    const prevW = lastTurnState.whiteSeconds;
    const prevB = lastTurnState.blackSeconds;
    const prevMoves = lastTurnState.movesCount;

    setActiveTurn(prevTurn);
    setWhiteSeconds(prevW);
    setBlackSeconds(prevB);
    setMovesCount(prevMoves);
    setLastTurnState(null);

    if (soundEnabled) playClockTone('click');
    toast.info('Turn switch undone.');

    broadcastAndSync({
      activeTurn: prevTurn,
      isClockRunning: true,
      movesCount: prevMoves,
      whiteSeconds: prevW,
      blackSeconds: prevB
    });
  };

  const handleLogout = () => {
    chessApi.logoutPlayer();
    router.push('/chess/login');
  };

  const formatClockTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentMatch = dashboardData?.currentMatch;
  const matchHistory = dashboardData?.matchHistory || [];
  const pieceColor = dashboardData?.pieceColor || 'white';
  const isPlayerWhite = pieceColor === 'white';

  const opponent = isPlayerWhite
    ? currentMatch?.player2
    : currentMatch?.player1;

  const opponentName = currentMatch?.isBye
    ? 'BYE — Automatic Nomination'
    : opponent?.fullName || 'TBD (Round Winner)';

  const opponentDept = opponent?.department || (currentMatch?.isBye ? 'Tournament Pass' : 'TBD');

  const isLive = currentMatch?.status === 'live';
  const isScheduled = currentMatch?.status === 'scheduled';
  const isCompleted = currentMatch?.status === 'completed';
  const isBye = currentMatch?.isBye || currentMatch?.resultType === 'bye';

  const isWinnerMe = currentMatch?.winner === (isPlayerWhite ? 'player1' : 'player2');
  const isWinnerOpponent = currentMatch?.winner === (isPlayerWhite ? 'player2' : 'player1');
  const isDraw = currentMatch?.winner === 'draw';

  const isMyTurn = isClockRunning && activeTurn === pieceColor;

  if (loading && !player) {
    return (
      <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-mono text-xs uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93]">
            Loading Competitor Portal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased">
      <ChessHeader />

      <main className="flex-1 p-3 sm:p-6 max-w-4xl mx-auto w-full space-y-5">
        
        {/* TOP MOBILE COMPETITOR CARD */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] flex items-center justify-center font-serif font-bold text-lg shadow-sm">
              {player?.fullName ? player.fullName.split(' ').map(n => n[0]).slice(0, 2).join('') : '♟'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  {player?.playerId}
                </span>
                <span className="text-[10px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93]">
                  {player?.department}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-0.5">
                {player?.fullName}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[#D5CFC5]/60 dark:border-[#262624]">
            {/* Sync Status Button */}
            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="px-3 py-1.5 rounded-xl border border-[#D5CFC5] dark:border-[#282826] bg-[#EFEAE1]/60 dark:bg-[#1B1B19] text-[11px] font-mono text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] flex items-center gap-1.5 cursor-pointer"
              title="Refresh match status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-600' : ''}`} />
              <span>Sync</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-[#D5CFC5] dark:border-[#282826] text-[11px] font-mono text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* PLAYER STATS PILL STRIP */}
        <div className="grid grid-cols-4 gap-2 text-center font-mono bg-[#EFEAE1]/70 dark:bg-[#1B1B19] p-3 rounded-2xl border border-[#D5CFC5]/80 dark:border-[#282826]">
          <div>
            <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">Rank</span>
            <span className="text-base sm:text-lg font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
              #{player?.rank || 1}
            </span>
          </div>
          <div className="border-l border-[#D5CFC5]/60 dark:border-[#282826]">
            <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">Played</span>
            <span className="text-base sm:text-lg font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
              {player?.matchesPlayed ?? 0}
            </span>
          </div>
          <div className="border-l border-[#D5CFC5]/60 dark:border-[#282826]">
            <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">Wins</span>
            <span className="text-base sm:text-lg font-serif font-bold text-emerald-600 dark:text-emerald-400">
              {player?.wins ?? 0}
            </span>
          </div>
          <div className="border-l border-[#D5CFC5]/60 dark:border-[#282826]">
            <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block">Total Pts</span>
            <span className="text-base sm:text-lg font-serif font-bold text-amber-600 dark:text-amber-400">
              {player?.tournamentPoints ?? 0}
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CURRENT / UPCOMING MATCH CARD (HERO FOCUS ON MOBILE)          */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#FAF8F3] dark:bg-[#141414] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-lg space-y-5">
          
          {/* Match Stage Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">
                {currentMatch?.matchId || 'NO ACTIVE MATCH'}
              </span>
              <span className="text-[#77736B] dark:text-[#8E8E93]">•</span>
              <span className="text-amber-700 dark:text-amber-400 font-bold uppercase">
                {currentMatch?.roundName || (currentMatch ? `Round ${currentMatch.round}` : 'Standby')}
              </span>
            </div>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isLive
                ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-300 animate-pulse'
                : isBye
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                : isCompleted
                ? 'bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3]'
                : 'bg-[#EFEAE1]/70 dark:bg-[#1E1E1C] text-[#77736B] dark:text-[#8E8E93]'
            }`}>
              {isLive ? '● LIVE IN ARENA' : isBye ? '🛡️ BYE ADVANCE' : currentMatch?.status || 'Waiting for Draw'}
            </span>
          </div>

          {!currentMatch ? (
            <div className="text-center py-8 space-y-2">
              <Swords className="w-8 h-8 mx-auto text-[#77736B] dark:text-[#8E8E93] stroke-[1.5]" />
              <h3 className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3]">
                Waiting for Official Pairings
              </h3>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] max-w-sm mx-auto">
                Tournament directors are currently setting up round fixtures. Your match and opponent will appear here as soon as pairings are generated.
              </p>
            </div>
          ) : isBye ? (
            /* AUTOMATIC BYE NOMINATION NOTICE */
            <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/20 to-emerald-500/15 border-2 border-emerald-500/60 rounded-2xl p-5 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto text-xl font-bold">
                🛡️
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-300 font-bold block">
                OFFICIAL KNOCKOUT NOMINATION
              </span>
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                Automatic BYE Awarded for this Round
              </h3>
              <p className="text-xs text-[#4E4C47] dark:text-[#9E9B93] max-w-md mx-auto">
                Because there is an odd number of players, you have been directly nominated and advanced to the next round with <strong className="text-emerald-700 dark:text-emerald-400">+3 victory points</strong>!
              </p>
            </div>
          ) : (
            /* LIVE OR SCHEDULED MATCH OPPONENT & PIECE DISPLAY */
            <div className="space-y-4">
              
              {/* Color Role Callout */}
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-mono ${
                isPlayerWhite
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
                  : 'bg-[#171715]/10 dark:bg-white/10 border-[#171715]/20 dark:border-white/20 text-[#171715] dark:text-[#FAF8F3]'
              }`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg select-none">
                    {isPlayerWhite ? '♔' : '♚'}
                  </span>
                  <div>
                    <span className="font-bold uppercase block text-xs">
                      {isPlayerWhite ? 'You play WHITE Pieces' : 'You play BLACK Pieces'}
                    </span>
                    <span className="text-[10px] opacity-80">
                      {isPlayerWhite ? 'You make the opening move' : 'Opponent moves first'}
                    </span>
                  </div>
                </div>

                <span className="font-bold uppercase text-[10px] bg-white dark:bg-[#1E1E1C] px-2.5 py-1 rounded-lg border border-current shadow-2xs">
                  {currentMatch.durationMinutes || 10}m Rapid
                </span>
              </div>

              {/* Opponent Card */}
              <div className="grid grid-cols-5 items-center gap-2 p-4 bg-[#EFEAE1]/60 dark:bg-[#191917] rounded-2xl border border-[#D5CFC5]/80 dark:border-[#282826] text-center">
                <div className="col-span-2">
                  <span className="text-[10px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93] block">
                    You ({isPlayerWhite ? 'White' : 'Black'})
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3] truncate mt-0.5">
                    {player?.fullName}
                  </h4>
                  <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400 block mt-1">
                    {isPlayerWhite ? '♔ Opening Move' : '♚ Defending'}
                  </span>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center">
                  <span className="w-7 h-7 rounded-full bg-[#171715] dark:bg-[#FAF8F3] text-white dark:text-[#0D0D0D] font-mono text-[10px] font-bold flex items-center justify-center shadow-xs">
                    VS
                  </span>
                </div>

                <div className="col-span-2">
                  <span className="text-[10px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93] block">
                    Opponent ({isPlayerWhite ? 'Black' : 'White'})
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3] truncate mt-0.5">
                    {opponentName}
                  </h4>
                  <span className="text-xs font-mono font-bold uppercase text-amber-700 dark:text-amber-400 block mt-1">
                    {isPlayerWhite ? '♚ Defending' : '♔ Opening Move'}
                  </span>
                </div>
              </div>

              {/* COMPLETED MATCH FINAL RESULT BANNER */}
              {isCompleted && (
                <div className={`p-4 sm:p-5 rounded-2xl border-2 text-center space-y-1.5 shadow-md ${
                  isWinnerMe
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-950 dark:text-emerald-200'
                    : isWinnerOpponent
                    ? 'bg-rose-500/15 border-rose-500/60 text-rose-950 dark:text-rose-200'
                    : 'bg-amber-500/15 border-amber-500/60 text-amber-950 dark:text-amber-200'
                }`}>
                  <div className="text-xl sm:text-2xl font-serif font-black">
                    {isWinnerMe ? '👑 MATCH VICTORY!' : isWinnerOpponent ? '⚔️ MATCH CONCLUDED' : '🤝 DRAW'}
                  </div>
                  <p className="font-sans font-medium text-xs sm:text-sm">
                    {isWinnerMe
                      ? `Congratulations! You won the match!`
                      : isWinnerOpponent
                      ? `${opponentName} won the match.`
                      : 'Match concluded with an official draw.'}
                  </p>
                  <div className="font-mono text-[11px] font-bold opacity-80 pt-1">
                    Official Result: {currentMatch.winnerPlayer?.fullName ? `Winner: ${currentMatch.winnerPlayer.fullName}` : (currentMatch.winner === 'draw' ? 'Draw' : 'Decided by Official Arbiter')}
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------- */}
              {/* RAPID 10-MINUTE CHESS MATCH ARENA CLOCK & STATUS          */}
              {/* --------------------------------------------------------- */}
              <div className="bg-[#FAF8F3] dark:bg-[#181816] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-4 sm:p-6 space-y-4 shadow-sm select-none">
                
                {/* Clock Header */}
                <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-bold uppercase tracking-wider text-[#171715] dark:text-[#FAF8F3]">
                      Rapid Match Clock
                    </span>
                    <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">({currentMatch.durationMinutes || 10}:00 Rapid)</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isLive
                      ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60 inline-flex items-center gap-1.5'
                      : isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400'
                      : 'bg-[#EFEAE1] dark:bg-[#20201E] text-[#77736B] dark:text-[#8E8E93]'
                  }`}>
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                    {currentMatch.status}
                  </span>
                </div>

                {/* Flag Fall Announcement */}
                {flagFall && (
                  <div className="bg-rose-500/20 border-2 border-rose-500 rounded-2xl p-3 text-center">
                    <span className="text-xs font-mono font-bold uppercase text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
                      <Flag className="w-4 h-4" />
                      TIME OUT! Flag fell on {flagFall.toUpperCase()}!
                    </span>
                    <h4 className="font-serif font-black text-base text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                      {flagFall === pieceColor ? 'You ran out of time.' : 'Opponent ran out of time!'}
                    </h4>
                  </div>
                )}

                {/* DUAL DISPLAY (YOUR TIME VS OPPONENT TIME) */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* YOUR CLOCK */}
                  <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    isLive
                      ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-500/80 shadow-xs'
                      : 'bg-[#EFEAE1]/50 dark:bg-[#1D1D1B] border-[#D5CFC5] dark:border-[#282826]'
                  }`}>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] block">
                      Your Time ({isPlayerWhite ? 'White' : 'Black'})
                    </span>
                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight block py-1 text-[#171715] dark:text-[#FAF8F3]">
                      {formatClockTime(isPlayerWhite ? whiteSeconds : blackSeconds)}
                    </span>
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] block">
                      {isPlayerWhite ? 'Opening Pieces' : 'Defending Pieces'}
                    </span>
                  </div>

                  {/* OPPONENT CLOCK */}
                  <div className={`p-4 rounded-2xl border-2 text-center transition-all ${
                    isLive
                      ? 'bg-amber-100/70 dark:bg-amber-950/40 border-amber-500/80 shadow-xs'
                      : 'bg-[#EFEAE1]/50 dark:bg-[#1D1D1B] border-[#D5CFC5] dark:border-[#282826]'
                  }`}>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#77736B] dark:text-[#8E8E93] block truncate">
                      Opponent ({isPlayerWhite ? 'Black' : 'White'})
                    </span>
                    <span className="text-3xl sm:text-4xl font-mono font-black tracking-tight block py-1 text-[#171715] dark:text-[#FAF8F3]">
                      {formatClockTime(isPlayerWhite ? blackSeconds : whiteSeconds)}
                    </span>
                    <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] block truncate">
                      {opponentName}
                    </span>
                  </div>

                </div>

                {/* MATCH STATUS / TAP TO SWITCH PAWN MOVE */}
                <div className="pt-1">
                  {isCompleted ? (
                    <div className="w-full py-4 px-4 rounded-2xl bg-[#EFEAE1] dark:bg-[#1C1C1A] border border-[#D5CFC5] dark:border-[#282826] text-center space-y-1">
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
                        ✓ Match Completed & Outcome Decided
                      </span>
                      <span className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-sans">
                        Winner: {currentMatch.winnerPlayer?.fullName || (currentMatch.winner === 'player1' ? currentMatch.player1?.fullName : currentMatch.winner === 'player2' ? currentMatch.player2?.fullName : currentMatch.winner === 'draw' ? 'Draw' : 'Decided by Arbiter')}
                      </span>
                    </div>
                  ) : isLive ? (
                    <div className="space-y-3">
                      {/* Clock Control / Paused State / Tap-to-Move */}
                      {!isClockRunning ? (
                        <div className="w-full py-4 px-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/40 text-center space-y-1">
                          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            <Pause className="w-4 h-4 fill-current text-amber-600" />
                            <span>Match Paused by Arbiter</span>
                          </div>
                          <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-sans">
                            Clocks are temporarily held by tournament director. Waiting for arbiter to resume.
                          </p>
                        </div>
                      ) : isMyTurn ? (
                        <button
                          type="button"
                          onClick={handlePassTurn}
                          disabled={!isClockRunning || !!flagFall}
                          className="w-full py-4 sm:py-5 px-4 rounded-2xl font-mono font-bold text-sm sm:text-base uppercase tracking-wider flex flex-col items-center justify-center gap-1 transition-all duration-150 shadow-md cursor-pointer active:scale-[0.98] select-none bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30 ring-4 ring-amber-500/25"
                        >
                          <span className="flex items-center gap-2">
                            TAP WHEN YOU MOVE PAWN / PIECE ⇆
                          </span>
                          <span className="text-[11px] font-normal tracking-wide opacity-90 font-sans">
                            Pauses your time and starts opponent clock immediately
                          </span>
                        </button>
                      ) : (
                        <div className="w-full py-4 px-4 rounded-2xl bg-[#EFEAE1]/60 dark:bg-[#1C1C1A] border border-[#D5CFC5]/80 dark:border-[#282826] text-center space-y-1">
                          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            <span>Opponent's Turn Active ({opponentName})</span>
                          </div>
                          <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-sans">
                            Opponent clock is counting down. Your button activates once opponent moves.
                          </p>
                        </div>
                      )}

                      {/* Status Strip & Undo Button */}
                      <div className="flex items-center justify-between px-1 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[#171715] dark:text-[#FAF8F3] font-bold">
                            {activeTurn === 'white' ? "White's Turn Active" : "Black's Turn Active"}
                          </span>
                          <span className="text-[#77736B] dark:text-[#8E8E93] text-[10px]">
                            ({movesCount} move{movesCount === 1 ? '' : 's'})
                          </span>
                        </div>

                        {lastTurnState && (
                          <button
                            type="button"
                            onClick={handleUndoTurn}
                            className="px-3 py-1.5 rounded-xl border border-amber-500/50 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 text-[11px] font-bold inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                            title="Undo accidental turn switch"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Undo Turn ↩</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full py-4 px-4 rounded-2xl bg-[#EFEAE1]/60 dark:bg-[#1C1C1A] border border-[#D5CFC5]/80 dark:border-[#282826] text-center space-y-1">
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">
                        Fixture Scheduled
                      </span>
                      <span className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-sans">
                        Report to board. Match will be officially started by the tournament arbiter, starting from White's opening turn.
                      </span>
                    </div>
                  )}
                </div>

                {/* Clock Footer Strip */}
                <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-[#D5CFC5]/50 dark:border-[#262624]">
                  <span className="text-[#77736B] dark:text-[#8E8E93]">
                    Knockout Single Elimination
                  </span>

                  <Link
                    href={`/chess/matches/${currentMatch._id || currentMatch.matchId}`}
                    className="text-amber-700 dark:text-amber-400 hover:underline text-[10px] font-bold uppercase tracking-wider pl-1"
                  >
                    Match Dossier →
                  </Link>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* MATCH HISTORY & BRACKET PROGRESS                              */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3 text-xs font-mono">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">
                COMPETITOR TOURNAMENT RECORD
              </span>
              <h3 className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3]">
                Your Fixtures & History ({matchHistory.length})
              </h3>
            </div>

            <Link
              href="/chess/matches"
              className="text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold text-xs uppercase"
            >
              <span>Full Bracket Tree</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {matchHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#77736B] dark:text-[#8E8E93]">
              No previous matches recorded yet. Your scores and game results will show here.
            </div>
          ) : (
            <div className="space-y-2">
              {matchHistory.map((m) => {
                const isP1 = (m.player1?._id || m.player1) === (player?._id || player?.playerId);
                const oppName = isP1
                  ? m.player2?.fullName || (m.isBye ? 'BYE (Automatic Advance)' : 'Opponent')
                  : m.player1?.fullName || 'Opponent';

                const totalSec = (m.durationMinutes || 10) * 60;
                const wRem = typeof m.whiteTimeRemaining === 'number' ? m.whiteTimeRemaining : totalSec;
                const bRem = typeof m.blackTimeRemaining === 'number' ? m.blackTimeRemaining : totalSec;
                const wUsed = Math.max(0, totalSec - wRem);
                const bUsed = Math.max(0, totalSec - bRem);

                const myUsed = isP1 ? wUsed : bUsed;
                const oppUsed = isP1 ? bUsed : wUsed;
                const myRem = isP1 ? wRem : bRem;
                const oppRem = isP1 ? bRem : wRem;

                const formatMinSec = (secs) => {
                  const mins = Math.floor(secs / 60);
                  const s = secs % 60;
                  return `${mins}m ${String(s).padStart(2, '0')}s`;
                };

                return (
                  <div
                    key={m._id || m.matchId}
                    className="p-3.5 rounded-2xl bg-[#EFEAE1]/50 dark:bg-[#1A1A18] border border-[#D5CFC5]/60 dark:border-[#262624] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                          <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{m.matchId}</span>
                          <span>•</span>
                          <span>{m.roundName || `Round ${m.round}`}</span>
                          <span>•</span>
                          <span className="font-semibold text-amber-700 dark:text-amber-400">
                            {isP1 ? '♔ You played White' : '♚ You played Black'}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                          vs. {oppName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2.5 font-mono">
                        {m.status === 'completed' ? (
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                            {m.winnerPlayer?.fullName ? `👑 ${m.winnerPlayer.fullName.split(' ')[0]}` : m.winner === 'draw' ? '🤝 Draw' : 'Completed'}
                          </span>
                        ) : null}
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          m.status === 'live'
                            ? 'bg-rose-100 text-rose-700'
                            : m.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-[#EFEAE1] text-[#77736B]'
                        }`}>
                          {m.isBye ? 'BYE' : m.status}
                        </span>
                      </div>
                    </div>

                    {/* Time Taken breakdown for Player and Opponent */}
                    {!m.isBye && (m.status === 'completed' || m.status === 'live') && (
                      <div className="pt-2 border-t border-[#D5CFC5]/50 dark:border-[#262624]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                        <div className="flex items-center gap-1.5 text-[#171715] dark:text-[#FAF8F3]">
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span className="text-[#77736B] dark:text-[#8E8E93]">Time Taken:</span>
                          <span className="font-bold text-amber-700 dark:text-amber-400">
                            You: {formatMinSec(myUsed)}
                          </span>
                          <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                            ({formatClockTime(myRem)} left)
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[#4E4C47] dark:text-[#9E9B93]">
                          <span className="text-[#77736B] dark:text-[#8E8E93]">Opponent:</span>
                          <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">
                            {formatMinSec(oppUsed)}
                          </span>
                          <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                            ({formatClockTime(oppRem)} left)
                          </span>
                          {typeof m.movesCount === 'number' && m.movesCount > 0 && (
                            <span className="ml-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                              {m.movesCount} moves
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      <ChessFooter />
    </div>
  );
}
