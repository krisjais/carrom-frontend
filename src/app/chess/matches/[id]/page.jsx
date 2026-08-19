'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { MatchTimer } from '@/components/chess/MatchTimer';
import { PieceScore } from '@/components/chess/PieceScore';
import { ChessFooter } from '@/components/chess/ChessFooter';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
  const player1 = match?.player1 || { fullName: 'Player 1', department: 'TBD' };
  const player2 = match?.player2 || { fullName: 'Player 2', department: 'TBD' };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans text-[#111111] antialiased">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        <Link
          href="/chess/matches"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#666666] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Matches Schedule</span>
        </Link>

        {loading ? (
          <div className="text-center py-20 text-[#666666] bg-white rounded-2xl border border-[#E5E5E5]">
            Loading match details...
          </div>
        ) : !match ? (
          <div className="text-center py-20 text-[#666666] bg-white rounded-2xl border border-[#E5E5E5]">
            Match not found.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Match Header Scoreboard */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs text-center space-y-6">
              
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 text-xs font-mono">
                <span className="font-bold text-[#111111]">{match.matchId} | Round {match.round}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  match.status === 'live' ? 'badge-live' : match.status === 'completed' ? 'badge-completed' : 'bg-gray-100 text-gray-700'
                }`}>
                  {match.status.toUpperCase()}
                </span>
              </div>

              {/* Scoreboard Layout */}
              <div className="grid grid-cols-5 items-center gap-4 py-4">
                <div className="col-span-2 flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gray-900 border border-[#E5E5E5] flex items-center justify-center text-white font-bold font-display text-xl">
                    {player1.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h2 className="text-sm font-bold font-display text-[#111111]">{player1.fullName}</h2>
                  <span className="text-xs text-[#666666]">{player1.department}</span>
                  <span className="text-2xl font-bold font-mono text-[#111111] pt-2">{match.player1MaterialScore || 0}</span>
                </div>

                <div className="col-span-1 flex flex-col items-center justify-center space-y-2">
                  <span className="w-10 h-10 rounded-full bg-gray-100 border border-[#E5E5E5] text-[#111111] font-bold text-sm font-mono flex items-center justify-center">
                    VS
                  </span>
                  <MatchTimer match={match} durationMinutes={match.durationMinutes || 10} />
                </div>

                <div className="col-span-2 flex flex-col items-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-gray-800 border border-[#E5E5E5] flex items-center justify-center text-white font-bold font-display text-xl">
                    {player2.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h2 className="text-sm font-bold font-display text-[#111111]">{player2.fullName}</h2>
                  <span className="text-xs text-[#666666]">{player2.department}</span>
                  <span className="text-2xl font-bold font-mono text-[#111111] pt-2">{match.player2MaterialScore || 0}</span>
                </div>
              </div>

            </div>

            {/* Captured Piece Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieceScore captured={match.player1Captured} materialScore={match.player1MaterialScore} playerName={player1.fullName} />
              <PieceScore captured={match.player2Captured} materialScore={match.player2MaterialScore} playerName={player2.fullName} />
            </div>

          </div>
        )}

      </main>

      <ChessFooter />
    </div>
  );
}
