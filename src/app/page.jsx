'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';
import {
  ArrowRight,
  Trophy,
  Calendar,
  Sparkles,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  Play,
  UserPlus,
  ShieldCheck,
  Shuffle
} from 'lucide-react';
import { StatusBadge, CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';
import {
  CarromCoin,
  CategoryCoinPair,
  CarromHeroArt,
  CarromBoardGeometry
} from '@/components/ui/CarromElements';

const FORMAT_STAGES = [
  {
    step: '01',
    title: 'REGISTER',
    icon: UserPlus,
    description: 'Athletes submit entries with mandatory Student ID and partner nominations for doubles events.',
    isFinal: false,
  },
  {
    step: '02',
    title: 'APPROVAL',
    icon: ShieldCheck,
    description: 'Administrators verify student credentials and mutual partner requests, then lock approved rosters.',
    isFinal: false,
  },
  {
    step: '03',
    title: 'DRAW',
    icon: Shuffle,
    description: 'Single-game knockout brackets are generated with strict random pairing and mathematical bye logic.',
    isFinal: false,
  },
  {
    step: '04',
    title: 'COMPETE',
    icon: Trophy,
    description: 'Matches queue sequentially on the single Main Carrom Board with live score updates until champions are crowned.',
    isFinal: true,
  },
];

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [liveData, setLiveData] = useState({ liveMatches: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, liveRes] = await Promise.all([
          api.getOverviewStats().catch((e) => {
            console.warn('[Home] Stats fetch fallback:', e.message);
            return { success: false };
          }),
          api.getLiveMatches().catch((e) => {
            console.warn('[Home] Live matches fetch fallback:', e.message);
            return { success: false, liveMatches: [] };
          })
        ]);
        if (statsRes?.success && statsRes.stats) setStats(statsRes.stats);
        if (liveRes?.success) setLiveData(liveRes);
      } catch (err) {
        console.warn('Home data load notice:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentMatch = liveData?.currentMatch;
  const upcomingQueue = liveData?.upcomingQueue?.slice(0, 3) || [];

  return (
    <div className="flex-1 flex flex-col space-y-16 sm:space-y-24 pb-24 overflow-hidden bg-[#FAF9F6] dark:bg-[#0B0D0E] text-[#4A4238] dark:text-[#F5F1E8] transition-colors duration-200">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-[#E8E1D5] dark:border-[#2B3034] bg-[#FAF9F6] dark:bg-[#0B0D0E]">
        {/* Subtle arena spotlight in night mode */}
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_50%_35%,rgba(212,169,76,0.08),transparent_55%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Editorial Statement & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 sm:space-y-7 animate-in fade-in duration-500">
            {/* Small Eyebrow */}
            <div className="flex flex-col items-start space-y-1">
              <span className="eyebrow-label">
                CARROMPRO
              </span>
              <p className="text-xs font-mono font-bold tracking-[0.2em] text-[#7E7060] dark:text-[#B8B1A5] uppercase">
                COLLEGE CARROM CHAMPIONSHIP 2026
              </p>
            </div>

            {/* Large Editorial Headline */}
            <h1 className="flex flex-col items-start leading-[1.06] text-[#3E342B] dark:text-[#F5F1E8]">
              <span className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight uppercase">
                THE MODERN
              </span>
              <span className="text-3xl sm:text-5xl lg:text-6xl font-serif italic font-normal tracking-tight text-[#3E342B]/90 dark:text-[#F5F1E8]/90">
                CARROM LEAGUE.
              </span>
              <span className="text-3xl sm:text-5xl lg:text-6xl font-cormorant font-bold uppercase tracking-[0.02em] text-[#E74C3C] mt-1 sm:mt-1.5">
                SKILL & STRATEGY.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-[#7E7060] dark:text-[#B8B1A5] max-w-xl font-normal leading-relaxed text-left">
              The premier collegiate carrom tournament standard. Single-game dynamic knockout draws, sequential scheduling on the single Main Carrom Board, and verified student athlete rosters.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1 sm:pt-2">
              <Link
                href="/registration"
                className="btn-primary text-xs sm:text-sm font-bold tracking-wider px-8 py-3.5 shadow-md"
              >
                <span>REGISTER NOW</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tournament"
                className="btn-secondary text-xs sm:text-sm font-bold tracking-wider px-8 py-3.5"
              >
                <span>VIEW TOURNAMENT</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Sophisticated Flat Carrom Composition */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end animate-in fade-in duration-700">
            <CarromHeroArt />
          </div>
        </div>
      </section>

      {/* 2. CHAMPIONSHIP SCOREBOARD STATS STRIP */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-12 sm:-mt-16 relative z-20">
        <div className="scoreboard-strip p-6 sm:p-8 bg-white dark:bg-[#15191C] border border-[#E8E1D5] dark:border-[#2B3034] rounded-2xl shadow-xs">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#E8E1D5] dark:divide-[#2B3034] text-center">
            {/* Stat 1 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">
                {stats?.totalParticipants || 250}+
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7E7060] dark:text-[#B8B1A5] font-sans font-bold uppercase tracking-[0.16em]">
                Registered Athletes
              </p>
            </div>

            {/* Stat 2 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#3E342B] dark:text-[#F5F1E8]">
                5
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7E7060] dark:text-[#B8B1A5] font-sans font-bold uppercase tracking-[0.16em]">
                Divisions
              </p>
            </div>

            {/* Stat 3 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#E74C3C] flex items-center justify-center gap-2">
                <span className="live-dot" />
                <span>1</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7E7060] dark:text-[#B8B1A5] font-sans font-bold uppercase tracking-[0.16em]">
                Main Carrom Board
              </p>
            </div>

            {/* Stat 4 */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#3E342B] dark:text-[#D4A94C]">
                2026
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#7E7060] dark:text-[#B8B1A5] font-sans font-bold uppercase tracking-[0.16em]">
                Championship
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CARROM BOARD LIVE SPOTLIGHT & SEQUENTIAL QUEUE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2B3034] pb-4">
          <div className="space-y-0.5">
            <span className="eyebrow-label">ARENA MATCH CONTROL</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] flex items-center gap-2.5">
              <span>MAIN CARROM BOARD</span>
              {currentMatch && <span className="live-dot" />}
            </h2>
          </div>
          <Link
            href="/live"
            className="text-xs font-bold text-[#E74C3C] hover:underline flex items-center gap-1 uppercase tracking-wider"
          >
            <span>Full Live Arena</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {currentMatch ? (
          <div className="editorial-card p-6 sm:p-8 space-y-6 border border-[#D5C4A1] dark:border-[#2B3034] shadow-xs">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E1D5] dark:border-[#2B3034] text-xs">
              <div className="flex items-center gap-2.5">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="text-[#7E7060] dark:text-[#B8B1A5] font-mono text-xs">{currentMatch.roundName}</span>
              </div>
              <span className="text-[#E74C3C] font-mono font-bold text-xs flex items-center gap-1.5 tracking-wider uppercase">
                <span className="live-dot" />
                <span>CURRENT MATCH IN PLAY</span>
              </span>
            </div>

            {/* Match Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4 py-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] uppercase font-bold tracking-widest block">Team 1</span>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                  {currentMatch.team1?.name || 'Athlete 1'}
                </h3>
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-[#F4EFE6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] text-xs font-mono font-bold text-[#4A4238] dark:text-[#F5F1E8] flex items-center justify-center mx-auto shadow-inner">
                  VS
                </div>
                <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] uppercase font-semibold mt-1.5 block font-mono tracking-wider">
                  Match #{currentMatch.matchNumber}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#7E7060] dark:text-[#B8B1A5] uppercase font-bold tracking-widest block">Team 2</span>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                  {currentMatch.team2?.name || 'Athlete 2'}
                </h3>
              </div>
            </div>

            {/* Sequential Up Next Queue */}
            {upcomingQueue.length > 0 && (
              <div className="pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#7E7060] dark:text-[#B8B1A5] uppercase font-mono">
                  <span>UP NEXT IN QUEUE</span>
                  <span>Sequential Main Board Order</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {upcomingQueue.map((qMatch, qIdx) => (
                    <div
                      key={qMatch._id}
                      className="p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs font-mono"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-[#7E7060] dark:text-[#817B72] block">Q#{qIdx + 1} · {qMatch.category?.replace('_', ' ')}</span>
                        <p className="font-bold text-[#3E342B] dark:text-[#F5F1E8] truncate">
                          {qMatch.team1?.name} vs {qMatch.team2?.name}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white dark:bg-[#121517] text-[#7E7060] dark:text-[#B8B1A5] border border-[#E8E1D5] dark:border-[#2B3034] font-bold shrink-0">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="editorial-card p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#F4EFE6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#2B3034] flex items-center justify-center mx-auto text-[#4A4238] dark:text-[#D4A94C]">
              <CarromCoin type="queen" size="sm" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#3E342B] dark:text-[#F5F1E8]">Main Carrom Board Ready</h3>
            <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] max-w-md mx-auto">
              Live tournament matches will be broadcast sequentially on the Main Carrom Board once draw matches commence.
            </p>
          </div>
        )}
      </section>

      {/* 4. TOURNAMENT CATEGORIES (5 REAL DIVISIONS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8E1D5] dark:border-[#2B3034] pb-4">
          <div>
            <span className="eyebrow-label">Official Divisions</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
              Championship Categories
            </h2>
          </div>
          <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] font-mono">5 divisions with flat carrom coin visual treatment</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat) => {
            const catStat = stats?.categories?.[cat.id];

            return (
              <div
                key={cat.id}
                className="editorial-card p-6 flex flex-col justify-between space-y-5 rounded-2xl transition-all"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <CategoryCoinPair category={cat.id} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7E7060] dark:text-[#B8B1A5] bg-[#FAF9F6] dark:bg-[#181C1F] px-2 py-0.5 rounded border border-[#E8E1D5] dark:border-[#2B3034]">
                      {catStat?.teams || 0} Entries
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#3E342B] dark:text-[#F5F1E8] leading-snug">{cat.name}</h3>
                  <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed line-clamp-3">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E8E1D5] dark:border-[#2B3034] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">Knockout Tree</span>
                  <Link
                    href={`/brackets?category=${cat.id}`}
                    className="text-[#E74C3C] hover:underline font-bold flex items-center gap-1 text-xs"
                  >
                    <span>View Bracket</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. TOURNAMENT FORMAT (PREMIUM CONNECTED TIMELINE) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="editorial-card p-8 sm:p-10 lg:p-12 space-y-10 rounded-3xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
            <div>
              <span className="eyebrow-label">Championship Protocol</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
                Tournament Format
              </h2>
            </div>
            <Link
              href="/rules"
              className="btn-secondary text-xs font-bold py-2.5 px-4"
            >
              <span>View Official Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Connected Process Timeline */}
          <div className="relative pt-2 sm:pt-4">
            {/* Desktop & Tablet: Horizontal Connected Journey */}
            <div className="hidden md:grid md:grid-cols-4 gap-6 lg:gap-8 relative">
              {FORMAT_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.step} className="relative flex flex-col items-start space-y-4">
                    {/* Node and Segment Connector */}
                    <div className="relative w-full flex items-center">
                      {/* Connecting Line Segment to Next Stage */}
                      {idx < FORMAT_STAGES.length - 1 && (
                        <div
                          className={`hidden md:block absolute top-6 left-12 right-[-1.5rem] lg:right-[-2rem] h-[1.5px] pointer-events-none z-0 ${
                            idx === 2
                              ? 'bg-gradient-to-r from-[#D5C4A1] via-[#E8E1D5] to-[#E74C3C] dark:from-[#3D444A] dark:via-[#2B3034] dark:to-[#E74C3C]'
                              : 'bg-[#E8E1D5] dark:bg-[#2B3034]'
                          }`}
                        >
                          {/* Subtle Carrom Baseline Dot Marker at Segment Center */}
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D5C4A1] dark:bg-[#3D444A]" />
                        </div>
                      )}

                      {/* Wayfinding Node Circle */}
                      <div className="relative z-10">
                        {stage.isFinal ? (
                          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1B2024] border-2 border-[#E74C3C] text-[#E74C3C] flex items-center justify-center shadow-xs">
                            {/* Concentric Queen Circle Marker */}
                            <div className="w-[78%] h-[78%] rounded-full border border-[#E74C3C]/30 pointer-events-none absolute" />
                            <div className="absolute -inset-1.5 rounded-full border border-[#E74C3C]/20 pointer-events-none" />
                            <span className="font-serif font-bold text-base text-[#E74C3C] tracking-tight">{stage.step}</span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#3D444A] text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-center shadow-xs">
                            {/* Concentric Carrom Guide Ring */}
                            <div className="w-[78%] h-[78%] rounded-full border border-[#D5C4A1]/40 dark:border-[#3D444A]/50 pointer-events-none absolute" />
                            <span className="font-serif font-bold text-base tracking-tight">{stage.step}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stage Details */}
                    <div className="space-y-2 text-left pt-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${stage.isFinal ? 'text-[#E74C3C]' : 'text-[#7E7060] dark:text-[#B8B1A5] opacity-75'}`} />
                        <h3 className={`font-serif font-bold text-base tracking-wide uppercase ${stage.isFinal ? 'text-[#E74C3C]' : 'text-[#3E342B] dark:text-[#F5F1E8]'}`}>
                          {stage.title}
                        </h3>
                      </div>
                      <p className="text-xs lg:text-[13px] text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed font-sans pr-2">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Vertical Connected Timeline */}
            <div className="md:hidden flex flex-col relative pl-2">
              {/* Continuous vertical connector line */}
              <div className="absolute top-6 bottom-6 left-[1.65rem] w-[1.5px] bg-gradient-to-b from-[#D5C4A1] via-[#E8E1D5] to-[#E74C3C] dark:from-[#3D444A] dark:via-[#2B3034] dark:to-[#E74C3C] pointer-events-none" />

              <div className="space-y-8 relative z-10">
                {FORMAT_STAGES.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <div key={stage.step} className="relative flex items-start gap-4">
                      {/* Node */}
                      <div className="relative shrink-0">
                        {stage.isFinal ? (
                          <div className="w-11 h-11 rounded-full bg-white dark:bg-[#1B2024] border-2 border-[#E74C3C] text-[#E74C3C] flex items-center justify-center shadow-xs">
                            <div className="w-[78%] h-[78%] rounded-full border border-[#E74C3C]/30 pointer-events-none absolute" />
                            <div className="absolute -inset-1 rounded-full border border-[#E74C3C]/20 pointer-events-none" />
                            <span className="font-serif font-bold text-sm text-[#E74C3C]">{stage.step}</span>
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#D5C4A1] dark:border-[#3D444A] text-[#3E342B] dark:text-[#F5F1E8] flex items-center justify-center shadow-xs">
                            <div className="w-[78%] h-[78%] rounded-full border border-[#D5C4A1]/40 dark:border-[#3D444A]/50 pointer-events-none absolute" />
                            <span className="font-serif font-bold text-sm">{stage.step}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5 pt-1 text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${stage.isFinal ? 'text-[#E74C3C]' : 'text-[#7E7060] dark:text-[#B8B1A5] opacity-75'}`} />
                          <h3 className={`font-serif font-bold text-base tracking-wide uppercase ${stage.isFinal ? 'text-[#E74C3C]' : 'text-[#3E342B] dark:text-[#F5F1E8]'}`}>
                            {stage.title}
                          </h3>
                        </div>
                        <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


