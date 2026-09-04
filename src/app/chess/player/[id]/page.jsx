'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { chessApi } from '@/lib/chessApi';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessFooter } from '@/components/chess/ChessFooter';
import Link from 'next/link';
import { ArrowLeft, Trophy, Swords, Shield, Award, Calendar } from 'lucide-react';

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

  const initials = player?.fullName
    ? player.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??';

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            href="/chess/players"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium tracking-widest text-[#77736B] dark:text-[#8E8E93] hover:text-[#171715] dark:hover:text-[#FAF8F3] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO COMPETITORS</span>
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-24 bg-[#FAF8F3] dark:bg-[#141414] rounded-3xl border border-[#D5CFC5] dark:border-[#262624] p-8">
            <div className="inline-block w-8 h-8 border-2 border-[#171715] dark:border-[#FAF8F3] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93]">
              Retrieving Dossier...
            </p>
          </div>
        ) : !player ? (
          <div className="text-center py-20 px-4 bg-[#FAF8F3] dark:bg-[#141414] rounded-3xl border border-dashed border-[#D5CFC5] dark:border-[#262624]">
            <p className="font-serif text-lg font-bold text-[#171715] dark:text-[#FAF8F3]">
              Player Dossier Not Found
            </p>
            <p className="text-xs text-[#77736B] dark:text-[#8E8E93] mt-1 font-sans">
              The requested competitor ID does not exist or has been withdrawn.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Primary Profile Overview Hero */}
            <div className="relative overflow-hidden bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-10 shadow-xs">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                
                <div className="flex items-start sm:items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-serif font-bold text-2xl flex items-center justify-center shrink-0 shadow-md">
                    {initials}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold tracking-wider text-[#77736B] dark:text-[#8E8E93]">
                        {player.playerId}
                      </span>
                      <span className="bg-[#EFEAE1] dark:bg-[#1F1F1D] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        {player.status || 'Active'}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
                      {player.fullName}
                    </h1>
                    <p className="text-xs text-[#77736B] dark:text-[#8E8E93] font-sans mt-0.5">
                      {player.department || 'Open Division'} • Registered Competitor
                    </p>
                  </div>
                </div>

                {/* Stat Box Strip */}
                <div className="grid grid-cols-4 gap-2 bg-[#EFEAE1]/70 dark:bg-[#1B1B19] border border-[#D5CFC5]/80 dark:border-[#282826] p-3.5 sm:p-4 rounded-2xl text-center font-mono w-full md:w-auto">
                  <div className="px-2">
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block tracking-wider">Rank</span>
                    <span className="text-xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                      #{player.rank || '—'}
                    </span>
                  </div>
                  <div className="px-2 border-l border-[#D5CFC5]/50 dark:border-[#282826]">
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block tracking-wider">Played</span>
                    <span className="text-xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                      {player.matchesPlayed ?? 0}
                    </span>
                  </div>
                  <div className="px-2 border-l border-[#D5CFC5]/50 dark:border-[#282826]">
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block tracking-wider">Mat. Pts</span>
                    <span className="text-xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                      {player.materialPoints ?? 0}
                    </span>
                  </div>
                  <div className="px-2 border-l border-[#D5CFC5]/50 dark:border-[#282826]">
                    <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block tracking-wider">Total Pts</span>
                    <span className="text-xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
                      {player.tournamentPoints ?? 0}
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Match History Table / Cards */}
            <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#77736B] dark:text-[#8E8E93] font-semibold block">
                    Historical Record
                  </span>
                  <h2 className="text-lg font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    Match History ({matchHistory.length})
                  </h2>
                </div>
              </div>

              {matchHistory.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-[#D5CFC5]/70 dark:border-[#262624] rounded-2xl">
                  <Swords className="w-8 h-8 mx-auto text-[#77736B] dark:text-[#8E8E93] mb-2 stroke-[1.3]" />
                  <p className="text-xs font-serif font-medium text-[#171715] dark:text-[#FAF8F3]">
                    No Fixtures Recorded
                  </p>
                  <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] mt-0.5">
                    Match pairings and material point breakdowns will appear here once rounds begin.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {matchHistory.map((m) => {
                    const p1Name = m.player1?.fullName || 'Player 1';
                    const p2Name = m.player2?.fullName || 'Player 2';
                    const isCompleted = m.status === 'Completed';

                    return (
                      <div
                        key={m._id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-[#EFEAE1]/40 dark:bg-[#191918] border border-[#D5CFC5]/60 dark:border-[#262624] rounded-xl hover:border-[#171715] dark:hover:border-[#FAF8F3] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#EFEAE1] dark:bg-[#222220] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3]">
                            Round {m.round || 1}
                          </span>
                          <span className="font-serif font-medium text-sm text-[#171715] dark:text-[#FAF8F3]">
                            {p1Name} <span className="font-mono text-xs text-[#77736B] dark:text-[#8E8E93] mx-1">VS</span> {p2Name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                          <span className="font-bold text-[#171715] dark:text-[#FAF8F3] text-sm">
                            {m.player1MaterialScore ?? 0} — {m.player2MaterialScore ?? 0}
                          </span>
                          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          }`}>
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
