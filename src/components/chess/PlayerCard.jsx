'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function PlayerCard({ player }) {
  if (!player) return null;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-xs space-y-4 hover:border-[#C9A227] transition-all group flex flex-col justify-between">
      
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-900 border border-[#E5E5E5] flex items-center justify-center text-white font-bold font-display text-base group-hover:scale-105 transition-transform">
            {player.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#C9A227] block">{player.playerId}</span>
            <h3 className="text-sm font-bold font-display text-[#111111] group-hover:text-[#C9A227] transition-colors leading-tight">
              {player.fullName}
            </h3>
            <p className="text-xs text-[#666666]">{player.department}</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-[#E5E5E5] px-2.5 py-1 rounded-lg text-center">
          <span className="text-[9px] font-mono text-[#666666] uppercase block">Rank</span>
          <span className="text-xs font-bold font-mono text-[#111111]">
            #{player.rank || '-'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl border border-[#E5E5E5] text-center font-mono text-xs">
        <div>
          <span className="text-[#666666] text-[9px] uppercase block">Matches</span>
          <span className="font-bold text-[#111111]">{player.matchesPlayed || 0}</span>
        </div>
        <div>
          <span className="text-[#666666] text-[9px] uppercase block">W / L</span>
          <span className="font-bold text-emerald-600">
            {player.wins || 0} <span className="text-[#666666]">/</span> <span className="text-red-600">{player.losses || 0}</span>
          </span>
        </div>
        <div>
          <span className="text-[#666666] text-[9px] uppercase block">Points</span>
          <span className="font-bold text-[#C9A227]">{player.tournamentPoints || 0}</span>
        </div>
      </div>

      {/* Profile Action Link */}
      <Link
        href={`/chess/player/${player._id}`}
        className="inline-flex items-center justify-between w-full bg-[#000000] hover:bg-[#222222] text-white font-bold text-xs uppercase tracking-wider py-2 px-3.5 rounded-xl transition-all font-display shadow-xs"
      >
        <span>View Profile</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
