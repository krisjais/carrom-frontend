'use client';

import React from 'react';

export function PieceScore({ captured = {}, materialScore = 0, playerName = 'Player' }) {
  const piecesConfig = [
    { key: 'pawns', symbol: '♟', name: 'Pawns', val: 1 },
    { key: 'knights', symbol: '♞', name: 'Knights', val: 3 },
    { key: 'bishops', symbol: '♝', name: 'Bishops', val: 3 },
    { key: 'rooks', symbol: '♜', name: 'Rooks', val: 5 },
    { key: 'queens', symbol: '♛', name: 'Queens', val: 9 },
  ];

  return (
    <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#77736B] dark:text-[#8E8E93] block">
            Captured Arsenal
          </span>
          <h3 className="text-base font-serif font-bold text-[#171715] dark:text-[#FAF8F3] mt-0.5">
            {playerName}
          </h3>
        </div>

        <div className="bg-[#EFEAE1] dark:bg-[#1C1C1A] border border-[#D5CFC5] dark:border-[#282826] px-3.5 py-1.5 rounded-xl text-center">
          <span className="text-[9px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
            Material
          </span>
          <span className="font-serif font-bold text-lg text-[#171715] dark:text-[#FAF8F3]">
            +{materialScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {piecesConfig.map(({ key, symbol, name, val }) => {
          const count = captured[key] || 0;
          const totalPts = count * val;
          const hasCaptured = count > 0;

          return (
            <div
              key={key}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                hasCaptured
                  ? 'bg-[#EFEAE1]/70 dark:bg-[#1B1B19] border-[#D5CFC5] dark:border-[#282826] text-[#171715] dark:text-[#FAF8F3]'
                  : 'bg-transparent border-[#D5CFC5]/40 dark:border-[#262624]/60 text-[#77736B] dark:text-[#8E8E93]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl leading-none select-none text-[#171715] dark:text-[#FAF8F3]">{symbol}</span>
                <div>
                  <span className="font-serif font-semibold text-xs text-[#171715] dark:text-[#FAF8F3] block">
                    {name}
                  </span>
                  <span className="font-mono text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                    {val} pt{val > 1 ? 's' : ''} each
                  </span>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-xs font-bold text-[#171715] dark:text-[#FAF8F3] block">
                  × {count}
                </span>
                <span className="text-[10px] text-[#77736B] dark:text-[#8E8E93]">
                  {totalPts > 0 ? `+${totalPts}` : '0'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
