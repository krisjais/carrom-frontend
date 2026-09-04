'use client';

import React from 'react';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessFooter } from '@/components/chess/ChessFooter';
import { Clock, Trophy, Award, Swords, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ChessRulesPage() {
  const pieceValues = [
    { symbol: '♟', name: 'Pawn', val: '1 pt' },
    { symbol: '♞', name: 'Knight', val: '3 pts' },
    { symbol: '♝', name: 'Bishop', val: '3 pts' },
    { symbol: '♜', name: 'Rook', val: '5 pts' },
    { symbol: '♛', name: 'Queen', val: '9 pts' },
    { symbol: '♚', name: 'King', val: '∞ (Game)' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Editorial Header Banner */}
        <div className="relative overflow-hidden bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-8 sm:p-12 rounded-3xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#171715] dark:bg-[#FAF8F3]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#8E8E93] font-semibold">
                  Official Codex • Regulations & Scoring
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.1]">
                Know the Board. Know the Game.
              </h1>
              <p className="text-sm text-[#4E4C47] dark:text-[#9E9B93] mt-3 font-sans leading-relaxed">
                Official FIDE-derived championship rules governing rapid clock timers, piece material valuation, Swiss pairing integrity, and leaderboard tie-breakers.
              </p>
            </div>

            <Link
              href="/chess/register"
              className="inline-flex items-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-medium px-6 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm shrink-0 w-full sm:w-auto justify-center"
            >
              <span>Register for Tournament</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Match Duration & Clock */}
          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3]">
                  <Clock className="w-4 h-4 text-[#171715] dark:text-[#FAF8F3]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    Regulation 01
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    Strict 10-Minute Rapid Timers
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#77736B] dark:text-[#8E8E93]">
                10:00
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-[#4E4C47] dark:text-[#9E9B93] leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#171715] dark:text-[#FAF8F3]" />
                </span>
                <span>Each scheduled match runs with a strict duration cap of <strong>10 minutes</strong> per fixture.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#171715] dark:text-[#FAF8F3]" />
                </span>
                <span>The backend server is the authoritative clock, computing remaining seconds synchronously from match start timestamps.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#171715] dark:text-[#FAF8F3]" />
                </span>
                <span>If the timer expires before checkmate occurs, the winner is determined by highest accumulated <strong>Material Points</strong>.</span>
              </li>
            </ul>
          </div>

          {/* Section 2: Piece Scoring */}
          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3]">
                  <Trophy className="w-4 h-4 text-[#171715] dark:text-[#FAF8F3]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    Regulation 02
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    Material Piece Valuation
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#77736B] dark:text-[#8E8E93]">
                FIDE Standard
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {pieceValues.map((p) => (
                <div key={p.name} className="flex items-center justify-between bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/80 dark:border-[#282826] px-3.5 py-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-lg leading-none text-[#171715] dark:text-[#FAF8F3]">{p.symbol}</span>
                    <span className="font-medium text-[#171715] dark:text-[#FAF8F3] font-serif">{p.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#171715] dark:text-[#FAF8F3]">{p.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Standings & Points */}
          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3]">
                  <Award className="w-4 h-4 text-[#171715] dark:text-[#FAF8F3]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    Regulation 03
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    Tournament Points & Tie-Breakers
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#77736B] dark:text-[#8E8E93]">
                3-1-0 Format
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-[#4E4C47] dark:text-[#9E9B93] leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="font-mono font-bold text-[#171715] dark:text-[#FAF8F3] bg-[#EFEAE1] dark:bg-[#1E1E1C] px-2.5 py-0.5 rounded-lg border border-[#D5CFC5] dark:border-[#2E2E2B] shrink-0">
                  +3 Pts
                </span>
                <span>Awarded for an outright <strong>VICTORY</strong> or for an unplayed bye round.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono font-bold text-[#171715] dark:text-[#FAF8F3] bg-[#EFEAE1] dark:bg-[#1E1E1C] px-2.5 py-0.5 rounded-lg border border-[#D5CFC5] dark:border-[#2E2E2B] shrink-0">
                  +1 Pt
                </span>
                <span>Awarded to both competitors in the event of an agreed or stalemated <strong>DRAW</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-mono font-bold text-[#171715] dark:text-[#FAF8F3] bg-[#EFEAE1] dark:bg-[#1E1E1C] px-2.5 py-0.5 rounded-lg border border-[#D5CFC5] dark:border-[#2E2E2B] shrink-0">
                  Tie-Break
                </span>
                <span>Rankings tied on match points are sorted strictly by total cumulative <strong>Material Points</strong> captured across all tournament rounds.</span>
              </li>
            </ul>
          </div>

          {/* Section 4: Pairings & BYE System */}
          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-7 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3]">
                  <Swords className="w-4 h-4 text-[#171715] dark:text-[#FAF8F3]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                    Regulation 04
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    Swiss Pairing Engine & BYEs
                  </h3>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-[#77736B] dark:text-[#8E8E93]">
                Zero Repeats
              </span>
            </div>

            <ul className="space-y-3.5 text-xs text-[#4E4C47] dark:text-[#9E9B93] leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#171715] dark:text-[#FAF8F3]" />
                </span>
                <span>Automated Swiss algorithm pairs players of similar point standings each successive round.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#171715] dark:text-[#FAF8F3]" />
                </span>
                <span>Repeat head-to-head fixtures between the same two competitors are strictly forbidden in preliminary rounds.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-[#171715] dark:text-[#FAF8F3]" />
                </span>
                <span>When the approved roster count is odd, an unplayed BYE (+3 tournament points) is systematically awarded to an eligible competitor.</span>
              </li>
            </ul>
          </div>

        </div>

      </main>

      <ChessFooter />
    </div>
  );
}

export default ChessRulesPage;
