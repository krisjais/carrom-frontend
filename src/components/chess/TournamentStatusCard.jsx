'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function TournamentStatusCard({ stats }) {
  const totalRounds = stats?.totalRounds || stats?.currentRound || 1;
  const totalMatches = stats?.totalMatches ?? 0;
  const registeredPlayers = stats?.totalRegistrations ?? stats?.registeredCount ?? 0;
  const completedMatches = stats?.completedMatches ?? 0;

  const rows = [
    { label: 'Total Rounds', val: totalRounds },
    { label: 'Total Matches', val: totalMatches },
    { label: 'Registered Players', val: registeredPlayers },
    { label: 'Completed Matches', val: completedMatches },
  ];

  return (
    <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 shadow-xs space-y-5 transition-all">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3">
        <h3 className="text-xs font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-wider uppercase">
          TOURNAMENT STATUS
        </h3>
        <span className="bg-[#EFEAE1] dark:bg-[#222220] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#171715] dark:text-[#FAF8F3] px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-emerald-400" />
          <span>LIVE</span>
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-3.5 text-xs font-sans">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between items-center text-[#4E4C47] dark:text-[#9E9B93]">
            <span className="text-[#77736B] dark:text-[#8E8E93]">{r.label}</span>
            <span className="font-bold text-[#171715] dark:text-[#FAF8F3] font-serif text-sm">{r.val}</span>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="pt-1">
        <Link
          href="/chess/matches"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#22221F] dark:bg-[#FAF8F3] hover:bg-[#000000] dark:hover:bg-[#FFFFFF] text-[#FAF8F3] dark:text-[#0D0D0D] font-medium py-3 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs"
        >
          <span>View Full Schedule</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
