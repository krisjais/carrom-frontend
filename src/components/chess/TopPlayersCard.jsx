'use client';

import React from 'react';
import Link from 'next/link';
import { Crown } from 'lucide-react';

export function TopPlayersCard({ standings = [] }) {
  const top3 = standings.slice(0, 3).map((p, idx) => ({
    id: p._id,
    rank: idx + 1,
    name: p.fullName,
    dept: p.department,
    pts: `${p.tournamentPoints || 0} pts`
  }));

  return (
    <div className="bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
      
      {/* Title */}
      <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase border-b border-[#E5E5E5] dark:border-[#27272A] pb-3">
        TOP 3 PLAYERS
      </h3>

      {/* Players list */}
      {top3.length === 0 ? (
        <div className="text-center py-6 text-xs text-[#666666] dark:text-[#A1A1AA]">
          No registered players on the leaderboard yet.
        </div>
      ) : (
        <div className="space-y-3">
          {top3.map((p) => (
            <div key={p.id || p.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-[#111111] dark:text-[#F4F4F5] w-4 text-center">
                  {p.rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] flex items-center justify-center text-white font-bold font-display text-xs">
                  {p.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <Link href={`/chess/player/${p.id}`} className="font-bold text-[#111111] dark:text-[#F4F4F5] hover:text-[#C9A227] font-display leading-tight block">
                    {p.name}
                  </Link>
                  <span className="text-[10px] text-[#666666] dark:text-[#A1A1AA]">{p.dept}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 font-mono font-bold text-xs text-[#111111] dark:text-[#F4F4F5]">
                {p.rank === 1 && <Crown className="w-3.5 h-3.5 text-[#C9A227]" />}
                <span>{p.pts}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Button */}
      <div className="pt-2">
        <Link
          href="/chess/standings"
          className="w-full flex items-center justify-center border border-[#E5E5E5] dark:border-[#27272A] hover:bg-gray-50 dark:hover:bg-[#18181C] text-[#111111] dark:text-[#F4F4F5] font-bold py-2 rounded-xl text-xs uppercase font-display tracking-wider transition-colors"
        >
          View Standings
        </Link>
      </div>

    </div>
  );
}
