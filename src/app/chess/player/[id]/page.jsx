'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessFooter } from '@/components/chess/ChessFooter';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChessPlayerDetailPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!params?.id) return;
      try {
        const res = await chessApi.getPlayerById(params.id);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error loading player details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [params?.id]);

  const player = data?.player;
  const matchHistory = data?.matchHistory || [];

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans text-[#111111] antialiased">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        <Link
          href="/chess/players"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#666666] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Competitors</span>
        </Link>

        {loading ? (
          <div className="text-center py-20 text-[#666666] bg-white rounded-2xl border border-[#E5E5E5]">
            Loading player profile...
          </div>
        ) : !player ? (
          <div className="text-center py-20 text-[#666666] bg-white rounded-2xl border border-[#E5E5E5]">
            Player not found.
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Profile Overview Card */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-[#E5E5E5] flex items-center justify-center text-white font-bold font-display text-2xl shadow-xs">
                  {player.fullName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#C9A227]">{player.playerId}</span>
                    <span className="badge-completed px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                      {player.status}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold font-display text-[#111111] uppercase mt-0.5">
                    {player.fullName}
                  </h1>
                  <p className="text-xs text-[#666666]">{player.department}</p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-3 text-center bg-gray-50 border border-[#E5E5E5] p-3.5 rounded-xl font-mono text-xs w-full md:w-auto">
                <div>
                  <span className="text-[9px] text-[#666666] uppercase block">Rank</span>
                  <span className="text-base font-bold text-[#111111]">#{player.rank || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666666] uppercase block">Played</span>
                  <span className="text-base font-bold text-[#111111]">{player.matchesPlayed || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666666] uppercase block">Mat. Pts</span>
                  <span className="text-base font-bold text-[#111111]">{player.materialPoints || 0}</span>
                </div>
                <div>
                  <span className="text-[9px] text-[#666666] uppercase block">Points</span>
                  <span className="text-base font-bold text-[#C9A227]">{player.tournamentPoints || 0}</span>
                </div>
              </div>
            </div>

            {/* Match History */}
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-bold font-display text-[#111111] tracking-wider uppercase">
                MATCH HISTORY ({matchHistory.length})
              </h3>

              {matchHistory.length === 0 ? (
                <p className="text-xs text-[#666666] py-6 text-center">No match history recorded yet.</p>
              ) : (
                <div className="divide-y divide-[#E5E5E5] text-xs">
                  {matchHistory.map((m) => {
                    const p1 = m.player1?.fullName || 'Player 1';
                    const p2 = m.player2?.fullName || 'Player 2';
                    return (
                      <div key={m._id} className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-lg">
                        <div>
                          <span className="font-mono font-bold text-[#111111] mr-2">Round {m.round}</span>
                          <span className="font-semibold text-[#111111]">{p1} VS {p2}</span>
                        </div>
                        <div className="font-mono text-right">
                          <span className="font-bold text-[#111111] mr-3">
                            {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                          </span>
                          <span className="badge-completed px-2 py-0.5 rounded-full text-[10px]">
                            {m.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      <ChessFooter />
    </div>
  );
}
