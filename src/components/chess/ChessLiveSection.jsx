'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Swords } from 'lucide-react';
import { MatchTimer } from './MatchTimer';

export function ChessLiveSection({ liveMatches = [] }) {
  const hasLive = liveMatches && liveMatches.length > 0;

  return (
    <section className="py-12 sm:py-16 border-t border-[#D5CFC5]/80 dark:border-[#262624] select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* LEFT COLUMN: Section Title, Subtitle, and View Fixtures Link */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] text-[#171715] dark:text-[#FAF8F3] text-[10px] font-mono font-semibold uppercase tracking-widest">
            <span className={`w-2 h-2 rounded-full ${hasLive ? 'bg-rose-500 animate-ping' : 'bg-[#77736B]'}`} />
            <span>LIVE ARENA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
            Matches in Progress
          </h2>

          <p className="text-xs sm:text-sm text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed font-sans">
            Real-time material point tracking, blitz clocks, and board maneuvers. Follow each pairing as collegiate challengers vie for tournament dominance.
          </p>

          <div className="pt-2">
            <Link
              href="/chess/matches"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#171715] dark:text-[#FAF8F3] hover:underline underline-offset-4 font-mono"
            >
              <span>View Match Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Match Display OR Editorial Empty State */}
        <div className="lg:col-span-7">
          {hasLive ? (
            <div className="space-y-4">
              {liveMatches.slice(0, 2).map((match) => {
                const p1 = match?.player1 || { fullName: 'Player 1', department: 'Dept' };
                const p2 = match?.player2 || { fullName: 'Player 2', department: 'Dept' };

                return (
                  <div
                    key={match._id || match.matchId}
                    className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 shadow-sm transition-all hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-4 mb-6">
                      <div className="flex items-center gap-2 font-mono text-xs text-[#77736B] dark:text-[#8E8E93]">
                        <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{match.matchId}</span>
                        <span>•</span>
                        <span>Round {match.round}</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-400 text-[10px] font-mono font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span>LIVE NOW</span>
                      </div>
                    </div>

                    {/* Arena Body */}
                    <div className="grid grid-cols-5 items-center gap-4 text-center">
                      
                      {/* Player 1 */}
                      <div className="col-span-2 space-y-1">
                        <div className="w-12 h-12 rounded-full bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] font-serif font-bold text-sm flex items-center justify-center mx-auto shadow-xs">
                          {p1.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h4 className="text-sm font-bold font-serif text-[#171715] dark:text-[#FAF8F3] truncate max-w-[140px] mx-auto">
                          {p1.fullName}
                        </h4>
                        <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] block">{p1.department}</span>
                        <div className="text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] pt-1">
                          {match.player1MaterialScore || 0}
                        </div>
                      </div>

                      {/* VS & Timer */}
                      <div className="col-span-1 flex flex-col items-center justify-center space-y-2">
                        <span className="text-xs font-mono font-bold text-[#77736B] dark:text-[#8E8E93]">VS</span>
                        <MatchTimer match={match} durationMinutes={match.durationMinutes || 10} />
                      </div>

                      {/* Player 2 */}
                      <div className="col-span-2 space-y-1">
                        <div className="w-12 h-12 rounded-full bg-[#4E4C47] dark:bg-[#262624] text-[#FAF8F3] font-serif font-bold text-sm flex items-center justify-center mx-auto shadow-xs">
                          {p2.fullName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <h4 className="text-sm font-bold font-serif text-[#171715] dark:text-[#FAF8F3] truncate max-w-[140px] mx-auto">
                          {p2.fullName}
                        </h4>
                        <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] block">{p2.department}</span>
                        <div className="text-2xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] pt-1">
                          {match.player2MaterialScore || 0}
                        </div>
                      </div>

                    </div>

                    {/* Action */}
                    <div className="pt-6 border-t border-[#D5CFC5]/60 dark:border-[#262624] mt-6">
                      <Link
                        href={`/chess/matches/${match._id || match.matchId}`}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-[#D5CFC5] dark:border-[#262624] bg-[#EFEAE1]/70 dark:bg-[#1D1D1B] hover:bg-[#22221F] hover:text-white dark:hover:bg-[#FAF8F3] dark:hover:text-[#0D0D0D] text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                      >
                        <span>Watch Live Board</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* Editorial Empty State */
            <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] text-[#77736B] dark:text-[#A8A49C] flex items-center justify-center mx-auto text-xl">
                ♟
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] font-semibold block">
                  ALL BOARDS CLEAR
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3]">
                  No Live Matches
                </h3>
                <p className="text-xs text-[#4E4C47] dark:text-[#8E8E93] leading-relaxed pt-1">
                  The board is quiet for now. Check back when the next round pairings commence or review the schedule.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/chess/matches"
                  className="inline-flex items-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] text-xs font-semibold px-6 py-2.5 rounded-full uppercase tracking-wider transition-all duration-200 shadow-xs hover:-translate-y-0.5"
                >
                  <span>View Match Schedule</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
