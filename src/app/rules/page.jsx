'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Shield, Trophy, Users, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CarromCoin } from '@/components/ui/CarromElements';

export default function RulesPage() {
  const rules = [
    {
      num: '01',
      title: 'Single-Game Knockout Format',
      tag: '1 MATCH = 1 GAME',
      desc: 'Every scheduled tournament fixture is strictly decided by 1 single game played on the Main Carrom Board. The winner of that single game immediately advances to the next stage in the single-elimination tournament bracket.',
      coin: 'queen'
    },
    {
      num: '02',
      title: 'Centralized Main Carrom Board',
      tag: 'STRICT FIFO QUEUE',
      desc: 'All official fixtures across all 5 divisions are contested exclusively on the championship Main Carrom Board. Matches are called in sequential queue order with real-time referee score entry and verified rest timers.',
      coin: 'black'
    },
    {
      num: '03',
      title: 'Dynamic Knockout Bye Formula',
      tag: 'N % 2 MATHEMATICAL DRAW',
      desc: 'If the total number of approved entries N in a category is even, zero byes are awarded. If N is odd, exactly one random bye is awarded in Round 1 to advance an entry directly into the second round.',
      coin: 'white'
    },
    {
      num: '04',
      title: 'Mandatory 3-Event Entry',
      tag: 'TRI-DIVISION PARTICIPATION',
      desc: 'Every registered competitor is eligible and auto-enrolled into Singles, Doubles, and Mixed Doubles. This ensures an active, full-spectrum championship experience for all participating student athletes.',
      coin: 'queen'
    },
    {
      num: '05',
      title: 'Independent Partner Registration',
      tag: 'MUTUAL NOMINATION MATCH',
      desc: 'Athletes nominate their doubles and mixed doubles partners by name during registration. Both partners register independently. Once both profiles are confirmed, the system pairs and locks the squad.',
      coin: 'black'
    },
    {
      num: '06',
      title: 'Certified Referee Adjudication',
      tag: 'DIGITAL SCORESHEET ARCHIVE',
      desc: 'All board outcomes, Queen covers, and coin tallies are entered directly into the referee scorekeeper console. Match completions trigger downstream advancement in the knockout tree automatically.',
      coin: 'white'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 text-[#171614] dark:text-[#F7F4EC]">
      
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#857B6C] font-semibold block">
          OFFICIAL TOURNAMENT RULEBOOK
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-[#171614] dark:text-[#F7F4EC]">
          Rules & Regulations
        </h1>
        <p className="text-xs sm:text-sm text-[#6F6A60] dark:text-[#A8A194] leading-relaxed">
          Standardized single-game knockout rules, sequential Main Carrom Board tournament operations, and verified pairing criteria.
        </p>
      </div>

      {/* Rules Grid (Editorial numbered layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {rules.map((rule) => (
          <div
            key={rule.num}
            className="rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B25] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#171614] dark:hover:border-[#C2A268] transition-colors"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD6C8] dark:border-[#2E2B25]">
              <span className="font-mono text-2xl sm:text-3xl font-bold text-[#DCD6C8] dark:text-[#38342C]">
                {rule.num}
              </span>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#FAF8F3] dark:bg-[#24221E] border border-[#DCD6C8] dark:border-[#38342C] text-[#857B6C]">
                {rule.tag}
              </span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC]">
                {rule.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6F6A60] dark:text-[#A8A194] leading-relaxed">
                {rule.desc}
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <CarromCoin type={rule.coin} size="sm" />
            </div>
          </div>
        ))}
      </div>

      {/* CTA Box */}
      <div className="rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center bg-[#171614] text-[#F7F4EC] border border-[#171614] shadow-xl space-y-4 max-w-3xl mx-auto">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#C2A268] font-semibold block">
          READY TO COMPETE?
        </span>
        <h3 className="text-xl sm:text-3xl font-serif font-bold text-white tracking-tight">
          Enter the Championship Draws
        </h3>
        <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto">
          Nominate your partners and claim your seed in the official single-elimination tournament draws.
        </p>
        <div className="pt-2 sm:pt-3">
          <Link
            href="/registration"
            className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-[#F7F4EC] hover:bg-white text-[#171614] text-xs font-bold tracking-wider uppercase transition-all shadow-md cursor-pointer w-full sm:w-auto"
          >
            <span>Register as an Athlete</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
