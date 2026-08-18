'use client';

import React from 'react';
import { Trophy, Disc, Crown, AlertTriangle, CheckCircle2, Shield, Users, Sparkles } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-mono text-[#FFBA00] font-bold uppercase tracking-widest block">
          Official Tournament Standards
        </span>
        <h1 className="text-4xl sm:text-5xl font-black font-display text-white tracking-tight">
          Tournament Rules
        </h1>
        <p className="text-xs sm:text-sm text-[#D8C7F0]">
          Official regulations, single-game knockout match format, and Main Carrom Board arena standards.
        </p>
      </div>

      {/* 4 Core Rule Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="sport-card p-6 space-y-3 rounded-3xl border border-[#4A138C]">
          <div className="flex items-center gap-2.5 text-[#FFBA00]">
            <Trophy className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display">1. Match Format: Single-Game Knockout</h3>
          </div>
          <p className="text-xs text-[#D8C7F0] leading-relaxed">
            In each round, 1 match = 1 game on the Main Carrom Board. Whoever wins that game wins the match and advances to the next round immediately.
          </p>
        </div>

        <div className="sport-card p-6 space-y-3 rounded-3xl border border-[#4A138C]">
          <div className="flex items-center gap-2.5 text-[#FDB095]">
            <Users className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display">2. Partner vs. Opponent Selection</h3>
          </div>
          <p className="text-xs text-[#D8C7F0] leading-relaxed">
            Partners are chosen at registration and verified by the Admin. Opponents are paired strictly through a random draw after registration closes.
          </p>
        </div>

        <div className="sport-card p-6 space-y-3 rounded-3xl border border-[#4A138C]">
          <div className="flex items-center gap-2.5 text-[#E5958E]">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display">3. Dynamic Bye Logic</h3>
          </div>
          <p className="text-xs text-[#D8C7F0] leading-relaxed">
            If a round has an even number of entries, there are 0 byes. If odd, exactly 1 random entry receives a bye to advance 1 round. In the next round, all advancing entries are reshuffled.
          </p>
        </div>

        <div className="sport-card p-6 space-y-3 rounded-3xl border border-[#4A138C]">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <Shield className="w-5 h-5" />
            <h3 className="font-black text-white text-base font-display">4. Main Carrom Board Arena</h3>
          </div>
          <p className="text-xs text-[#D8C7F0] leading-relaxed">
            Only 1 physical equipment board exists in the championship. At most 1 match is LIVE at a time. All matches queue in FIFO order.
          </p>
        </div>
      </div>
    </div>
  );
}
