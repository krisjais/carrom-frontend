'use client';

import React from 'react';

export function ChessPieceValuesCard() {
  const pieces = [
    { symbol: '♟', name: 'Pawn', points: 1 },
    { symbol: '♞', name: 'Knight', points: 3 },
    { symbol: '♝', name: 'Bishop', points: 3 },
    { symbol: '♜', name: 'Rook', points: 5 },
    { symbol: '♛', name: 'Queen', points: 9 },
    { symbol: '♚', name: 'King', points: 0 },
  ];

  return (
    <div className="bg-white dark:bg-[#121215] border border-[#E5E5E5] dark:border-[#27272A] rounded-2xl p-5 shadow-xs space-y-4 transition-colors">
      <h3 className="text-xs font-bold font-display text-[#111111] dark:text-[#F4F4F5] tracking-wider uppercase border-b border-[#E5E5E5] dark:border-[#27272A] pb-3">
        CHESS PIECE VALUES
      </h3>

      <div className="grid grid-cols-2 gap-2 text-xs font-sans">
        {pieces.map((p) => (
          <div
            key={p.name}
            className="flex items-center justify-between bg-gray-50 dark:bg-[#18181C] border border-[#E5E5E5] dark:border-[#27272A] px-3 py-2 rounded-xl hover:border-[#C9A227] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base leading-none text-[#111111] dark:text-[#F4F4F5]">{p.symbol}</span>
              <span className="font-semibold text-[#111111] dark:text-[#F4F4F5]">{p.name}</span>
            </div>
            <span className="font-mono font-bold text-[#C9A227]">{p.points}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
