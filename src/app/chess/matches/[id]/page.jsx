'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { MatchTimer } from '@/components/chess/MatchTimer';
import { PieceScore } from '@/components/chess/PieceScore';
import { ChessFooter } from '@/components/chess/ChessFooter';
import Link from 'next/link';
import { ArrowLeft, Clock, ShieldCheck, Trophy, Info } from 'lucide-react';

export default function ChessMatchDetailPage() {
  const params = useParams();
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      if (!params?.id) return;
      try {
        const res = await chessApi.getMatchById(params.id);
        if (res.success) {
          setMatchData(res.data);
        }
      } catch (err) {
        console.error('Error loading match detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [params?.id]);

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

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Navigation */}
        <div>
          <Link
            href="/chess/matches"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium tracking-widest text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO FIXTURES SCHEDULE</span>
          </Link>
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
                      {match.player1MaterialScore ?? 0}
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
                  <MatchTimer match={match} durationMinutes={match.durationMinutes || 10} />
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
                      {match.player2MaterialScore ?? 0}
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
                  <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">Swiss System</span>
                </div>
                <div className="border-l border-[#D5CFC5]/50 dark:border-[#262624] pl-4">
                  <span className="text-[9px] uppercase tracking-wider text-[#77736B] dark:text-[#8E8E93] block">Win Reward</span>
                  <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">+3 Tournament Pts</span>
                </div>
              </div>

            </div>

            {/* Captured Piece Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieceScore
                captured={match.player1Captured}
                materialScore={match.player1MaterialScore}
                playerName={`${player1.fullName} (White)`}
              />
              <PieceScore
                captured={match.player2Captured}
                materialScore={match.player2MaterialScore}
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
