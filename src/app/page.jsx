'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Shuffle,
  Radio
} from 'lucide-react';
import { StatusBadge, CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';
import {
  CarromCoin,
  CategoryCoinPair
} from '@/components/ui/CarromElements';

const FORMAT_STAGES = [
  {
    step: '01',
    title: 'REGISTER',
    icon: UserPlus,
    description: 'Athletes submit collegiate entries with department verification and mutual partner nominations.',
    isFinal: false,
  },
  {
    step: '02',
    title: 'APPROVAL',
    icon: ShieldCheck,
    description: 'Tournament committee verifies athlete credentials and locks approved category team rosters.',
    isFinal: false,
  },
  {
    step: '03',
    title: 'DRAW',
    icon: Shuffle,
    description: 'Single-game knockout brackets generated with strict random draws and mathematical bye rules.',
    isFinal: false,
  },
  {
    step: '04',
    title: 'COMPETE',
    icon: Trophy,
    description: 'Sequential matches on the single Main Carrom Board with live score updates until champions emerge.',
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
    <div className="flex-1 flex flex-col space-y-16 sm:space-y-24 pb-24 overflow-hidden bg-[#F4F0E6] dark:bg-[#0F0E0D] text-[#171614] dark:text-[#F7F4EC] transition-colors duration-200">
      {/* 1. EDITORIAL CARROM HERO SECTION */}
      <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-20 border-b border-[#DCD6C8] dark:border-[#2E2B26]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Statement & Action Buttons */}
            <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6 sm:space-y-7">
              {/* Eyebrow Label */}
              <div className="flex items-center gap-2">
                <span className="eyebrow-label">
                  INTER-COLLEGIATE CHAMPIONSHIP 2026
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#D93829]" />
                <span className="text-[10px] font-mono text-[#6F6A60] dark:text-[#A39C8F] font-bold uppercase">
                  MAIN ARENA
                </span>
              </div>

              {/* Large Serif Editorial Headline */}
              <div className="space-y-1">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-serif font-black tracking-tight text-[#171614] dark:text-[#F7F4EC] leading-[0.98]">
                  CARROM
                </h1>
                <p className="text-2xl sm:text-4xl lg:text-5xl font-serif italic text-[#6F6A60] dark:text-[#A39C8F] tracking-tight font-normal">
                  Play. Compete. Connect.
                </p>
              </div>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-[#6F6A60] dark:text-[#A39C8F] max-w-xl font-normal leading-relaxed text-left font-sans">
                The official tournament platform for collegiate carrom athletics. Single-game knockout brackets, sequential matches on the single Main Carrom Board, and verified student athlete rosters.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  href="/registration"
                  className="btn-primary text-xs sm:text-sm font-bold tracking-wider px-8 py-3.5 shadow-sm"
                >
                  <span>JOIN / REGISTER</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/live"
                  className="btn-secondary text-xs sm:text-sm font-bold tracking-wider px-7 py-3.5 flex items-center gap-2"
                >
                  <span className="live-dot" />
                  <span>WATCH LIVE</span>
                </Link>
                <Link
                  href="/tournament"
                  className="px-5 py-3.5 text-xs font-bold text-[#6F6A60] dark:text-[#A39C8F] hover:text-[#171614] dark:hover:text-white uppercase tracking-wider transition-colors font-mono"
                >
                  View Details →
                </Link>
              </div>
            </div>

            {/* Right Column: High-Res Editorial Photography Card Matching Reference */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-[#DCD6C8] dark:border-[#2E2B26] shadow-xl bg-[#F7F4EC] dark:bg-[#171614] p-3 group">
                <div className="relative h-72 sm:h-96 w-full rounded-2xl overflow-hidden bg-[#FAF7F0] dark:bg-[#1D1C19]">
                  <Image
                    src="/carrom_striker_coins_hero.jpg"
                    alt="Championship Carrom Striker and Coins"
                    fill
                    priority
                    className="object-cover object-center group-hover:scale-103 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 550px"
                  />
                  
                  {/* Handwritten Editorial Script (Matching Reference: 'Good Shots Great People') */}
                  <div className="absolute top-4 right-4 text-right pointer-events-none drop-shadow-sm select-none">
                    <span className="font-serif italic font-normal text-xl sm:text-2xl text-[#857B6C] dark:text-[#C5BCAC] leading-none block transform rotate-[-8deg]">
                      Good Shots
                    </span>
                    <span className="font-serif italic font-normal text-lg sm:text-xl text-[#857B6C] dark:text-[#C5BCAC] leading-tight block transform rotate-[-6deg] mr-2">
                      Great People
                    </span>
                  </div>

                  {/* Carousel Indicator Dots from Reference */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-1.5 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171614] dark:bg-white" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171614]/30 dark:bg-white/30" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171614]/30 dark:bg-white/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TOURNAMENT STATISTICS (Compact Premium Cards) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-8 sm:-mt-12 relative z-20">
        <div className="scoreboard-strip p-6 sm:p-8 bg-[#FFFFFF] dark:bg-[#171614] border border-[#DCD6C8] dark:border-[#2E2B26] rounded-2xl shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[#DCD6C8] dark:divide-[#2E2B26] text-center">
            {/* Stat 1: Registered Athletes */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#171614] dark:text-[#F7F4EC]">
                {stats?.totalParticipants || 250}+
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#6F6A60] dark:text-[#A39C8F] font-sans font-bold uppercase tracking-[0.18em]">
                Registered Athletes
              </p>
            </div>

            {/* Stat 2: Divisions */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#171614] dark:text-[#F7F4EC]">
                5
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#6F6A60] dark:text-[#A39C8F] font-sans font-bold uppercase tracking-[0.18em]">
                Championship Divisions
              </p>
            </div>

            {/* Stat 3: Main Board */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#D93829] flex items-center justify-center gap-2">
                <span className="live-dot" />
                <span>1</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#6F6A60] dark:text-[#A39C8F] font-sans font-bold uppercase tracking-[0.18em]">
                Main Carrom Board
              </p>
            </div>

            {/* Stat 4: Matches */}
            <div className="p-4 sm:p-2 space-y-1">
              <div className="text-3xl sm:text-4xl font-serif font-black text-[#171614] dark:text-[#C2A268]">
                {stats?.completedMatches !== undefined ? `${stats.completedMatches} Won` : 'Knockout'}
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#6F6A60] dark:text-[#A39C8F] font-sans font-bold uppercase tracking-[0.18em]">
                Match Progression
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CARROM BOARD LIVE SPOTLIGHT & QUEUE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="flex items-center justify-between border-b border-[#DCD6C8] dark:border-[#2E2B26] pb-4">
          <div className="space-y-0.5">
            <span className="eyebrow-label">ARENA CONTROL</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC] flex items-center gap-2.5">
              <span>MAIN CARROM BOARD</span>
              {currentMatch && <span className="live-dot" />}
            </h2>
          </div>
          <Link
            href="/live"
            className="text-xs font-bold text-[#D93829] hover:underline flex items-center gap-1 uppercase tracking-wider font-mono"
          >
            <span>Live Arena Broadcast</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {currentMatch ? (
          <div className="editorial-card p-6 sm:p-8 space-y-6 border border-[#C5BCAC] dark:border-[#2E2B26] shadow-sm">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#DCD6C8] dark:border-[#2E2B26] text-xs">
              <div className="flex items-center gap-2.5">
                <MainBoardBadge />
                <CategoryBadge category={currentMatch.category} />
                <span className="text-[#6F6A60] dark:text-[#A39C8F] font-mono text-xs">{currentMatch.roundName}</span>
              </div>
              <span className="text-[#D93829] font-mono font-bold text-xs flex items-center gap-1.5 tracking-wider uppercase">
                <span className="live-dot" />
                <span>CURRENT MATCH IN PLAY</span>
              </span>
            </div>

            {/* Head to Head */}
            <div className="grid grid-cols-3 items-center text-center gap-4 py-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#6F6A60] dark:text-[#A39C8F] uppercase font-bold tracking-widest block">Team 1</span>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC] truncate">
                  {currentMatch.team1?.name || 'Athlete 1'}
                </h3>
              </div>

              <div>
                <div className="w-12 h-12 rounded-full bg-[#F4F0E6] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] text-xs font-mono font-bold text-[#171614] dark:text-[#F7F4EC] flex items-center justify-center mx-auto shadow-inner">
                  VS
                </div>
                <span className="text-[10px] text-[#6F6A60] dark:text-[#A39C8F] uppercase font-semibold mt-1.5 block font-mono tracking-wider">
                  Match #{currentMatch.matchNumber}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-[#6F6A60] dark:text-[#A39C8F] uppercase font-bold tracking-widest block">Team 2</span>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC] truncate">
                  {currentMatch.team2?.name || 'Athlete 2'}
                </h3>
              </div>
            </div>

            {/* Sequential Up Next Queue */}
            {upcomingQueue.length > 0 && (
              <div className="pt-4 border-t border-[#DCD6C8] dark:border-[#2E2B26] space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#6F6A60] dark:text-[#A39C8F] uppercase font-mono">
                  <span>UP NEXT IN QUEUE</span>
                  <span>Sequential Main Board Order</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {upcomingQueue.map((qMatch, qIdx) => (
                    <div
                      key={qMatch._id}
                      className="p-3.5 rounded-xl bg-[#F7F4EC] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] flex items-center justify-between text-xs font-mono"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-[#6F6A60] dark:text-[#A39C8F] block">Q#{qIdx + 1} · {qMatch.category?.replace('_', ' ')}</span>
                        <p className="font-bold text-[#171614] dark:text-[#F7F4EC] truncate mt-0.5">
                          {qMatch.team1?.name} vs {qMatch.team2?.name}
                        </p>
                      </div>
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#FFFFFF] dark:bg-[#171614] text-[#171614] dark:text-[#F7F4EC] border border-[#DCD6C8] dark:border-[#2E2B26] font-bold shrink-0">
                        Ready
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="editorial-card p-8 sm:p-10 text-center space-y-3.5 border border-[#DCD6C8] dark:border-[#2E2B26]">
            <div className="w-12 h-12 rounded-full bg-[#F4F0E6] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] flex items-center justify-center mx-auto text-[#171614] dark:text-[#C2A268]">
              <CarromCoin type="queen" size="sm" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#171614] dark:text-[#F7F4EC]">Main Carrom Board Ready</h3>
            <p className="text-xs text-[#6F6A60] dark:text-[#A39C8F] max-w-md mx-auto leading-relaxed">
              The championship board is currently free. Official matches broadcast sequentially once draw fixtures commence.
            </p>
          </div>
        )}
      </section>

      {/* 4. TOURNAMENT CATEGORIES (5 REAL DIVISIONS) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#DCD6C8] dark:border-[#2E2B26] pb-4">
          <div>
            <span className="eyebrow-label">OFFICIAL DIVISIONS</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC] mt-1">
              Championship Categories
            </h2>
          </div>
          <p className="text-xs text-[#6F6A60] dark:text-[#A39C8F] font-mono">5 collegiate knockout divisions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat, idx) => {
            const catStat = stats?.categories?.[cat.id];

            return (
              <div
                key={cat.id}
                className="editorial-card p-6 flex flex-col justify-between space-y-5 rounded-2xl transition-all hover:border-[#171614] dark:hover:border-[#C2A268]"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-serif font-bold text-[#6F6A60] dark:text-[#A39C8F]">
                      0{idx + 1}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#171614] dark:text-[#F7F4EC] bg-[#F7F4EC] dark:bg-[#1D1C19] px-2.5 py-0.5 rounded-full border border-[#DCD6C8] dark:border-[#2E2B26]">
                      {catStat?.teams || 0} Entries
                    </span>
                  </div>
                  <div className="pt-1">
                    <CategoryCoinPair category={cat.id} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#171614] dark:text-[#F7F4EC] leading-snug">{cat.name}</h3>
                  <p className="text-xs text-[#6F6A60] dark:text-[#A39C8F] leading-relaxed line-clamp-3">
                    {cat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#DCD6C8] dark:border-[#2E2B26] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[#6F6A60] dark:text-[#A39C8F] font-mono">Knockout</span>
                  <Link
                    href={`/brackets?category=${cat.id}`}
                    className="text-[#171614] dark:text-[#F7F4EC] hover:text-[#D93829] dark:hover:text-[#C2A268] font-bold flex items-center gap-1 text-xs uppercase tracking-wider font-mono"
                  >
                    <span>Bracket</span>
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
        <div className="editorial-card p-8 sm:p-10 lg:p-12 space-y-10 rounded-3xl border border-[#DCD6C8] dark:border-[#2E2B26] bg-[#FFFFFF] dark:bg-[#171614]">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#DCD6C8] dark:border-[#2E2B26]">
            <div>
              <span className="eyebrow-label">CHAMPIONSHIP PROTOCOL</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#171614] dark:text-[#F7F4EC] mt-1">
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
            {/* Desktop & Tablet: Horizontal Journey */}
            <div className="hidden md:grid md:grid-cols-4 gap-6 lg:gap-8 relative">
              {FORMAT_STAGES.map((stage, idx) => {
                const Icon = stage.icon;
                return (
                  <div key={stage.step} className="relative flex flex-col items-start space-y-4">
                    {/* Node and Segment Connector */}
                    <div className="relative w-full flex items-center">
                      {idx < FORMAT_STAGES.length - 1 && (
                        <div
                          className="hidden md:block absolute top-6 left-12 right-[-1.5rem] lg:right-[-2rem] h-[1.5px] pointer-events-none z-0 bg-[#DCD6C8] dark:bg-[#2E2B26]"
                        >
                          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#C5BCAC] dark:bg-[#38342E]" />
                        </div>
                      )}

                      <div className="relative z-10">
                        {stage.isFinal ? (
                          <div className="w-12 h-12 rounded-full bg-[#171614] dark:bg-[#F7F4EC] text-[#F7F4EC] dark:text-[#171614] flex items-center justify-center shadow-xs">
                            <span className="font-serif font-bold text-base tracking-tight">{stage.step}</span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#F4F0E6] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] text-[#171614] dark:text-[#F7F4EC] flex items-center justify-center shadow-xs">
                            <span className="font-serif font-bold text-base tracking-tight">{stage.step}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stage Details */}
                    <div className="space-y-2 text-left pt-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${stage.isFinal ? 'text-[#D93829]' : 'text-[#6F6A60] dark:text-[#A39C8F]'}`} />
                        <h3 className={`font-serif font-bold text-base tracking-wide uppercase ${stage.isFinal ? 'text-[#D93829]' : 'text-[#171614] dark:text-[#F7F4EC]'}`}>
                          {stage.title}
                        </h3>
                      </div>
                      <p className="text-xs lg:text-[13px] text-[#6F6A60] dark:text-[#A39C8F] leading-relaxed font-sans pr-2">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile: Vertical Timeline */}
            <div className="md:hidden flex flex-col relative pl-2">
              <div className="absolute top-6 bottom-6 left-[1.65rem] w-[1.5px] bg-[#DCD6C8] dark:bg-[#2E2B26] pointer-events-none" />

              <div className="space-y-8 relative z-10">
                {FORMAT_STAGES.map((stage) => {
                  const Icon = stage.icon;
                  return (
                    <div key={stage.step} className="relative flex items-start gap-4">
                      <div className="relative shrink-0">
                        {stage.isFinal ? (
                          <div className="w-11 h-11 rounded-full bg-[#171614] dark:bg-[#F7F4EC] text-[#F7F4EC] dark:text-[#171614] flex items-center justify-center shadow-xs">
                            <span className="font-serif font-bold text-sm">{stage.step}</span>
                          </div>
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-[#F4F0E6] dark:bg-[#1D1C19] border border-[#DCD6C8] dark:border-[#2E2B26] text-[#171614] dark:text-[#F7F4EC] flex items-center justify-center shadow-xs">
                            <span className="font-serif font-bold text-sm">{stage.step}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 pt-1 text-left min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${stage.isFinal ? 'text-[#D93829]' : 'text-[#6F6A60] dark:text-[#A39C8F]'}`} />
                          <h3 className={`font-serif font-bold text-base tracking-wide uppercase ${stage.isFinal ? 'text-[#D93829]' : 'text-[#171614] dark:text-[#F7F4EC]'}`}>
                            {stage.title}
                          </h3>
                        </div>
                        <p className="text-xs text-[#6F6A60] dark:text-[#A39C8F] leading-relaxed">
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


