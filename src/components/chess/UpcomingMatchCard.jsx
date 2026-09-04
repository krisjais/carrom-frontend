'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';

export function UpcomingMatchCard({ match }) {
  if (!match) {
    return (
      <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 shadow-xs space-y-4 text-center transition-all">
        <h3 className="text-xs font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-wider uppercase border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3">
          UPCOMING MATCH
        </h3>
        <div className="py-6 space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center mx-auto text-base text-[#171715] dark:text-[#FAF8F3]">
            ♟
          </div>
          <p className="text-xs font-medium text-[#171715] dark:text-[#FAF8F3]">
            No upcoming match scheduled right now.
          </p>
          <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] max-w-xs mx-auto">
            Pairings will appear here once the next tournament round begins.
          </p>
        </div>
        <Link
          href="/chess/matches"
          className="w-full inline-flex items-center justify-center gap-2 border border-[#D5CFC5] dark:border-[#262624] hover:border-[#171715] dark:hover:border-[#FAF8F3] bg-[#FAF8F3] dark:bg-[#1D1D1B] hover:bg-[#EFEAE1] dark:hover:bg-[#262624] text-[#171715] dark:text-[#FAF8F3] font-medium py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs"
        >
          <span>View Full Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  const p1 = match.player1 ? { name: match.player1.fullName, dept: match.player1.department } : { name: 'Player 1', dept: 'TBD' };
  const p2 = match.player2 ? { name: match.player2.fullName, dept: match.player2.department } : { name: 'Player 2', dept: 'TBD' };
  const roundStr = `Round ${match.round || 1} • Match ${match.matchId || '1'}`;

  return (
    <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 shadow-xs space-y-5 text-center transition-all">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3">
        <h3 className="text-xs font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-wider uppercase">
          UPCOMING MATCH
        </h3>
        <span className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] uppercase font-semibold">
          NEXT FIXTURE
        </span>
      </div>

      <div className="text-[10px] font-mono text-[#77736B] dark:text-[#8E8E93] uppercase tracking-wider">
        {roundStr}
      </div>

      {/* Avatars & Names with Large VS */}
      <div className="grid grid-cols-5 items-center gap-2 py-2">
        <div className="col-span-2 flex flex-col items-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#22221F] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] border border-[#D5CFC5] dark:border-[#383733] flex items-center justify-center font-serif font-bold text-sm">
            {p1.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] font-serif truncate max-w-[95px]">
            {p1.name}
          </h4>
          <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93]">{p1.dept}</span>
        </div>

        {/* Large Minimal VS Treatment */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <span className="text-xl font-serif italic text-[#77736B] dark:text-[#8E8E93] font-normal select-none">
            VS
          </span>
        </div>

        <div className="col-span-2 flex flex-col items-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4E4C47] dark:bg-[#2A2A28] text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#383733] flex items-center justify-center font-serif font-bold text-sm">
            {p2.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <h4 className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] font-serif truncate max-w-[95px]">
            {p2.name}
          </h4>
          <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93]">{p2.dept}</span>
        </div>
      </div>

      <div className="inline-flex items-center justify-center gap-2 text-xs font-mono text-[#77736B] dark:text-[#8E8E93] bg-[#EFEAE1] dark:bg-[#1D1D1B] px-3 py-1 rounded-full border border-[#D5CFC5] dark:border-[#262624]">
        <Clock className="w-3.5 h-3.5 text-[#171715] dark:text-[#FAF8F3]" />
        <span>10 Min Speed Clock</span>
      </div>

      {/* Button */}
      <div className="pt-1">
        <Link
          href={`/chess/matches/${match._id || match.matchId}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-[#000000] dark:hover:bg-[#FFFFFF] text-[#FAF8F3] dark:text-[#0D0D0D] font-medium py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs"
        >
          <span>View Match Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
