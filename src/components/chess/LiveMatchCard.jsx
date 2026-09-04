'use client';

import React from 'react';
import Link from 'next/link';
import { MatchTimer } from './MatchTimer';
import { ArrowRight } from 'lucide-react';

export function LiveMatchCard({ match }) {
  const p1 = match?.player1 || { fullName: 'Player 1', department: 'Dept' };
  const p2 = match?.player2 || { fullName: 'Player 2', department: 'Dept' };

  return (
    <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#171715] dark:hover:border-[#FAF8F3] hover:-translate-y-0.5 transition-all group">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#171715] dark:text-[#FAF8F3]">{match.matchId}</span>
          <span className="text-[#77736B] dark:text-[#8E8E93]">| Round {match.round}</span>
        </div>
        <span className="bg-[#EFEAE1] dark:bg-[#222220] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-emerald-400 animate-pulse" />
          <span>LIVE</span>
        </span>
      </div>

      {/* Players vs Layout */}
      <div className="grid grid-cols-5 items-center gap-2 py-1 text-center">
        
        {/* Player 1 */}
        <div className="col-span-2 flex flex-col items-center space-y-1">
          <div className="w-11 h-11 rounded-full bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] border border-[#D5CFC5] dark:border-[#383733] flex items-center justify-center font-bold text-xs font-serif group-hover:scale-105 transition-transform">
            {p1.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] truncate max-w-[100px]">
            {p1.fullName}
          </h4>
          <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93]">{p1.department}</span>
          <span className="text-xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] pt-0.5">
            {match.player1MaterialScore || 0}
          </span>
        </div>

        {/* VS / Timer */}
        <div className="col-span-1 flex flex-col items-center justify-center space-y-1.5">
          <div className="w-7 h-7 rounded-full bg-[#EFEAE1] dark:bg-[#222220] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] font-bold text-[10px] font-mono flex items-center justify-center">
            VS
          </div>
          <MatchTimer match={match} durationMinutes={match.durationMinutes || 10} />
        </div>

        {/* Player 2 */}
        <div className="col-span-2 flex flex-col items-center space-y-1">
          <div className="w-11 h-11 rounded-full bg-[#4E4C47] dark:bg-[#2E2E2B] text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#383733] flex items-center justify-center font-bold text-xs font-serif group-hover:scale-105 transition-transform">
            {p2.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] truncate max-w-[100px]">
            {p2.fullName}
          </h4>
          <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93]">{p2.department}</span>
          <span className="text-xl font-bold font-serif text-[#171715] dark:text-[#FAF8F3] pt-0.5">
            {match.player2MaterialScore || 0}
          </span>
        </div>

      </div>

      {/* Button */}
      <div className="pt-1">
        <Link
          href={`/chess/matches/${match._id || match.matchId}`}
          className="w-full flex items-center justify-center gap-1.5 border border-[#D5CFC5] dark:border-[#262624] hover:border-[#171715] dark:hover:border-[#FAF8F3] bg-[#FAF8F3] dark:bg-[#1D1D1B] hover:bg-[#22221F] dark:hover:bg-[#FAF8F3] hover:text-[#FAF8F3] dark:hover:text-[#0D0D0D] text-[#171715] dark:text-[#FAF8F3] font-medium py-2 rounded-xl text-xs uppercase tracking-wider transition-all duration-200"
        >
          <span>Watch Match</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
