'use client';

import React from 'react';
import { Trophy, Disc, Crown, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black font-display text-white">
          Tournament Rules
        </h1>
        <p className="text-xs sm:text-sm text-[#94A3B8]">
          Official rules and scoring guidelines for the 2026 Carrom Championship.
        </p>
      </div>

      {/* 4 Core Rule Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sport-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Trophy className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm font-display">1. Match Format: Best of 3 Boards</h3>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Every match is Best of 3 Boards. The first player or team to win 2 boards wins the match (2–0 or 2–1). Board 3 is unlocked and played only when the first two boards result in a 1–1 tie.
          </p>
        </div>

        <div className="sport-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Disc className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm font-display">2. Coin Scoring & Limits</h3>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Each regular white or black carrom coin awards 1 point. The maximum score achievable for any single board is 25 points.
          </p>
        </div>

        <div className="sport-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <Crown className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm font-display">3. Queen Scoring & Covering</h3>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            The red Queen awards 3 points only when properly covered with another coin in the immediate following shot.
          </p>
        </div>

        <div className="sport-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-[#D4AF37]">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-white text-sm font-display">4. Striker Fouls & Confirmation</h3>
          </div>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            Pocketing the striker results in a -1 point penalty and ends turn. The tournament Administrator records points and manually confirms board winners.
          </p>
        </div>
      </div>

      {/* Knockout Bracket & Byes */}
      <div className="sport-card p-6 space-y-3">
        <h3 className="font-bold text-white text-sm font-display flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#D4AF37]" />
          <span>Single Arena & Sequential READY Queue</span>
        </h3>
        <p className="text-xs text-[#94A3B8] leading-relaxed">
          The entire tournament is played on the <strong>Main Carrom Board</strong> with at most 1 LIVE match tournament-wide. Fixtures with determined opponents join the sequential <strong>READY Queue</strong> in FIFO order. Player minimum rest times and arena breaks are strictly checked prior to match start.
        </p>
      </div>
    </div>
  );
}
