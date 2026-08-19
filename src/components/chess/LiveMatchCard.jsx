'use client';

import React from 'react';
import Link from 'next/link';
import { MatchTimer } from './MatchTimer';
import { Swords } from 'lucide-react';

export function LiveMatchCard({ match }) {
  const p1 = match?.player1 || { fullName: 'Player 1', department: 'Dept' };
  const p2 = match?.player2 || { fullName: 'Player 2', department: 'Dept' };

  return (
    <div className="bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#C9A227] hover:-translate-y-1 transition-all group">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#27272A] pb-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#111111] dark:text-[#F4F4F5]">{match.matchId}</span>
          <span className="text-[#666666] dark:text-[#A1A1AA]">| Round {match.round}</span>
        </div>
        <span className="badge-live px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1">
          <span className="live-dot" />
          <span>LIVE</span>
        </span>
      </div>

      {/* Players vs Layout */}
      <div className="grid grid-cols-5 items-center gap-2 py-1 text-center">
        
        {/* Player 1 */}
        <div className="col-span-2 flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-white font-bold font-display text-sm group-hover:scale-105 transition-transform">
            {p1.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F5] font-display truncate max-w-[100px]">
            {p1.fullName}
          </h4>
          <span className="text-[9px] text-[#666666] dark:text-[#A1A1AA]">{p1.department}</span>
          <span className="text-lg font-bold font-mono text-[#111111] dark:text-[#F4F4F5] pt-1">
            {match.player1MaterialScore || 0}
          </span>
        </div>

        {/* VS / Timer */}
        <div className="col-span-1 flex flex-col items-center justify-center space-y-1">
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#F4F4F5] font-bold text-xs font-mono flex items-center justify-center">
            VS
          </div>
          <MatchTimer match={match} durationMinutes={match.durationMinutes || 10} />
        </div>

        {/* Player 2 */}
        <div className="col-span-2 flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-gray-800 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-white font-bold font-display text-sm group-hover:scale-105 transition-transform">
            {p2.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F5] font-display truncate max-w-[100px]">
            {p2.fullName}
          </h4>
          <span className="text-[9px] text-[#666666] dark:text-[#A1A1AA]">{p2.department}</span>
          <span className="text-lg font-bold font-mono text-[#111111] dark:text-[#F4F4F5] pt-1">
            {match.player2MaterialScore || 0}
          </span>
        </div>

      </div>

      {/* Button */}
      <div className="pt-1">
        <Link
          href={`/chess/matches/${match._id || match.matchId}`}
          className="w-full flex items-center justify-center gap-1.5 border border-[#E5E5E5] dark:border-[#27272A] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-[#111111] dark:text-[#F4F4F5] font-bold py-2 rounded-xl text-xs uppercase font-display tracking-wider transition-all"
        >
          <Swords className="w-3.5 h-3.5" />
          <span>Watch Match</span>
        </Link>
      </div>

    </div>
  );
}
