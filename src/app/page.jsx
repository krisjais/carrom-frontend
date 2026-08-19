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
  Play
} from 'lucide-react';
import { StatusBadge, CategoryBadge, MainBoardBadge } from '@/components/ui/Badge';
import {
  CarromCoin,
  CategoryCoinPair,
  CarromHeroArt,
  CarromBoardGeometry
} from '@/components/ui/CarromElements';

export default function HomePage() {
  const [stats, setStats] = useState(null);
  const [liveData, setLiveData] = useState({ liveMatches: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, liveRes, annRes] = await Promise.all([
          api.getOverviewStats(),
          api.getLiveMatches(),
          api.getAnnouncements()
        ]);
        if (statsRes.success) setStats(statsRes.stats);
        if (liveRes.success) setLiveData(liveRes);
        if (annRes.success) setAnnouncements(annRes.announcements?.slice(0, 3) || []);
      } catch (err) {
        console.error('Home data load error:', err);
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
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-[#E8E1D5] dark:border-[#2B3034] bg-[#FAF9F6] dark:bg-[#0B0D0E]">
        {/* Subtle arena spotlight in night mode */}
        <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(circle_at_50%_35%,rgba(212,169,76,0.08),transparent_55%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Editorial Statement & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left animate-in fade-in duration-500">
            {/* Small Eyebrow */}
            <div className="space-y-0.5">
              <span className="eyebrow-label">
                CARROMPRO
              </span>
              <p className="text-xs font-mono font-bold tracking-[0.2em] text-[#7E7060] dark:text-[#B8B1A5] uppercase">
                COLLEGE CARROM CHAMPIONSHIP 2026
              </p>
            </div>

            {/* Large Editorial Headline in Playfair Display */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-black tracking-tight text-[#3E342B] dark:text-[#F5F1E8] leading-[1.05]">
              THE MODERN <br />
              <span className="italic font-normal">CARROM LEAGUE.</span> <br />
              <span className="text-[#E74C3C]">SKILL & STRATEGY.</span>
            </h1>

            {/* Supporting Text */}
            <p className="text-sm sm:text-base text-[#7E7060] dark:text-[#B8B1A5] max-w-xl font-normal leading-relaxed">
              The premier collegiate carrom tournament standard. Single-game dynamic knockout draws, sequential scheduling on the single Main Carrom Board, and verified student athlete rosters.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
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

      {/* 5. TOURNAMENT FORMAT (01 - 04 CONNECTED TIMELINE) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="editorial-card p-8 sm:p-10 space-y-8 rounded-3xl border border-[#E8E1D5] dark:border-[#2B3034] bg-white dark:bg-[#121517]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E1D5] dark:border-[#2B3034]">
            <div>
              <span className="eyebrow-label">Championship Protocol</span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">
                Tournament Format
              </h2>
            </div>
            <Link
              href="/rules"
              className="btn-secondary text-xs font-bold"
            >
              <span>View Official Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Connected 01-04 Sequence with Thin Timeline */}
          <div className="relative">
            {/* Desktop Thin Timeline Connector */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-[1px] bg-[#D5C4A1] dark:bg-[#2B3034] pointer-events-none" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Step 01 */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1B2024] border border-[#D5C4A1] dark:border-[#D4A94C] text-[#3E342B] dark:text-[#D4A94C] flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                  01
                </div>
                <h4 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">REGISTER</h4>
                <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
                  Athletes submit entries with mandatory Student ID and partner nominations for doubles events.
                </p>
              </div>

              {/* Step 02 */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1B2024] border border-[#D5C4A1] dark:border-[#D4A94C] text-[#3E342B] dark:text-[#D4A94C] flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                  02
                </div>
                <h4 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">APPROVAL</h4>
                <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
                  Administrators verify student credentials and mutual partner requests, then lock approved rosters.
                </p>
              </div>

              {/* Step 03 */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1B2024] border border-[#D5C4A1] dark:border-[#D4A94C] text-[#3E342B] dark:text-[#D4A94C] flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                  03
                </div>
                <h4 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8]">DRAW</h4>
                <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
                  Single-game knockout brackets are generated with strict random pairing and mathematical bye logic.
                </p>
              </div>

              {/* Step 04 */}
              <div className="p-6 rounded-2xl bg-[#FAF9F6] dark:bg-[#181C1F] border border-[#E8E1D5] dark:border-[#2B3034] space-y-2.5">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1B2024] border border-[#E74C3C] text-[#E74C3C] flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                  04
                </div>
                <h4 className="font-serif font-bold text-base text-[#E74C3C]">COMPETE</h4>
                <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] leading-relaxed">
                  Matches queue sequentially on the single Main Carrom Board with live score updates until champions are crowned.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. LATEST ANNOUNCEMENTS */}
      {announcements.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8E1D5] dark:border-[#2B3034] pb-4">
            <div>
              <span className="eyebrow-label">Championship Bulletin</span>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3E342B] dark:text-[#F5F1E8] mt-1">Notice Board</h2>
            </div>
            <Link
              href="/announcements"
              className="text-xs font-bold text-[#E74C3C] hover:underline flex items-center gap-1 uppercase tracking-wider"
            >
              <span>All Bulletins</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {announcements.map((ann) => (
              <div key={ann._id} className="editorial-card p-6 space-y-3 rounded-2xl">
                <div className="flex items-center justify-between text-[11px] text-[#7E7060] dark:text-[#817B72] font-mono">
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                  {ann.priority === 'urgent' && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FDEDEC] dark:bg-[#E74C3C]/15 text-[#E74C3C] font-bold uppercase text-[9px] border border-[#E74C3C]/30">
                      Urgent
                    </span>
                  )}
                </div>
                <h4 className="font-serif font-bold text-base text-[#3E342B] dark:text-[#F5F1E8] leading-snug">{ann.title}</h4>
                <p className="text-xs text-[#7E7060] dark:text-[#B8B1A5] line-clamp-2 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


