'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Shield, Trophy, Users, Sparkles, ArrowRight } from 'lucide-react';
import { MainBoardBadge } from '@/components/ui/Badge';
import { CarromCoin } from '@/components/ui/CarromElements';

export default function RulesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="eyebrow-label">
          OFFICIAL TOURNAMENT RULEBOOK
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8] tracking-tight">
          Rules & Regulations
        </h1>
        <p className="text-xs sm:text-sm text-[#7E7060] dark:text-[#B8B1A5] font-normal">
          Single-game knockout rules, sequential Main Carrom Board arena operations, and verified pairing criteria.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule 1: Single-Game Knockout */}
        <div className="editorial-card p-6 sm:p-8 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center">
              <CarromCoin type="black" size="xs" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-lg">1. Single-Game Knockout</h3>
              <span className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">1 Match = 1 Game</span>
            </div>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
            Every match is decided by exactly 1 game played on the Main Carrom Board. The winner of that single game immediately advances to the next round of the tournament bracket.
          </p>
        </div>

        {/* Rule 2: Single Equipment Arena */}
        <div className="editorial-card p-6 sm:p-8 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center">
              <CarromCoin type="queen" size="xs" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-lg">2. Main Carrom Board</h3>
              <span className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">Single Physical Board</span>
            </div>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
            There is ONLY ONE physical Carrom board in the tournament arena. All matches queue in a strict FIFO sequential order. Only 1 match can be LIVE in play at any given time.
          </p>
        </div>

        {/* Rule 3: Dynamic Bye Logic */}
        <div className="editorial-card p-6 sm:p-8 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center">
              <CarromCoin type="white" size="xs" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-lg">3. Dynamic Bye Formula</h3>
              <span className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">N % 2 Formula</span>
            </div>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
            If the number of entries N is even, exactly 0 byes are awarded. If N is odd, exactly 1 random bye is awarded to advance 1 team to the next round.
          </p>
        </div>

        {/* Rule 4: Partner Nominations */}
        <div className="editorial-card p-6 sm:p-8 space-y-4 rounded-2xl bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center">
              <Users className="w-4 h-4 text-[#3E342B] dark:text-[#D4A94C]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] text-lg">4. Partner Verification</h3>
              <span className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">Mutual Registration</span>
            </div>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
            Partners are specified during registration by entering the partner's full legal name. Both athletes must register independently. Opponents are selected strictly through a random draw.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/registration"
          className="btn-primary text-xs font-bold px-8 py-3.5 shadow-md inline-flex items-center gap-2"
        >
          <span>REGISTER AS A PARTICIPANT</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}


