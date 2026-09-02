'use client';

import React from 'react';
import Link from 'next/link';

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
    <div className="bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
      
      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#27272A] pb-3">
        <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase">
          TOURNAMENT STATUS
        </h3>
        <span className="badge-completed px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase">
          Live
        </span>
      </div>

      {/* Rows */}
      <div className="space-y-3 text-xs font-sans">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between items-center text-[#666666] dark:text-[#A1A1AA]">
            <span>{r.label}</span>
            <span className="font-bold text-[#111111] dark:text-[#F4F4F5] font-mono text-sm">{r.val}</span>
          </div>
        ))}
      </div>

      {/* Button */}
      <div className="pt-2">
        <Link
          href="/chess/matches"
          className="w-full flex items-center justify-center bg-black dark:bg-[#F4F4F5] hover:bg-gray-800 dark:hover:bg-white text-white dark:text-black font-bold py-2.5 rounded-xl text-xs uppercase font-display tracking-wider transition-colors shadow-xs"
        >
          View Full Schedule
        </Link>
      </div>

    </div>
  );
}
