'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';

export function TopPlayersCard({ standings = [] }) {
  const top3 = standings.slice(0, 3).map((p, idx) => ({
    id: p._id,
    rank: idx + 1,
    name: p.fullName,
    dept: p.department,
    pts: `${p.tournamentPoints || 0} pts`,
    captured: p.materialPoints || 0
  }));

  return (
    <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 transition-all select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] font-semibold block">
            CHAMPIONSHIP PODIUM
          </span>
          <h3 className="text-sm font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-wide uppercase mt-0.5">
            LEADING THE BOARD
          </h3>
        </div>
        <Trophy className="w-4 h-4 text-[#77736B] dark:text-[#8E8E93]" />
      </div>

      {/* Players list */}
      {top3.length === 0 ? (
        <div className="text-center py-10 space-y-2">
          <div className="text-2xl opacity-40">♛</div>
          <p className="text-xs text-[#77736B] dark:text-[#8E8E93]">
            No competitors on the leaderboard yet. Standings update after Round 1 results.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {top3.map((p) => {
            const isFirst = p.rank === 1;
            return (
              <div
                key={p.id || p.name}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-[#22221F] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] border-transparent shadow-md'
                    : 'bg-[#FAF8F3] dark:bg-[#1D1D1B] border-[#D5CFC5] dark:border-[#262624] text-[#171715] dark:text-[#FAF8F3] hover:bg-[#EFEAE1]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono font-bold text-xs w-5 text-center ${isFirst ? 'text-amber-400 dark:text-amber-600' : 'text-[#77736B]'}`}>
                    0{p.rank}
                  </span>
                  
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-xs font-bold shrink-0 ${
                      isFirst
                        ? 'bg-[#FAF8F3] text-[#171715] dark:bg-[#0D0D0D] dark:text-[#FAF8F3]'
                        : 'bg-[#EFEAE1] dark:bg-[#262624] text-[#171715] dark:text-[#FAF8F3]'
                    }`}
                  >
                    {isFirst ? '👑' : p.name.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <Link
                      href={`/chess/player/${p.id}`}
                      className="font-bold font-serif text-xs hover:underline block leading-snug truncate max-w-[130px]"
                    >
                      {p.name}
                    </Link>
                    <span className={`text-[10px] block ${isFirst ? 'text-[#A8A49C] dark:text-[#4E4C47]' : 'text-[#77736B] dark:text-[#8E8E93]'}`}>
                      {p.dept}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-xs">
                    {p.pts}
                  </div>
                  <div className={`text-[9px] font-mono ${isFirst ? 'text-[#A8A49C] dark:text-[#4E4C47]' : 'text-[#77736B]'}`}>
                    {p.captured} material
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Button */}
      <div className="pt-1">
        <Link
          href="/chess/standings"
          className="w-full inline-flex items-center justify-center gap-2 border border-[#D5CFC5] dark:border-[#262624] hover:bg-[#22221F] hover:text-white dark:hover:bg-[#FAF8F3] dark:hover:text-[#0D0D0D] bg-transparent text-[#171715] dark:text-[#FAF8F3] font-medium py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors"
        >
          <span>View Official Standings</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
