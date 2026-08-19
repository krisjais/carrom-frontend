'use client';

import React from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';

export function UpcomingMatchCard({ match }) {
  if (!match) {
    return (
      <div className="bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl p-5 shadow-xs space-y-4 text-center transition-colors">
        <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase border-b border-[#E5E5E5] dark:border-[#27272A] pb-3">
          UPCOMING MATCH
        </h3>
        <p className="text-xs text-[#666666] dark:text-[#A1A1AA] py-4">
          No upcoming match scheduled right now. Check back when the next round pairings are generated.
        </p>
        <Link
          href="/chess/matches"
          className="w-full flex items-center justify-center bg-black dark:bg-[#F4F4F5] hover:bg-gray-800 dark:hover:bg-white text-white dark:text-black font-bold py-2.5 rounded-xl text-xs uppercase font-display tracking-wider transition-colors shadow-xs"
        >
          View Full Schedule
        </Link>
      </div>
    );
  }

  const p1 = match.player1 ? { name: match.player1.fullName, dept: match.player1.department } : { name: 'Player 1', dept: 'TBD' };
  const p2 = match.player2 ? { name: match.player2.fullName, dept: match.player2.department } : { name: 'Player 2', dept: 'TBD' };
  const roundStr = `Round ${match.round || 1} - Match ${match.matchId || '1'}`;

  return (
    <div className="bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl p-5 shadow-xs space-y-4 text-center transition-colors">
      
      {/* Title */}
      <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase border-b border-[#E5E5E5] dark:border-[#27272A] pb-3">
        UPCOMING MATCH
      </h3>

      <div className="text-[10px] font-mono text-[#666666] dark:text-[#A1A1AA]">
        {roundStr}
      </div>

      {/* Avatars & Names */}
      <div className="grid grid-cols-5 items-center gap-2 py-1">
        <div className="col-span-2 flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-gray-900 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-white font-bold font-display text-sm">
            {p1.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F5] font-display truncate max-w-[90px]">{p1.name}</h4>
          <span className="text-[9px] text-[#666666] dark:text-[#A1A1AA]">{p1.dept}</span>
        </div>

        <div className="col-span-1 flex justify-center">
          <span className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] text-[#111111] dark:text-[#F4F4F5] font-bold text-xs font-mono flex items-center justify-center">
            VS
          </span>
        </div>

        <div className="col-span-2 flex flex-col items-center space-y-1">
          <div className="w-12 h-12 rounded-full bg-gray-800 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-white font-bold font-display text-sm">
            {p2.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#111111] dark:text-[#F4F4F5] font-display truncate max-w-[90px]">{p2.name}</h4>
          <span className="text-[9px] text-[#666666] dark:text-[#A1A1AA]">{p2.dept}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-medium text-[#666666] dark:text-[#A1A1AA]">
        <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
        <span>Scheduled Match</span>
      </div>

      {/* Button */}
      <div className="pt-1">
        <Link
          href={`/chess/matches/${match._id || match.matchId}`}
          className="w-full flex items-center justify-center bg-black dark:bg-[#F4F4F5] hover:bg-gray-800 dark:hover:bg-white text-white dark:text-black font-bold py-2.5 rounded-xl text-xs uppercase font-display tracking-wider transition-colors shadow-xs"
        >
          View Match
        </Link>
      </div>

    </div>
  );
}
