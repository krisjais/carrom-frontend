'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { getCategoryName } from '@/lib/constants';
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
    <div className="w-full bg-[#0A101D] border-b border-[#1C2B48] py-1.5 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold shrink-0 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>MAIN BOARD LIVE</span>
          </div>

          <Link
            href="/live"
            className="flex items-center gap-2.5 px-2.5 py-0.5 rounded-md hover:bg-[#0E1626] text-[#94A3B8] hover:text-white shrink-0 transition-colors"
          >
            <span className="text-[#D4AF37] font-mono font-bold text-[11px]">
              {currentMatch.roundName}
            </span>
            <span className="text-white font-medium">
              {currentMatch.team1?.name}{' '}
              <span className="text-[#D4AF37] font-mono font-bold">
                {currentMatch.finalScore?.team1BoardsWon || 0}–{currentMatch.finalScore?.team2BoardsWon || 0}
              </span>{' '}
              {currentMatch.team2?.name}
            </span>
            {activeBoard && (
              <span className="text-[#64748B] text-[10px] font-mono hidden sm:inline">
                (Board {activeBoard.boardNumber}: {activeBoard.team1Score}–{activeBoard.team2Score})
              </span>
            )}
            <ChevronRight className="w-3 h-3 text-[#64748B]" />
          </Link>
        </div>

        <Link href="/live" className="text-[11px] font-mono text-[#D4AF37] hover:underline shrink-0">
          Arena Center →
        </Link>
      </div>
    </div>
  );
};
