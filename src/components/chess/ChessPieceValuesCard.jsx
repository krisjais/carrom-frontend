'use client';

import React from 'react';

export function ChessPieceValuesCard() {
  const pieces = [
    { symbol: '♟', name: 'Pawn', points: '1 Pt', isSpecial: false },
    { symbol: '♞', name: 'Knight', points: '3 Pts', isSpecial: false },
    { symbol: '♝', name: 'Bishop', points: '3 Pts', isSpecial: false },
    { symbol: '♜', name: 'Rook', points: '5 Pts', isSpecial: false },
    { symbol: '♛', name: 'Queen', points: '9 Pts', isSpecial: true },
    { symbol: '♚', name: 'King', points: '0 Pts', isSpecial: true },
  ];

  return (
    <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 transition-all select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] font-semibold block">
            MATERIAL SCORING WEIGHTS
          </span>
          <h3 className="text-sm font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-wide uppercase mt-0.5">
            KNOW THE VALUE OF EVERY MOVE
          </h3>
        </div>
        <span className="text-sm">♛</span>
      </div>

      <p className="text-xs text-[#77736B] dark:text-[#8E8E93] leading-relaxed">
        Material points are accumulated from opponent pieces captured during the 10-minute game clock and serve as crucial tiebreakers.
      </p>

      {/* Pieces Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        {pieces.map((p) => (
          <div
            key={p.name}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl border transition-all ${
              p.isSpecial
                ? 'bg-[#EFEAE1] dark:bg-[#1D1D1B] border-[#BDB6AA] dark:border-[#383733]'
                : 'bg-[#FAF8F3] dark:bg-[#181816] border-[#D5CFC5]/60 dark:border-[#262624]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-base leading-none ${p.name === 'Queen' ? 'text-amber-500' : p.name === 'King' ? 'text-amber-600' : 'text-[#171715] dark:text-[#FAF8F3]'}`}>
                {p.symbol}
              </span>
              <span className={`font-serif ${p.isSpecial ? 'font-bold' : 'font-medium'} text-[#171715] dark:text-[#FAF8F3]`}>
                {p.name}
              </span>
            </div>
            <span className="font-mono font-bold text-xs text-[#171715] dark:text-[#FAF8F3]">
              {p.points}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
}
