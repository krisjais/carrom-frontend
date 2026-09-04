'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Trophy, Award, Shield } from 'lucide-react';

export function PlayerCard({ player }) {
  if (!player) return null;

  const initials = player.fullName
    ? player.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '??';

  const isTopRank = player.rank && Number(player.rank) <= 3;

  return (
    <div className="group relative bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:border-[#171715] dark:hover:border-[#FAF8F3] hover:shadow-lg flex flex-col justify-between">
      
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-sm tracking-wider transition-transform duration-300 group-hover:scale-105 ${
              isTopRank
                ? 'bg-[#171715] dark:bg-[#FAF8F3] text-[#FAF8F3] dark:text-[#0D0D0D] shadow-sm'
                : 'bg-[#EFEAE1] dark:bg-[#1E1E1C] text-[#171715] dark:text-[#FAF8F3] border border-[#D5CFC5] dark:border-[#2E2E2B]'
            }`}>
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-medium tracking-widest text-[#77736B] dark:text-[#8E8E93]">
                  {player.playerId || 'CHESS-ID'}
                </span>
                {isTopRank && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-mono uppercase bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] px-1.5 py-0.2 rounded font-bold">
                    ★ Top {player.rank}
                  </span>
                )}
              </div>
              <h3 className="text-base font-serif font-bold text-[#171715] dark:text-[#FAF8F3] leading-snug group-hover:underline mt-0.5">
                {player.fullName}
              </h3>
              <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] font-sans mt-0.5">
                {player.department || 'Open Division'}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
              Rank
            </span>
            <span className="text-base font-serif font-bold text-[#171715] dark:text-[#FAF8F3]">
              #{player.rank || '—'}
            </span>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 bg-[#EFEAE1]/60 dark:bg-[#1B1B19] p-3 rounded-xl border border-[#D5CFC5]/70 dark:border-[#282826] text-center font-mono my-4">
          <div>
            <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block tracking-wider">Matches</span>
            <span className="font-bold text-[#171715] dark:text-[#FAF8F3] font-serif text-sm">
              {player.matchesPlayed ?? 0}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block tracking-wider">W / L</span>
            <span className="font-medium text-[#171715] dark:text-[#FAF8F3] text-xs">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">{player.wins ?? 0}</span>
              <span className="text-[#77736B] dark:text-[#8E8E93] mx-1">/</span>
              <span className="text-rose-700 dark:text-rose-400 font-bold">{player.losses ?? 0}</span>
            </span>
          </div>
          <div>
            <span className="text-[9px] text-[#77736B] dark:text-[#8E8E93] uppercase block tracking-wider">Points</span>
            <span className="font-bold text-[#171715] dark:text-[#FAF8F3] font-serif text-sm">
              {player.tournamentPoints ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <Link
        href={`/chess/player/${player._id}`}
        className="inline-flex items-center justify-between w-full bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] text-xs font-semibold uppercase tracking-wider py-2.5 px-4 rounded-xl transition-all group/btn"
      >
        <span>View Dossier</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
      </Link>
    </div>
  );
}
