'use client';

import React, { useState } from 'react';
import { ChessHeader } from '@/components/chess/ChessHeader';
import { ChessFooter } from '@/components/chess/ChessFooter';
import {
  Clock,
  Trophy,
  Award,
  Swords,
  Check,
  ArrowRight,
  Download,
  FileText,
  Shield,
  AlertTriangle,
  Eye,
  X,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export function ChessRulesPage() {
  const [showPdfViewer, setShowPdfViewer] = useState(false);

  const officialRules = [
    {
      num: '01',
      title: 'Reporting & Start',
      tag: '10-MIN ARRIVAL',
      items: [
        'Players must report at least 10 minutes before their scheduled match.',
        'The board must be correctly set before the game begins. White moves first.',
        'The referee starts the official 10-minute timer. Players must make moves without unnecessary delay.'
      ]
    },
    {
      num: '02',
      title: 'Legal Play',
      tag: 'FIDE COMPLIANT',
      items: [
        'All moves must follow standard chess movement rules for the King, Queen, Rook, Bishop, Knight, and Pawn.',
        'A player may not make a move that leaves their own King in check.',
        'Castling, en passant, and pawn promotion are allowed only when all standard legal conditions are satisfied.',
        'Check must be answered immediately. Checkmate ends the game.'
      ]
    },
    {
      num: '03',
      title: 'Touch-Move & Piece Handling',
      tag: 'STRICT TOUCH-MOVE',
      items: [
        'Touch-move applies: intentionally touching a piece means the player must make a legal move with it when required by the rule.',
        'A player wishing only to adjust a piece should clearly say "Adjust" before touching it.',
        'Players must not disturb pieces, the board, or the opponent during play.'
      ]
    },
    {
      num: '04',
      title: 'Time & Game Result',
      tag: '10:00 RAPID LIMIT',
      items: [
        'Each match features a strict 10-minute rapid clock control.',
        'Checkmate ends the game immediately in victory. If a player runs out of time on their clock, they lose.',
        'The referee declares the official winner directly by choosing the winning competitor name, advancing them in the knockout bracket.'
      ]
    },
    {
      num: '05',
      title: 'Draws',
      tag: 'STALEMATE & AGREEMENT',
      items: [
        'A draw may occur by stalemate, agreement, or another recognised chess draw condition.',
        'The referee may stop the game when a clear draw condition has occurred.'
      ]
    },
    {
      num: '06',
      title: 'Illegal Moves & Penalties',
      tag: 'REFEREE ADJUDICATION',
      items: [
        'An illegal move must be reported to the referee immediately.',
        'The referee will restore the position where necessary and apply the official tournament penalty.',
        'Repeated illegal moves or deliberate rule violations may result in loss of match or disqualification.'
      ]
    },
    {
      num: '07',
      title: 'Fair Play & Conduct',
      tag: 'ZERO TOLERANCE',
      items: [
        'Mobile phones and unauthorised electronic assistance are strictly prohibited during play.',
        'Players may not receive advice, consult notes, or receive outside assistance.',
        'Do not distract the opponent, comment on the game unnecessarily, or interfere with other boards.',
        'Cheating, abusive behaviour, intentional disturbance, or refusal to follow the referee may result in immediate disqualification.'
      ]
    },
    {
      num: '08',
      title: 'Final Authority',
      tag: 'OFFICIAL ORGANISER DECISION',
      items: [
        'The referee and organizing committee have final authority over legality, timing, penalties, draws, disputes, conduct, and disqualification.'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F2EB] dark:bg-[#0D0D0D] flex flex-col font-sans text-[#171715] dark:text-[#FAF8F3] antialiased selection:bg-[#E4DED5] dark:selection:bg-[#2A2A28]">
      <ChessHeader />

      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Editorial Header Banner */}
        <div className="relative overflow-hidden bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-8 sm:p-12 rounded-3xl shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#77736B] dark:text-[#8E8E93] font-semibold">
                  NEXCORE INSTITUTE OF TECHNOLOGY • INDOOR SPORTS TOURNAMENT 2026
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#171715] dark:text-[#FAF8F3] tracking-tight leading-[1.1]">
                Official Chess Regulations & Code
              </h1>
              <p className="text-sm text-[#4E4C47] dark:text-[#9E9B93] mt-3 font-sans leading-relaxed">
                Official rules governing rapid clock timers, individual 1v1 play, piece material valuation, touch-move protocol, and referee dispute resolution.
              </p>
            </div>

            {/* Actions: Download PDF & View PDF */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
              <a
                href="/Nexcore_Chess_Rules.pdf"
                download="Nexcore_Chess_Rules.pdf"
                className="inline-flex items-center justify-center gap-2 bg-[#171715] dark:bg-[#FAF8F3] hover:bg-black dark:hover:bg-white text-[#FAF8F3] dark:text-[#0D0D0D] font-mono font-semibold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer w-full sm:w-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download Rulebook (PDF)</span>
              </a>

              <button
                type="button"
                onClick={() => setShowPdfViewer(!showPdfViewer)}
                className="inline-flex items-center justify-center gap-2 bg-[#EFEAE1] dark:bg-[#1D1D1B] hover:bg-[#E4DED5] dark:hover:bg-[#282826] border border-[#D5CFC5] dark:border-[#262624] text-[#171715] dark:text-[#FAF8F3] font-mono font-semibold px-5 py-3 rounded-xl text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer w-full sm:w-auto"
              >
                <FileText className="w-4 h-4" />
                <span>{showPdfViewer ? 'Hide PDF Viewer' : 'View PDF'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Embedded PDF Viewer (Expandable) */}
        {showPdfViewer && (
          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-4 sm:p-6 shadow-md space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5CFC5] dark:border-[#262624] pb-3">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#171715] dark:text-[#FAF8F3] truncate">
                  Nexcore_Chess_Rules.pdf (Interactive Document Viewer)
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/Nexcore_Chess_Rules.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in New Tab</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPdfViewer(false)}
                  className="w-7 h-7 rounded-lg border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#77736B] hover:text-[#171715] dark:hover:text-[#FAF8F3]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="w-full h-[60vh] sm:h-[650px] rounded-2xl overflow-hidden border border-[#D5CFC5]/80 dark:border-[#262624] bg-[#EFEAE1]/40">
              <iframe
                src="/Nexcore_Chess_Rules.pdf#toolbar=1"
                className="w-full h-full"
                title="Nexcore Chess Official Rules PDF"
              />
            </div>
          </div>
        )}

        {/* Overview Bar: 10-Min Limit + 1v1 Format */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3]">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                Match Time Cap
              </span>
              <span className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3]">
                10 Minutes Per Match (Overall Match Limit)
              </span>
            </div>
          </div>

          <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3]">
              <Swords className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#77736B] dark:text-[#8E8E93] block">
                Tournament Format
              </span>
              <span className="font-serif font-bold text-base text-[#171715] dark:text-[#FAF8F3]">
                Individual — 1 Player vs 1 Player
              </span>
            </div>
          </div>
        </div>

        {/* Match Decision & Progression Banner */}
        <div className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center text-[#171715] dark:text-[#FAF8F3] shrink-0">
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                Match Decision & Knockout Progression
              </h3>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#77736B] dark:text-[#8E8E93]">
              Direct Winner Selection
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/80 dark:border-[#282826] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-amber-700 dark:text-amber-400 block">
                01 • Direct Declaration
              </span>
              <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                Winner Declared by Name
              </h4>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] leading-relaxed">
                No complex piece points or captured pointer calculations. The arbiter directly clicks the winning player to confirm victory.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/80 dark:border-[#282826] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                02 • Knockout Progression
              </span>
              <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                Instant Bracket Advancement
              </h4>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] leading-relaxed">
                Declared winners automatically propagate to the subsequent championship round across the bracket tree.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#EFEAE1]/60 dark:bg-[#1B1B19] border border-[#D5CFC5]/80 dark:border-[#282826] space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-sky-700 dark:text-sky-400 block">
                03 • Rapid Speed Clock
              </span>
              <h4 className="font-serif font-bold text-sm text-[#171715] dark:text-[#FAF8F3]">
                10-Minute Rapid Control
              </h4>
              <p className="text-xs text-[#77736B] dark:text-[#8E8E93] leading-relaxed">
                Standard tournament chess clocks govern over-the-board pacing. A flag fall (clock expiration) results in loss on time.
              </p>
            </div>
          </div>
        </div>

        {/* Official 8 Codex Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {officialRules.map((rule) => (
            <div
              key={rule.num}
              className="bg-[#FAF8F3] dark:bg-[#141414] border border-[#D5CFC5] dark:border-[#262624] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#171715] dark:hover:border-[#FAF8F3] transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D5CFC5]/70 dark:border-[#262624] pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-xl font-bold text-[#77736B] dark:text-[#8E8E93] shrink-0">
                    {rule.num}
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#171715] dark:text-[#FAF8F3] tracking-tight">
                    {rule.title}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-semibold tracking-wider px-2.5 py-0.5 rounded-full bg-[#EFEAE1] dark:bg-[#1E1E1C] border border-[#D5CFC5] dark:border-[#2E2E2B] text-[#77736B] dark:text-[#8E8E93] shrink-0">
                  {rule.tag}
                </span>
              </div>

              <ul className="space-y-3 text-xs text-[#4E4C47] dark:text-[#9E9B93] leading-relaxed">
                {rule.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-[#EFEAE1] dark:bg-[#1D1D1B] border border-[#D5CFC5] dark:border-[#262624] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-[#171715] dark:text-[#FAF8F3]" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="rounded-3xl p-8 sm:p-12 text-center bg-[#171715] text-[#FAF8F3] dark:bg-[#FAF8F3] dark:text-[#0D0D0D] shadow-xl space-y-4 max-w-3xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-widest opacity-70 font-semibold block">
            READY FOR THE CHALLENGE?
          </span>
          <h3 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
            Register and Step into the Arena
          </h3>
          <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto leading-relaxed">
            Review the codex above, download your official rulebook copy, and claim your competitive seed.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/chess/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#171715] dark:bg-[#0D0D0D] dark:text-white font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
            >
              <span>Enroll as Contender</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="/Nexcore_Chess_Rules.pdf"
              download="Nexcore_Chess_Rules.pdf"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 dark:border-black/30 hover:bg-white/10 dark:hover:bg-black/10 font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save PDF</span>
            </a>
          </div>
        </div>

      </main>

      <ChessFooter />
    </div>
  );
}

export default ChessRulesPage;
