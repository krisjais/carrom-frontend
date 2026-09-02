'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Clock } from 'lucide-react';

export function TournamentRulesCard() {
  const rules = [
    '10-minute match timer for each game',
    'Material points based scoring system',
    'Automatic pairing each round',
    'Fair play and sportsmanship',
  ];

  return (
    <div className="bg-white dark:bg-[#16161A] border border-[#E6E3DC] dark:border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-card relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
      
      {/* Left Content */}
      <div className="space-y-5 max-w-lg z-10">
        <h3 className="text-xs font-bold font-display text-[#111111] dark:text-white tracking-wider uppercase flex items-center gap-1.5 border-b border-[#E6E3DC] dark:border-[#27272A] pb-3">
          <span>TOURNAMENT RULES</span>
          <span className="text-[#C99616]">•</span>
        </h3>

        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule} className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#111111] dark:text-gray-200">
              <CheckCircle2 className="w-4 h-4 text-[#C99616] shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Link
            href="/chess/rules"
            className="inline-flex items-center gap-2 border border-[#111111] dark:border-white/30 bg-white dark:bg-[#202026] hover:bg-[#FAF9F6] dark:hover:bg-white/10 text-[#111111] dark:text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase font-display tracking-wider transition-all shadow-xs"
          >
            <span>VIEW ALL RULES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Right Graphic/Visual Illustration */}
      <div className="relative w-full md:w-56 h-36 flex items-center justify-center bg-[#FAF9F6] dark:bg-[#202026] rounded-xl border border-[#E6E3DC] dark:border-[#27272A] p-4 text-center">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#C99616]/10 text-[#C99616] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold font-display text-[#111111] dark:text-white">
            10 MIN CHESS CLOCK
          </span>
          <span className="text-[10px] text-[#5F5F5F] dark:text-gray-400 font-mono">
            STRICT MATCH TIMER
          </span>
        </div>
      </div>

    </div>
  );
}
