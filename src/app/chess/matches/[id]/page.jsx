'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { DualChessClock } from '@/components/chess/DualChessClock';
import { ChessFooter } from '@/components/chess/ChessFooter';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, Trophy, Info, Play, Loader2, Crown, Zap } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

function formatClockTime(seconds) {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function ChessMatchDetailPage() {
  const params = useParams();
  const toast = useToast();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live Turn-Based Clocks for Spectator View
  const [whiteSeconds, setWhiteSeconds] = useState(600);
  const [blackSeconds, setBlackSeconds] = useState(600);
  const [activeTurn, setActiveTurn] = useState('white');
  const [isClockRunning, setIsClockRunning] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [flagFall, setFlagFall] = useState(null);

  useEffect(() => {
    let intervalId;

    async function fetchMatch(isSilent = false) {
      if (!params?.id) return;
      if (!isSilent) setLoading(true);
      try {
        const res = await chessApi.getMatchById(params.id);
        if (res.success && res.data) {
          setMatchData(res.data);
        }
      } catch (err) {
        console.error('Error loading match detail:', err);
      } finally {
        if (!isSilent) setLoading(false);
      }
    }

    fetchMatch(false);

    // Live real-time sync polling every 3 seconds
    intervalId = setInterval(() => {
      fetchMatch(true);
    }, 3000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [params?.id]);

  // Sync clocks when matchData updates from server
  useEffect(() => {
    if (!matchData?.match) return;
    const m = matchData.match;
    const initialSec = (m.durationMinutes || 10) * 60;
    let wSec = typeof m.whiteTimeRemaining === 'number' ? m.whiteTimeRemaining : initialSec;
    let bSec = typeof m.blackTimeRemaining === 'number' ? m.blackTimeRemaining : initialSec;
    const running = m.isClockRunning ?? (m.status === 'live');
    const turn = m.activeTurn && m.activeTurn !== 'none' ? m.activeTurn : 'white';

    if (running && m.lastClockUpdate) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(m.lastClockUpdate).getTime()) / 1000));
      if (turn === 'white') wSec = Math.max(0, wSec - elapsed);
      else if (turn === 'black') bSec = Math.max(0, bSec - elapsed);
    }

    setWhiteSeconds(prev => {
      if (isClockRunning && running && activeTurn === turn && Math.abs(prev - wSec) <= 2) return prev;
      return wSec;
    });
    setBlackSeconds(prev => {
      if (isClockRunning && running && activeTurn === turn && Math.abs(prev - bSec) <= 2) return prev;
      return bSec;
    });
    setActiveTurn(turn);
    setIsClockRunning(running && wSec > 0 && bSec > 0);
    setMovesCount(m.movesCount || 0);

    if (wSec <= 0) setFlagFall('white');
    else if (bSec <= 0) setFlagFall('black');
    else setFlagFall(null);
  }, [matchData?.match]);

  // BroadcastChannel for instant 0ms sync with phone clock moves & ticks
  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;

    const channel = new BroadcastChannel('chess_tournament_clock');
    channel.onmessage = (event) => {
      const data = event.data;
      if (!data) return;

      const currentMId = matchData?.match?._id || matchData?.match?.matchId;
      const targetId = params?.id;
      if (data.matchId && data.matchId !== currentMId && data.matchId !== targetId) return;

      const w = typeof data.whiteSeconds === 'number' ? data.whiteSeconds : (typeof data.p1Time === 'number' ? data.p1Time : null);
      const b = typeof data.blackSeconds === 'number' ? data.blackSeconds : (typeof data.p2Time === 'number' ? data.p2Time : null);

      if (w !== null) setWhiteSeconds(w);
      if (b !== null) setBlackSeconds(b);
      if (data.activeTurn) setActiveTurn(data.activeTurn);
      const running = data.isClockRunning !== undefined ? data.isClockRunning : data.isRunning;
      if (typeof running === 'boolean') setIsClockRunning(running);
      if (typeof data.movesCount === 'number') setMovesCount(data.movesCount);
      if (data.flagFall !== undefined) setFlagFall(data.flagFall);
    };

    return () => {
      channel.close();
    };
  }, [params?.id, matchData?.match?._id, matchData?.match?.matchId]);

  // 1-second tick down for audience view
  useEffect(() => {
    const isLive = matchData?.match?.status === 'live';
    if (!isClockRunning || !isLive || flagFall) return;

    const timer = setInterval(() => {
      if (activeTurn === 'white') {
        setWhiteSeconds(prev => {
          if (prev <= 1) {
            setFlagFall('white');
            setIsClockRunning(false);
            return 0;
          }
          return prev - 1;
        });
      } else if (activeTurn === 'black') {
        setBlackSeconds(prev => {
          if (prev <= 1) {
            setFlagFall('black');
            setIsClockRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isClockRunning, activeTurn, flagFall, matchData?.match?.status]);


  const match = matchData?.match;
  const p1Raw = match?.player1;
  const p2Raw = match?.player2;

  const player1 = (p1Raw && typeof p1Raw === 'object' && p1Raw.fullName)
    ? p1Raw
    : {
        fullName: typeof p1Raw === 'string' ? p1Raw : (match?.isBye ? (match?.byePlayer?.fullName || 'Player') : 'Player 1 (White)'),
        department: (p1Raw && typeof p1Raw === 'object' && p1Raw.department) || 'TBD'
      };

  const player2 = (p2Raw && typeof p2Raw === 'object' && p2Raw.fullName)
    ? p2Raw
    : {
        fullName: typeof p2Raw === 'string' ? p2Raw : (match?.isBye ? 'BYE' : 'Player 2 (Black)'),
        department: (p2Raw && typeof p2Raw === 'object' && p2Raw.department) || (match?.isBye ? 'Automatic' : 'TBD')
      };

  const p1Initials = player1?.fullName
    ? String(player1.fullName).split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('')
    : 'W';

  const p2Initials = player2?.fullName
    ? String(player2.fullName).split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('')
    : 'B';

  const isCompleted = match?.status === 'completed';
  const isLive = match?.status === 'live';

  // Winner calculation
  let winnerName = null;
  let winnerDepartment = '';
  if (isCompleted && match) {
    if (match.isBye) {
      winnerName = player1.fullName;
      winnerDepartment = player1.department || '';
    } else if (match.winner === 'player1') {
      winnerName = player1.fullName;
      winnerDepartment = player1.department || '';
    } else if (match.winner === 'player2') {
      winnerName = player2.fullName;
      winnerDepartment = player2.department || '';
    } else if (match.winner === 'draw') {
      winnerName = 'Match Drawn (Material Tiebreak)';
    }
  }

  const p1Score = match?.player1MaterialScore ?? 0;
  const p2Score = match?.player2MaterialScore ?? 0;
  let leaderText = 'Score Tied';
  if (p1Score > p2Score) leaderText = `${player1.fullName} leads (+${p1Score - p2Score})`;
  else if (p2Score > p1Score) leaderText = `${player2.fullName} leads (+${p2Score - p1Score})`;

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Navigation & Live Broadcast Pill */}
        <div className="flex items-center justify-between">
          <Link
            href="/chess/matches"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium tracking-widest text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO FIXTURES SCHEDULE</span>
          </Link>

          {isLive && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 fill-current animate-pulse" />
              <span>LIVE TRANSMISSION • AUTO-SYNCED</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-24 bg-[#FAF8F3] dark:bg-[#141414] rounded-3xl border border-[#D5CFC5] dark:border-[#262624] p-8">
            <div className="inline-block w-8 h-8 border-2 border-[#171715] dark:border-[#FAF8F3] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93]">
              Loading Board Dossier...
            </p>
          </div>
        ) : !match ? (
          <div className="text-center py-20 px-4 bg-[#FAF8F3] dark:bg-[#141414] rounded-3xl border border-dashed border-[#D5CFC5] dark:border-[#262624]">
            <p className="font-serif text-lg font-bold text-[#171715] dark:text-[#FAF8F3]">
              Fixture Not Found
            </p>
            <p className="text-xs text-[#77736B] dark:text-[#8E8E93] mt-1 font-sans">
              The requested match ID does not exist in the official bracket.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Grand Match Scoreboard */}
            <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-10 shadow-xs space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-[#171715] dark:text-[#FAF8F3] tracking-wider">
                    {match.matchId}
                  </span>
                  <span className="text-[#77736B] dark:text-[#8E8E93]">•</span>
                  <span className="text-[#77736B] dark:text-[#8E8E93] uppercase">
                    Round {match.round}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                    isLive
                      ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60 inline-flex items-center gap-1.5'
                      : isCompleted
                      ? 'bg-[#EFEAE1] dark:bg-[#1E1E1C] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3]'
                      : 'bg-transparent border border-[#D5CFC5]/80 dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93]'
                  }`}>
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
                    {match.status}
                  </span>
                </div>
              </div>

              {/* Match Completed Winner Banner */}
              {isCompleted && winnerName && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                      <Crown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-bold block">
                        OFFICIAL OUTCOME DECIDED
                      </span>
                      <h3 className="text-base sm:text-lg font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                        {winnerName} Advances to Next Round
                      </h3>
                      {winnerDepartment && (
                        <span className="text-xs text-[#77736B] dark:text-[#8E8E93]">{winnerDepartment}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] uppercase text-[#77736B] dark:text-[#8E8E93] block">Method</span>
                    <span className="text-xs font-bold capitalize text-amber-700 dark:text-amber-400">
                      {match.resultType ? match.resultType.replace('_', ' ') : 'Points'}
                    </span>
                  </div>
                </div>
              )}

              {/* Flag Fall Notice */}
              {isLive && flagFall && (
                <div className="bg-rose-500/15 border border-rose-500/40 rounded-2xl p-3 sm:p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold font-mono">
                    <Clock className="w-4 h-4" />
                    <span>Time expired! Flag fell on {flagFall.toUpperCase()} ({flagFall === 'white' ? player1.fullName : player2.fullName})!</span>
                  </div>
                  <span className="font-mono text-[11px] text-[#77736B] dark:text-[#A8A49C]">
                    Current Standings: {leaderText}
                  </span>
                </div>
              )}

              {/* Scoreboard Layout */}
              <div className="grid grid-cols-1 md:grid-cols-5 items-center gap-6 py-4">
                
                {/* Player 1 (White) */}
                <div className="md:col-span-2 flex flex-col items-center text-center space-y-2">
                  <div className="w-20 h-20 rounded-2xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] border border-[#D5CFC5] dark:border-[#383733] flex items-center justify-center font-serif font-bold text-2xl shadow-sm">
                    {p1Initials}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                      White Pieces
                    </span>
                    <h2 className="text-lg font-serif font-bold text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                      {player1.fullName}
                    </h2>
                    <span className="text-xs text-[#77736B] dark:text-[#8E8E93] font-sans block">
                      {player1.department}
                    </span>
                  </div>
                  <div className="pt-2">
                    {isCompleted ? (
                      match.winner === 'player1' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold uppercase">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>Winner 👑</span>
                        </span>
                      ) : match.winner === 'draw' ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold uppercase">
                          Draw 🤝
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-[#77736B] dark:text-[#8E8E93]">
                          Defeated
                        </span>
                      )
                    ) : isLive ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-300 font-mono text-xs font-bold uppercase">
                        Live In Game
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#77736B] dark:text-[#8E8E93]">
                        Pending Start
                      </span>
                    )}
                  </div>

                  {/* Player 1 Specific Clock */}
                  <div className={`w-full max-w-[210px] mt-2.5 px-3 py-2 rounded-xl border font-mono transition-all ${
                    isLive && activeTurn === 'white'
                      ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 shadow-sm ring-2 ring-amber-400/40 text-amber-900 dark:text-amber-200'
                      : 'bg-[#EFEAE1]/80 dark:bg-[#1C1C1A] border-[#D5CFC5] dark:border-[#2A2A28] text-[#171715] dark:text-[#FAF8F3]'
                  }`}>
                    <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 mb-0.5">
                      {isLive && activeTurn === 'white' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span>White Clock</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {formatClockTime(whiteSeconds)}
                    </div>
                    {isLive && activeTurn === 'white' && (
                      <span className="text-[9px] uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mt-0.5 animate-pulse">
                        Turn Counting
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider / Match Status */}
                <div className="md:col-span-1 flex flex-col items-center justify-center space-y-3 py-4 md:py-0 border-y md:border-y-0 md:border-x border-[#D5CFC5]/50 dark:border-[#262624]">
                  <span className="text-2xl font-serif italic text-[#77736B] dark:text-[#8E8E93] font-normal select-none">
                    VS
                  </span>

                  {isLive ? (
                    <div className="flex flex-col items-center gap-1.5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 shadow-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                        <span>{activeTurn === 'white' ? 'White Turn' : 'Black Turn'}</span>
                      </div>
                      <span className="text-xs font-mono font-medium text-[#77736B] dark:text-[#8E8E93]">
                        {movesCount} Move{movesCount === 1 ? '' : 's'} Played
                      </span>
                      <span className="text-[9px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93] tracking-widest mt-0.5">
                        Live Auto-Sync
                      </span>
                    </div>
                  ) : isCompleted ? (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        FINAL
                      </span>
                      <span className="text-[11px] font-mono text-[#77736B] dark:text-[#8E8E93]">
                        {movesCount} Moves
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-center">
                      <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        SCHEDULED
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93]">
                        10:00 Each
                      </span>
                    </div>
                  )}
                </div>

                {/* Player 2 (Black) */}
                <div className="md:col-span-2 flex flex-col items-center text-center space-y-2">
                  <div className="w-20 h-20 rounded-2xl bg-[#3E3C37] dark:bg-[#252523] text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#383733] flex items-center justify-center font-serif font-bold text-2xl shadow-sm">
                    {p2Initials}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                      Black Pieces
                    </span>
                    <h2 className="text-lg font-serif font-bold text-[#171715] dark:text-[#FAF8F3] mt-0.5">
                      {player2.fullName}
                    </h2>
                    <span className="text-xs text-[#77736B] dark:text-[#8E8E93] font-sans block">
                      {player2.department}
                    </span>
                  </div>
                  <div className="pt-2">
                    {isCompleted ? (
                      match.winner === 'player2' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold uppercase">
                          <Crown className="w-3.5 h-3.5 text-amber-500" />
                          <span>Winner 👑</span>
                        </span>
                      ) : match.winner === 'draw' ? (
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 dark:text-amber-300 font-mono text-xs font-bold uppercase">
                          Draw 🤝
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-[#77736B] dark:text-[#8E8E93]">
                          Defeated
                        </span>
                      )
                    ) : isLive ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-rose-500/15 text-rose-800 dark:text-rose-300 font-mono text-xs font-bold uppercase">
                        Live In Game
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-[#77736B] dark:text-[#8E8E93]">
                        Pending Start
                      </span>
                    )}
                  </div>

                  {/* Player 2 Specific Clock */}
                  <div className={`w-full max-w-[210px] mt-2.5 px-3 py-2 rounded-xl border font-mono transition-all ${
                    isLive && activeTurn === 'black'
                      ? 'bg-amber-100 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600 shadow-sm ring-2 ring-amber-400/40 text-amber-900 dark:text-amber-200'
                      : 'bg-[#EFEAE1]/80 dark:bg-[#1C1C1A] border-[#D5CFC5] dark:border-[#2A2A28] text-[#171715] dark:text-[#FAF8F3]'
                  }`}>
                    <div className="text-[10px] uppercase tracking-wider font-semibold flex items-center justify-center gap-1.5 mb-0.5">
                      {isLive && activeTurn === 'black' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      <span>Black Clock</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {formatClockTime(blackSeconds)}
                    </div>
                    {isLive && activeTurn === 'black' && (
                      <span className="text-[9px] uppercase tracking-widest font-bold text-amber-700 dark:text-amber-400 block mt-0.5 animate-pulse">
                        Turn Counting
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Match Details Meta Banner */}
              <div className="bg-[#EFEAE1]/60 dark:bg-[#1A1A18] border border-[#D5CFC5]/70 dark:border-[#262624] rounded-2xl p-4 flex flex-wrap items-center justify-around gap-4 text-center font-mono text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">Time Control</span>
                  <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{match.durationMinutes || 10} Min Rapid</span>
                </div>
                <div className="border-l border-[#D5CFC5]/50 dark:border-[#262624] pl-4">
                  <span className="text-[9px] uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">Round Format</span>
                  <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">Knockout Single Elimination</span>
                </div>
                <div className="border-l border-[#D5CFC5]/50 dark:border-[#262624] pl-4">
                  <span className="text-[9px] uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">Advancement</span>
                  <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">Winner Advances to Next Round</span>
                </div>
              </div>

            </div>

            {/* Interactive Turn-Based Dual Chess Clock (10:00 Rapid Control) */}
            {!match.isBye && (
              <DualChessClock
                match={match}
                initialMinutes={match.durationMinutes || 10}
                player1Name={`${player1.fullName} (White)`}
                player2Name={`${player2.fullName} (Black)`}
                variant="standard"
                onTimeExpired={(flaggedColor) => {
                  toast.error(`Time expired! Flag fell on ${flaggedColor.toUpperCase()}!`);
                }}
              />
            )}

          </div>
        )}

      </main>

      <ChessFooter />
    </div>
  );
}
