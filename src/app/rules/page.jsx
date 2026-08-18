'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Shield, Trophy, Users, Sparkles, ArrowRight } from 'lucide-react';
import { MainBoardBadge } from '@/components/ui/Badge';

export default function RulesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFD691] font-bold uppercase tracking-widest block">
          Official Tournament Rulebook
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Rules & Regulations
        </h1>
        <p className="text-xs sm:text-sm text-[#D4DEEE]">
          Single-game knockout rules, sequential Main Carrom Board arena operations, and verified pairing criteria.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rule 1: Single-Game Knockout */}
        <div className="sport-card p-6 sm:p-8 space-y-4 rounded-3xl border border-[#35538C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD691]/20 text-[#FFD691] flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg font-display">1. Single-Game Knockout</h3>
              <span className="text-xs text-[#D7A859] font-mono">1 Match = 1 Game</span>
            </div>
          </div>
          <p className="text-xs text-[#D4DEEE] leading-relaxed">
            Every match is decided by exactly 1 game played on the Main Carrom Board. The winner of that single game immediately advances to the next round of the tournament bracket.
          </p>
        </div>

        {/* Rule 2: Single Equipment Arena */}
        <div className="sport-card p-6 sm:p-8 space-y-4 rounded-3xl border border-[#35538C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg font-display">2. Main Carrom Board</h3>
              <span className="text-xs text-emerald-400 font-mono">Sequential Play</span>
            </div>
          </div>
          <p className="text-xs text-[#D4DEEE] leading-relaxed">
            There is ONLY ONE physical Carrom board in the tournament arena. All matches queue in a strict FIFO sequential order. Only 1 match can be LIVE in play at any given time.
          </p>
        </div>

        {/* Rule 3: Dynamic Bye Logic */}
        <div className="sport-card p-6 sm:p-8 space-y-4 rounded-3xl border border-[#35538C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD691]/20 text-[#FFD691] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg font-display">3. Dynamic Bye Formula</h3>
              <span className="text-xs text-[#FFD691] font-mono">N % 2 Formula</span>
            </div>
          </div>
          <p className="text-xs text-[#D4DEEE] leading-relaxed">
            If the number of entries $N$ is even, exactly 0 byes are awarded. If $N$ is odd, exactly 1 random bye is awarded to advance 1 team to the next round.
          </p>
        </div>

        {/* Rule 4: Partner Nominations */}
        <div className="sport-card p-6 sm:p-8 space-y-4 rounded-3xl border border-[#35538C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D7A859]/20 text-[#FFE2AA] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg font-display">4. Partner Verification</h3>
              <span className="text-xs text-[#D7A859] font-mono">Mutual Registration</span>
            </div>
          </div>
          <p className="text-xs text-[#D4DEEE] leading-relaxed">
            Partners are specified during registration by entering the partner's full legal name. Both athletes must register independently. Opponents are selected strictly through a random draw.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/registration"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl btn-cream text-xs font-black shadow-lg transition-all"
        >
          <span>REGISTER AS A PARTICIPANT</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
