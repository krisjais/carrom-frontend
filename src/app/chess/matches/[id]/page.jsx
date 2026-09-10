'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { MatchTimer } from '@/components/chess/MatchTimer';
import { PieceScore } from '@/components/chess/PieceScore';
import { ChessFooter } from '@/components/chess/ChessFooter';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, Trophy, Info, Play, Loader2, Crown, Zap } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ChessMatchDetailPage() {
  const params = useParams();
  const toast = useToast();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingMatch, setStartingMatch] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

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

    // Live real-time sync polling every 2.5 seconds: captures, scores, status, clocks update automatically!
    intervalId = setInterval(() => {
      fetchMatch(true);
    }, 2500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [params?.id]);

  const handleStartLiveMatch = async () => {
    if (!matchData?.match?._id && !matchData?.match?.matchId) return;
    setStartingMatch(true);
    try {
      const matchId = matchData.match._id || matchData.match.matchId;
      const res = await chessApi.startMatch(matchId);
      if (res.success) {
        setMatchData((prev) => ({
          ...prev,
          match: {
            ...prev.match,
            status: 'live',
            actualStartTime: new Date(),
            durationMinutes: 10
          }
        }));
        toast.success('Live match started successfully!');
      } else {
        toast.error(res.message || 'Failed to start match.');
      }
    } catch (err) {
      toast.error(err.message || 'Error starting match.');
    } finally {
      setStartingMatch(false);
    }
  };

  const handleTimeExpired = () => {
    setIsTimeUp(true);
  };

  const match = matchData?.match;
  const player1 = match?.player1 || { fullName: 'Player 1 (White)', department: 'TBD' };
  const player2 = match?.player2 || { fullName: 'Player 2 (Black)', department: 'TBD' };

  const p1Initials = player1.fullName
    ? player1.fullName.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('')
    : 'W';

  const p2Initials = player2.fullName
    ? player2.fullName.split(' ').filter(Boolean).map((n) => n[0]).slice(0, 2).join('')
    : 'B';

  const isCompleted = match?.status === 'completed';
  const isLive = match?.status === 'live';

  // Winner calculation
  let winnerName = null;
  let winnerDepartment = '';
  if (isCompleted) {
    if (match.isBye) {
      winnerName = player1.fullName;
      winnerDepartment = player1.department;
    } else if (match.winner === 'player1') {
      winnerName = player1.fullName;
      winnerDepartment = player1.department;
    } else if (match.winner === 'player2') {
      winnerName = player2.fullName;
      winnerDepartment = player2.department;
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
                  {match.status === 'scheduled' && !match.isBye && (
                    <button
                      onClick={handleStartLiveMatch}
                      disabled={startingMatch}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold font-mono uppercase px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="Start 10:00 live timer"
                    >
                      {startingMatch ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3 fill-current" />
                      )}
                      <span>Start Live Match (10:00)</span>
                    </button>
                  )}

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
                      👑
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

              {/* 10-Minute Limit Expiry Notice */}
              {isLive && isTimeUp && (
                <div className="bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3 sm:p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold font-mono">
                    <Clock className="w-4 h-4" />
                    <span>10-Minute Rapid Clock Expired!</span>
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
                    <span className="text-4xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                      {p1Score}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">
                      Material Points
                    </span>
                  </div>
                </div>

                {/* Divider / Timer */}
                <div className="md:col-span-1 flex flex-col items-center justify-center space-y-3 py-4 md:py-0 border-y md:border-y-0 md:border-x border-[#D5CFC5]/50 dark:border-[#262624]">
                  <span className="text-2xl font-serif italic text-[#77736B] dark:text-[#8E8E93] font-normal select-none">
                    VS
                  </span>
                  <MatchTimer
                    match={match}
                    durationMinutes={match.durationMinutes || 10}
                    onTimeExpired={handleTimeExpired}
                  />
                  {isLive && (
                    <span className="text-[9px] font-mono uppercase text-[#77736B] dark:text-[#8E8E93] tracking-widest text-center">
                      Auto-Syncing Live
                    </span>
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
                    <span className="text-4xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                      {p2Score}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">
                      Material Points
                    </span>
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

            {/* Captured Piece Breakdown (Updates Live) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieceScore
                captured={match.player1Captured}
                materialScore={p1Score}
                playerName={`${player1.fullName} (White)`}
              />
              <PieceScore
                captured={match.player2Captured}
                materialScore={p2Score}
                playerName={`${player2.fullName} (Black)`}
              />
            </div>

          </div>
        )}

      </main>

      <ChessFooter />
    </div>
  );
}
