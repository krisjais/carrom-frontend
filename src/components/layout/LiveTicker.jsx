'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ChevronRight } from 'lucide-react';

export const LiveTicker = () => {
  const [currentMatch, setCurrentMatch] = useState(null);

  const fetchLive = async () => {
    try {
      const res = await api.getLiveMatches();
      if (res.success) {
        setCurrentMatch(res.currentMatch || null);
      }
    } catch (err) {
      // quiet fallback
    }
  };

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!currentMatch) {
    return null;
  }

  const activeBoard = currentMatch.boards?.find((b) => b.boardWinner === null) || currentMatch.boards?.[0];

  return (
    <div className="w-full bg-[#070809] border-b border-[#D4A94C]/25 py-2 overflow-hidden shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[10px] font-bold shrink-0 font-mono tracking-wider">
            <span className="live-dot" />
            <span>BOARD 1 LIVE</span>
          </div>

          <Link
            href="/live"
            className="flex items-center gap-2.5 px-2.5 py-0.5 rounded-md hover:bg-[#14171A] text-[#F5F1E8]/80 hover:text-white shrink-0 transition-colors"
          >
            <span className="text-[#F2C94C] font-mono font-bold text-[11px] uppercase">
              {currentMatch.roundName}
            </span>
            <span className="text-white font-bold text-xs font-display tracking-wide">
              {currentMatch.team1?.name}{' '}
              <span className="text-[#F2C94C] font-mono font-black px-1">
                {currentMatch.finalScore?.team1BoardsWon || 0}–{currentMatch.finalScore?.team2BoardsWon || 0}
              </span>{' '}
              {currentMatch.team2?.name}
            </span>
            {activeBoard && (
              <span className="text-[#F5F1E8]/50 text-[10px] font-mono hidden sm:inline">
                (B#{activeBoard.boardNumber}: {activeBoard.team1Score}–{activeBoard.team2Score})
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 text-[#F2C94C]" />
          </Link>
        </div>

        <Link
          href="/live"
          className="text-[11px] font-mono font-bold text-[#F2C94C] hover:underline shrink-0 tracking-wider uppercase"
        >
          Watch Scoreboard →
        </Link>
      </div>
    </div>
  );
};
