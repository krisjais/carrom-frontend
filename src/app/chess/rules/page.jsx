'use client';

import React from 'react';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { Shield, Clock, Trophy, Award, CheckCircle2, AlertTriangle, Swords } from 'lucide-react';
import Link from 'next/link';

export default function ChessRulesPage() {
  const pieceValues = [
    { symbol: '♟', name: 'Pawn', val: '1 Point' },
    { symbol: '♞', name: 'Knight', val: '3 Points' },
    { symbol: '♝', name: 'Bishop', val: '3 Points' },
    { symbol: '♜', name: 'Rook', val: '5 Points' },
    { symbol: '♛', name: 'Queen', val: '9 Points' },
    { symbol: '♚', name: 'King', val: '0 Points (Locked / Illegal Capture)' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col font-sans text-[#111111] antialiased">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-widest block">
              OFFICIAL RULEBOOK & REGULATIONS
            </span>
            <h1 className="text-2xl font-bold font-display text-[#111111] uppercase">
              TOURNAMENT RULES & SCORING
            </h1>
            <p className="text-xs text-[#666666] mt-1">
              Official regulations governing match timing, piece material points, tournament standings, and pairings.
            </p>
          </div>

          <Link
            href="/chess/register"
            className="bg-[#000000] hover:bg-[#222222] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase font-display tracking-wider shadow-xs"
          >
            Register Now
          </Link>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Match Duration & Clock */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Clock className="w-4 h-4 text-[#C9A227]" />
              </div>
              <h3 className="text-sm font-bold font-display text-[#111111] uppercase">
                1. STRICT 10-MINUTE MATCH TIMERS
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-[#666666] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Each player match has a total duration of <strong>10 minutes</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>The backend server is the single source of truth, calculating remaining time strictly from start and end timestamps.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>If time expires before checkmate, the winner is determined by highest captured <strong>Material Points</strong>.</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Piece Scoring */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Trophy className="w-4 h-4 text-[#C9A227]" />
              </div>
              <h3 className="text-sm font-bold font-display text-[#111111] uppercase">
                2. MATERIAL PIECE POINT VALUES
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {pieceValues.map((p) => (
                <div key={p.name} className="flex items-center justify-between bg-gray-50 border border-[#E5E5E5] px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none">{p.symbol}</span>
                    <span className="font-semibold text-[#111111]">{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#C9A227]">{p.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Standings & Points */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Award className="w-4 h-4 text-[#C9A227]" />
              </div>
              <h3 className="text-sm font-bold font-display text-[#111111] uppercase">
                3. TOURNAMENT POINTS & TIE-BREAKING
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-[#666666] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-mono font-bold text-[#111111] bg-gray-100 px-2 py-0.5 rounded border border-[#E5E5E5]">
                  +3 Pts
                </span>
                <span>Awarded for a match <strong>WIN</strong> or an automatic <strong>BYE</strong> round.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono font-bold text-[#111111] bg-gray-100 px-2 py-0.5 rounded border border-[#E5E5E5]">
                  +1 Pt
                </span>
                <span>Awarded to both players for a <strong>DRAW</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-mono font-bold text-[#111111] bg-gray-100 px-2 py-0.5 rounded border border-[#E5E5E5]">
                  Tie-Break
                </span>
                <span>If tournament points are equal, rankings are decided by total accumulated <strong>Material Points</strong> across all matches.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Pairings & BYE System */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-[#E5E5E5] pb-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
                <Swords className="w-4 h-4 text-[#C9A227]" />
              </div>
              <h3 className="text-sm font-bold font-display text-[#111111] uppercase">
                4. FAIR PAIRING & ODD BYE ENGINE
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-[#666666] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Automatic Swiss-style pairing engine matches competitors fairly each round.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Duplicate head-to-head match pairings are strictly prevented.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>If the total count of approved players is odd, an automatic BYE (+3 tournament points) is assigned to eligible players.</span>
              </li>
            </ul>
          </div>

        </div>

      </main>

      <ChessFooter />
    </div>
  );
}
