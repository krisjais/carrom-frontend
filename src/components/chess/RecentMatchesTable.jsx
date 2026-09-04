'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function RecentMatchesTable({ matches = [], loading = false }) {
  return (
    <section className="py-12 sm:py-16 border-t border-[#D5CFC5]/80 dark:border-[#262624] select-none">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#A8A49C] font-semibold block">
            RESULTS & FIXTURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-normal font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight mt-1">
            Recent Matches
          </h2>
        </div>
        
        <Link
          href="/chess/matches"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#171715] dark:text-[#FAF8F3] hover:underline underline-offset-4 font-mono group"
        >
          <span>View All Fixtures ({matches.length})</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Desktop & Tablet Table */}
      <div className="hidden md:block bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#D5CFC5]/60 dark:border-[#262624] text-[#77736B] dark:text-[#8E8E93] font-mono uppercase text-[10px]">
              <th className="py-3 px-4 font-semibold">Match ID</th>
              <th className="py-3 px-3 text-center font-semibold">Round</th>
              <th className="py-3 px-4 font-semibold">Player 1</th>
              <th className="py-3 px-4 font-semibold">Player 2</th>
              <th className="py-3 px-3 text-center font-semibold">Status</th>
              <th className="py-3 px-3 text-center font-semibold">Outcome</th>
              <th className="py-3 px-4 text-right font-semibold">Material Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D5CFC5]/50 dark:divide-[#262624]">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-[#77736B] dark:text-[#8E8E93] font-sans">
                  Loading match records...
                </td>
              </tr>
            ) : matches.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-[#77736B] dark:text-[#8E8E93] font-sans">
                  No match records available yet. Round pairings will appear once scheduled.
                </td>
              </tr>
            ) : (
              matches.slice(0, 8).map((m) => {
                const p1 = m.player1?.fullName || (m.isBye ? (m.byePlayer?.fullName || 'Player') : 'TBD');
                const p2 = m.player2?.fullName || (m.isBye ? 'BYE' : 'TBD');
                const isCompleted = m.status === 'completed';
                const isLive = m.status === 'live';

                let winnerText = '-';
                if (isCompleted) {
                  if (m.isBye) winnerText = 'BYE (+3)';
                  else if (m.winner === 'player1') winnerText = `${p1.split(' ')[0]} Won`;
                  else if (m.winner === 'player2') winnerText = `${p2.split(' ')[0]} Won`;
                  else if (m.winner === 'draw') winnerText = 'Draw';
                  else winnerText = 'Completed';
                }

                const scoreStr = `${m.player1MaterialScore || 0} - ${m.player2MaterialScore || 0}`;

                return (
                  <tr key={m._id || m.matchId} className="hover:bg-[#EFEAE1]/50 dark:hover:bg-[#1D1D1B] transition-colors group">
                    <td className="py-4 px-4 font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">
                      <Link href={`/chess/matches/${m._id || m.matchId}`} className="hover:underline">
                        {m.matchId}
                      </Link>
                    </td>
                    <td className="py-4 px-3 text-center font-mono text-[#77736B] dark:text-[#8E8E93]">
                      R{m.round}
                    </td>
                    <td className="py-4 px-4 font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                      {p1}
                    </td>
                    <td className="py-4 px-4 font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                      {p2}
                    </td>
                    <td className="py-4 px-3 text-center">
                      {isCompleted ? (
                        <span className="bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#171715] dark:text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#262624] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold">
                          Completed
                        </span>
                      ) : isLive ? (
                        <span className="bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900/60 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          <span>Live</span>
                        </span>
                      ) : (
                        <span className="bg-transparent text-[#77736B] dark:text-[#8E8E93] border border-[#D5CFC5] dark:border-[#262624] px-2.5 py-0.5 rounded-full text-[10px] font-mono">
                          Scheduled
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-3 text-center font-medium text-[#171715] dark:text-[#FAF8F3]">
                      {winnerText}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                      {scoreStr}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards Layout */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 text-center text-xs text-[#77736B]">
            Loading match records...
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-6 text-center text-xs text-[#77736B]">
            No match records available yet.
          </div>
        ) : (
          matches.slice(0, 5).map((m) => {
            const p1 = m.player1?.fullName || (m.isBye ? (m.byePlayer?.fullName || 'Player') : 'TBD');
            const p2 = m.player2?.fullName || (m.isBye ? 'BYE' : 'TBD');
            return (
              <Link
                key={m._id || m.matchId}
                href={`/chess/matches/${m._id || m.matchId}`}
                className="block bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-4 space-y-2.5 shadow-xs"
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-[#77736B]">
                  <span>{m.matchId} • Round {m.round}</span>
                  <span className="uppercase">{m.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="font-serif font-bold text-[#171715] dark:text-[#FAF8F3] text-sm">
                    {p1} <span className="text-xs text-[#77736B] font-sans font-normal">vs</span> {p2}
                  </div>
                  <div className="font-mono font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                    {m.player1MaterialScore || 0} - {m.player2MaterialScore || 0}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

    </section>
  );
}
