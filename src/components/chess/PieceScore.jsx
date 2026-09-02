'use client';

import React from 'react';

export function PieceScore({ captured = {}, materialScore = 0, playerName = 'Player' }) {
  const piecesConfig = [
    { key: 'pawns', symbol: '♟', name: 'Pawn', val: 1 },
    { key: 'knights', symbol: '♞', name: 'Knight', val: 3 },
    { key: 'bishops', symbol: '♝', name: 'Bishop', val: 3 },
    { key: 'rooks', symbol: '♜', name: 'Rook', val: 5 },
    { key: 'queens', symbol: '♛', name: 'Queen', val: 9 },
  ];

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-2">
        <span className="text-xs uppercase font-mono text-[#111111] font-bold tracking-wider">
          {playerName} Captured Pieces
        </span>
        <div className="bg-gray-50 border border-[#E5E5E5] px-3 py-1 rounded-lg text-xs font-mono font-bold text-[#111111]">
          Score: <span className="text-[#C9A227]">{materialScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {piecesConfig.map(({ key, symbol, name, val }) => {
          const count = captured[key] || 0;
          const totalPts = count * val;
          return (
            <div
              key={key}
              className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-colors ${
                count > 0
                  ? 'bg-gray-50 border-[#E5E5E5] text-[#111111]'
                  : 'bg-white border-gray-100 text-gray-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base leading-none text-[#111111]">{symbol}</span>
                <span className="font-medium">{name}</span>
                <span className="font-mono text-[#666666]">× {count}</span>
              </div>
              <span className="font-mono font-bold text-[#111111]">
                {totalPts > 0 ? `= ${totalPts} pts` : '0'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
