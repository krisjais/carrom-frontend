'use client';

import React from 'react';
import { Crown, Clock, Swords, ShieldCheck } from 'lucide-react';

export function ChessPieceValuesCard() {
  const rules = [
    {
      icon: Clock,
      title: '10:00 Rapid Clock',
      desc: 'Speed chess time control for intense head-to-head play.'
    },
    {
      icon: Crown,
      title: 'Direct Winner Declaration',
      desc: 'No piece point counting. Winner declared directly by name.'
    },
    {
      icon: Swords,
      title: 'Knockout Elimination',
      desc: 'Victorious competitor advances directly to the next stage.'
    },
    {
      icon: ShieldCheck,
      title: 'BYE Nominations',
      desc: 'Odd-bracket players automatically advance to the next round.'
    }
  ];

  return (
    <div className="bg-[#FAF8F3] dark:bg-[#151514] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 transition-all select-none">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#D5CFC5]/60 dark:border-[#262624] pb-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] font-semibold block">
            TOURNAMENT FORMAT
          </span>
          <h3 className="text-sm font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-wide uppercase mt-0.5">
            Knockout Championship Rules
          </h3>
        </div>
        <Crown className="w-5 h-5 text-amber-500" />
      </div>

      <p className="text-xs text-[#77736B] dark:text-[#8E8E93] leading-relaxed">
        Matches are decided directly over the board by checkmate, resignation, or clock expiration. The referee declares the winner directly by competitor name.
      </p>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
        {rules.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.title}
              className="p-3.5 rounded-2xl border border-[#D5CFC5]/70 dark:border-[#262624] bg-[#EFEAE1]/50 dark:bg-[#1A1A18] space-y-1"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h4 className="font-serif font-bold text-xs text-[#171715] dark:text-[#FAF8F3]">
                  {r.title}
                </h4>
              </div>
              <p className="text-[11px] text-[#77736B] dark:text-[#8E8E93] leading-snug">
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
